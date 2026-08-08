"use client";

import { useMemo, useState } from "react";
import { generateDestination } from "@/lib/ai-destination";
import { saveGeneratedDestination } from "@/lib/destination-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/destinations";

type ChatItem = { role: "user" | "assistant"; text: string };

export function DestinationChat() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDestination, setLastDestination] = useState<Destination | null>(null);

  const messages = useMemo(
    () => [...history, ...(busy ? [{ role: "assistant", text: "Generating a destination..." }] : [])],
    [history, busy],
  );

  const submit = async () => {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setError(null);
    setHistory((h) => [...h, { role: "user", text: prompt }]);
    setInput("");
    setBusy(true);

    try {
      const result = await generateDestination({ data: { prompt } });
      const destination = result.destination as Destination;
      saveGeneratedDestination(destination);
      setLastDestination(destination);
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          text: `Suggested destination: ${destination.name}, ${destination.country}. ${destination.tagline}`,
        },
      ]);
    } catch (err) {
      setError((err as Error)?.message ?? "Unable to generate destination.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">AI Destination Generator</p>
          <p className="text-sm text-muted-foreground">
            Ask for a new destination and the AI will create it with an image and travel summary.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          New
        </span>
      </div>

      <ScrollArea className="max-h-64 rounded-3xl border border-border/70 bg-background/80 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tell me what you'd like to simulate and I will suggest a destination.</p>
          ) : null}
          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                item.role === "user" ? "bg-primary/10 text-primary" : "bg-muted/80 text-foreground",
              )}
            >
              {item.text}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ask for a destination by mood, season, price, or experience..."
            className="min-h-[4.5rem]"
          />
        </div>
        <Button
          onClick={submit}
          disabled={busy || !input.trim()}
          className="inline-flex items-center justify-center rounded-full px-5 py-3"
        >
          {busy ? <Loader2 className="mr-2 animate-spin size-4" /> : <ArrowRight className="mr-2 size-4" />}
          Generate
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {lastDestination ? (
        <div className="mt-5 rounded-3xl border border-border/70 bg-background/80 p-4">
          <p className="text-sm font-semibold">Added to destinations</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lastDestination.name}, {lastDestination.country} has been generated and saved to the destinations page.
          </p>
        </div>
      ) : null}
    </div>
  );
}

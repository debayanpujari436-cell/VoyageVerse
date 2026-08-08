"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { generateDestination } from "@/lib/ai-destination";
import { buildSimulation, defaultInput } from "@/lib/sim-engine";
import { saveGeneratedDestination } from "@/lib/destination-store";
import { saveSimulation } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/destinations";

type ChatItem = { role: "user" | "assistant"; content: string };

type GeneratedDestination = Destination & {
  image: string;
  why: string;
  estimatedBudget: string;
  recommendedDuration: string;
  activities: string[];
  itinerary: string[];
};

export function DestinationChat() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeneratedDestination[]>([]);

  const messages = useMemo(
    () => [...history, ...(busy ? [{ role: "assistant", content: "Thinking through your destination options..." }] : [])],
    [history, busy],
  );

  const submit = async () => {
    const prompt = input.trim();
    if (!prompt || busy) return;

    const userMessage = { role: "user" as const, content: prompt };
    setError(null);
    setHistory((h) => [...h, userMessage]);
    setInput("");
    setSuggestions([]);
    setBusy(true);

    try {
      const result = await generateDestination({ data: { history: [...history, userMessage] } });
      const assistantMessages: ChatItem[] = [];

      if (result.questions?.length) {
        assistantMessages.push(
          ...result.questions.map((question) => ({ role: "assistant" as const, content: question })),
        );
      }

      if (result.suggestions?.length) {
        assistantMessages.push({
          role: "assistant",
          content: `I have three unique destinations ready. Pick one to generate your simulated vacation.`,
        });

        result.suggestions.forEach((destination) => saveGeneratedDestination(destination));
        setSuggestions(result.suggestions);
      }

      setHistory((h) => [...h, ...assistantMessages]);
    } catch (err) {
      setError((err as Error)?.message ?? "Unable to generate destination.");
    } finally {
      setBusy(false);
    }
  };

  const selectSuggestion = async (destination: GeneratedDestination) => {
    setBusy(true);
    try {
      const selection = defaultInput(`${destination.name}, ${destination.country}`);
      const days = Number(destination.recommendedDuration.match(/\d+/)?.[0] ?? selection.days);
      const budget = Number((destination.estimatedBudget.match(/[\d,]+/)?.[0] ?? `${selection.budget}`).replace(/,/g, ""));

      selection.days = Math.max(1, days);
      selection.budget = Math.max(1, budget);
      selection.interests = destination.tags.slice(0, 3);
      selection.style = "Balanced";
      selection.accommodation = "Boutique hotel";
      selection.transport = "Public transport";
      selection.food = "Local food";
      selection.companions = "Couple";
      selection.pace = "Balanced";
      selection.currency = "USD";

      const simulation = buildSimulation(selection, undefined, destination);
      saveSimulation(simulation);
      navigate({ to: "/trip/$tripId", params: { tripId: simulation.id } });
    } catch (err) {
      setError((err as Error)?.message ?? "Unable to create simulation.");
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
            Give your preferences, answer a few follow-up questions, then choose one destination for simulation.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          New
        </span>
      </div>

      <ScrollArea className="max-h-72 rounded-3xl border border-border/70 bg-background/80 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tell me what kind of trip experience you want and I’ll ask the right follow-up questions.
            </p>
          ) : null}
          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                item.role === "user" ? "bg-primary/10 text-primary" : "bg-muted/80 text-foreground",
              )}
            >
              {item.content}
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
            placeholder="I want something adventurous, low-budget, and unusual..."
            className="min-h-[4.5rem]"
          />
        </div>
        <Button
          onClick={submit}
          disabled={busy || !input.trim()}
          className="inline-flex items-center justify-center rounded-full px-5 py-3"
        >
          {busy ? <Loader2 className="mr-2 animate-spin size-4" /> : <ArrowRight className="mr-2 size-4" />}
          {busy ? "Working..." : "Send"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {suggestions.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-base font-semibold">Pick one of these unusual destinations</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {suggestions.map((destination) => (
              <article key={destination.slug} className="overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm">
                <div className="relative overflow-hidden">
                  <img
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country}`}
                    className="h-40 w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{destination.country}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{destination.season}</span>
                  </div>
                  <h4 className="mt-2 text-lg font-semibold">{destination.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{destination.tagline}</p>
                  <div className="mt-3 grid gap-2 text-sm">
                    <p>
                      <span className="font-semibold">Why it matches:</span> {destination.why}
                    </p>
                    <p>
                      <span className="font-semibold">Budget:</span> {destination.estimatedBudget}
                    </p>
                    <p>
                      <span className="font-semibold">Duration:</span> {destination.recommendedDuration}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <p className="font-semibold">Activities</p>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {destination.activities.slice(0, 4).map((activity) => (
                          <li key={activity}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Sample itinerary</p>
                      <ol className="list-decimal pl-5 text-muted-foreground">
                        {destination.itinerary.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <Button
                    onClick={() => void selectSuggestion(destination)}
                    disabled={busy}
                    className="mt-4 w-full rounded-full"
                  >
                    {busy ? "Creating trip…" : "Select destination"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

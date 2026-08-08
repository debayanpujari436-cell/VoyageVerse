import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Simulation } from "@/lib/sim-types";

const SUGGESTIONS = [
  "Can I reduce my budget?",
  "Suggest better restaurants",
  "Replace the museum with a beach",
  "Find hidden places",
  "How do I avoid crowds?",
  "Make the trip child-friendly",
  "Plan a honeymoon version",
  "Turn this into a luxury vacation",
];

export function AssistantDock({ simulation }: { simulation?: Simulation | null }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const context = useMemo(
    () =>
      simulation
        ? {
            destination: `${simulation.destinationName}, ${simulation.country}`,
            days: simulation.input.days,
            travelers: simulation.input.travelers,
            budget: `${simulation.input.budget} ${simulation.input.currency}`,
            style: simulation.input.style,
            interests: simulation.input.interests,
            itinerary: simulation.days.map((d) => `Day ${d.day}: ${d.summary}`),
          }
        : { note: "No simulation generated yet." },
    [simulation],
  );

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { context } }),
    [context],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [open, busy]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <>
      <Button
        onClick={() => setOpen((o) => !o)}
        size="lg"
        className="fixed bottom-5 right-5 z-50 h-14 gap-2 rounded-full px-5 shadow-xl"
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "AI assistant"}</span>
      </Button>

      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl transition-all duration-300 sm:right-5",
          "glass",
          open ? "pointer-events-auto h-[70vh] max-h-[560px] opacity-100" : "pointer-events-none h-0 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Travel assistant</p>
            <p className="truncate text-xs text-muted-foreground">
              {simulation ? `Tuning your ${simulation.destinationName} trip` : "Ask anything about your trip"}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  I can rework your itinerary, cut costs or find quieter alternatives. Try one:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-full border border-border/70 px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("")
                .trim();
              if (!text) return null;
              return (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl bg-primary px-3.5 py-2.5 text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {text}
                  </div>
                </div>
              );
            })}

            {status === "submitted" ? <p className="text-sm text-muted-foreground">Thinking…</p> : null}
            {error ? (
              <p className="text-sm text-destructive">Assistant unavailable right now. Please try again.</p>
            ) : null}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <form
          className="flex items-end gap-2 border-t border-border/50 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder="Ask about budget, crowds, food…"
            className="max-h-28 min-h-11 resize-none rounded-2xl"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0 rounded-2xl" disabled={busy}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
import { Check, Luggage } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { Progress } from "@/components/ui/progress";
import type { Simulation } from "@/lib/sim-types";
import { cn } from "@/lib/utils";

export function PackingPanel({ sim }: { sim: Simulation }) {
  const [done, setDone] = useState<string[]>([]);
  const all = sim.packing.flatMap((g) => g.items.map((i) => `${g.group}:${i}`));
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Luggage className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">Smart packing assistant</h3>
            <p className="truncate text-sm text-muted-foreground">
              Built from {sim.weatherSummary.toLowerCase()} weather and your {sim.input.style.toLowerCase()} style.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-52">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Packed</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </GlassCard>

      <div className="grid gap-5 sm:grid-cols-2">
        {sim.packing.map((group) => (
          <GlassCard key={group.group}>
            <h4 className="mb-3 font-semibold">{group.group}</h4>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const key = `${group.group}:${item}`;
                const checked = done.includes(key);
                return (
                  <li key={key}>
                    <button
                      onClick={() => setDone((d) => (checked ? d.filter((k) => k !== key) : [...d, key]))}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-md border",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {checked ? <Check className="size-3.5" /> : null}
                      </span>
                      <span className={cn("min-w-0 truncate", checked && "text-muted-foreground line-through")}>
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
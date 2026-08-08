import { Clock, Footprints, Star, Users } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Simulation } from "@/lib/sim-types";
import { cn } from "@/lib/utils";

export function TimelinePanel({ sim }: { sim: Simulation }) {
  const [day, setDay] = useState(0);
  const active = sim.days[day] ?? sim.days[0];
  if (!active) return null;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sim.days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setDay(i)}
            className={cn(
              "shrink-0 rounded-2xl border px-4 py-3 text-left transition-colors",
              i === day ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent",
            )}
          >
            <div className="text-xs opacity-80">Day {d.day}</div>
            <div className="text-sm font-semibold">{d.date.slice(5)}</div>
          </button>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-display text-xl font-semibold">{active.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{active.summary}</p>
      </GlassCard>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {active.activities.map((a) => (
          <li key={a.id} className="relative">
            <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-primary ring-4 ring-background" />
            <GlassCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {a.time} · {a.slot} · {a.duration}
                  </div>
                  <h4 className="mt-1 text-base font-semibold">{a.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{a.why}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold">
                    {a.cost} {sim.input.currency}
                  </div>
                  <Badge variant="secondary" className="mt-1 rounded-full">
                    {a.category}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Meter icon={Users} label="Crowd" value={a.crowd} />
                <Meter icon={Star} label="Rating" value={a.rating * 20} caption={`${a.rating}★ · ${a.reviews} reviews`} />
                <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Footprints className="size-3.5" /> Travel
                  </div>
                  <div className="mt-1 font-semibold">
                    {a.distanceKm} km · {a.weather} {a.tempC}°C
                  </div>
                </div>
              </div>

              <p className="mt-4 rounded-xl border-l-2 border-primary/50 bg-primary/5 px-3 py-2 text-sm italic text-muted-foreground">
                “{a.reviewQuote}”
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {a.alternatives.map((alt) => (
                  <span key={alt} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    Swap: {alt}
                  </span>
                ))}
              </div>
            </GlassCard>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Meter({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  caption?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <Progress value={value} className="mt-2 h-1.5" />
      <div className="mt-1 text-xs font-medium">{caption ?? `${Math.round(value)}%`}</div>
    </div>
  );
}
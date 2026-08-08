import { Bed, Camera, Cross, Gem, Train, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import type { MapPin } from "@/lib/sim-types";
import { cn } from "@/lib/utils";

const KIND_META = {
  hotel: { icon: Bed, label: "Hotel", color: "bg-primary text-primary-foreground" },
  food: { icon: UtensilsCrossed, label: "Restaurants", color: "bg-[oklch(0.72_0.15_45)] text-white" },
  attraction: { icon: Camera, label: "Attractions", color: "bg-[oklch(0.62_0.16_190)] text-white" },
  gem: { icon: Gem, label: "Hidden gems", color: "bg-[oklch(0.6_0.2_310)] text-white" },
  hospital: { icon: Cross, label: "Hospitals", color: "bg-destructive text-destructive-foreground" },
  transport: { icon: Train, label: "Transport", color: "bg-[oklch(0.5_0.05_260)] text-white" },
} as const;

export function StylizedMap({ pins, routePoints }: { pins: MapPin[]; routePoints?: { x: number; y: number }[] }) {
  const [active, setActive] = useState<MapPin | null>(null);
  const route = routePoints?.length ? routePoints : pins.slice(0, 5).map((p) => ({ x: p.x, y: p.y }));
  const path = route.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/60 bg-sky-tint sm:aspect-[16/9]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M6 0 L0 0 0 6" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-border" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <path d="M0 68 Q 25 60 44 72 T 100 66 L100 100 L0 100 Z" className="fill-primary/10" />
          <path d="M-5 30 Q 20 40 40 28 T 105 34" className="stroke-primary/25" strokeWidth="4" fill="none" />
          <path d={path} className="stroke-primary" strokeWidth="0.8" strokeDasharray="2 1.6" fill="none" />
        </svg>

        {pins.map((p) => {
          const meta = KIND_META[p.kind];
          const Icon = meta.icon;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-transform hover:scale-110",
                meta.color,
                active?.id === p.id && "ring-4 ring-primary/30",
              )}
              aria-label={p.label}
            >
              <Icon className="size-3.5" />
            </button>
          );
        })}

        {active ? (
          <div className="glass absolute bottom-3 left-3 right-3 rounded-2xl px-4 py-3 sm:right-auto sm:max-w-xs">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{KIND_META[active.kind].label}</p>
            <p className="text-sm font-semibold">{active.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.round(Math.abs(active.x - 50) / 4 + 3)} min walk from your hotel · open today
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(KIND_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2.5 rounded-full", meta.color)} />
            {meta.label}
          </span>
        ))}
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "@/lib/destinations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Destinations — VoyageVerse" },
      {
        name: "description",
        content: "Compare up to three destinations side by side on cost, safety, food, weather and crowds.",
      },
      { property: "og:title", content: "Compare Destinations Side by Side" },
      { property: "og:description", content: "Cost, safety, food, weather and crowds — one honest table." },
    ],
  }),
  component: ComparePage,
});

const METRICS = [
  ["weather", "Weather"],
  ["food", "Food"],
  ["safety", "Safety"],
  ["transport", "Transport"],
  ["nightlife", "Nightlife"],
  ["adventure", "Adventure"],
  ["shopping", "Shopping"],
  ["family", "Family"],
] as const;

const COLORS = ["oklch(0.58 0.19 258)", "oklch(0.72 0.15 45)", "oklch(0.62 0.16 190)"];

function ComparePage() {
  const [picked, setPicked] = useState<string[]>(["kyoto", "lisbon"]);
  const selected = DESTINATIONS.filter((d) => picked.includes(d.slug));

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= 3 ? p : [...p, slug]));

  const radar = METRICS.map(([key, label]) => {
    const row: Record<string, string | number> = { metric: label };
    selected.forEach((d) => {
      row[d.name] = d.metrics[key];
    });
    return row;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <SectionTitle
        eyebrow="Compare"
        title="Two or three finalists, one clear answer"
        description="Pick up to three destinations and see exactly where each one wins."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {DESTINATIONS.map((d) => (
          <button
            key={d.slug}
            onClick={() => toggle(d.slug)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              picked.includes(d.slug)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {picked.includes(d.slug) ? <Check className="size-3.5" /> : null}
            {d.name}
          </button>
        ))}
      </div>

      {selected.length === 0 ? (
        <GlassCard className="py-16 text-center text-muted-foreground">Pick at least one destination.</GlassCard>
      ) : (
        <div className="space-y-5">
          <GlassCard className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-medium text-muted-foreground">Metric</th>
                  {selected.map((d) => (
                    <th key={d.slug} className="py-3 pr-4 font-semibold">
                      {d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Daily budget" cells={selected.map((d) => `$${d.dailyBudget}`)} />
                <Row label="Hotel / night" cells={selected.map((d) => `$${d.metrics.hotelPrice}`)} />
                <Row label="Meal" cells={selected.map((d) => `$${d.metrics.mealPrice}`)} />
                <Row label="Trip score" cells={selected.map((d) => `${d.score}/100`)} />
                <Row label="Best season" cells={selected.map((d) => d.season)} />
                <Row label="Wi-Fi" cells={selected.map((d) => `${d.metrics.internetMbps} Mbps`)} />
                <Row label="Visa difficulty" cells={selected.map((d) => `${d.metrics.visaDifficulty}%`)} />
                {METRICS.map(([key, label]) => (
                  <Row key={key} label={label} cells={selected.map((d) => `${d.metrics[key]}%`)} />
                ))}
              </tbody>
            </table>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">Strength profile</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="metric" fontSize={12} />
                  <Tooltip />
                  {selected.map((d, i) => (
                    <Radar
                      key={d.slug}
                      name={d.name}
                      dataKey={d.name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.18}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-3">
            {selected.map((d) => (
              <GlassCard key={d.slug}>
                <h4 className="font-display text-lg font-semibold">{d.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{d.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2 text-emerald-600">
                    <Check className="size-4" /> Strong on {bestTag(d.metrics)}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <X className="size-4" /> Weakest on {worstTag(d.metrics)}
                  </li>
                </ul>
                <Button asChild className="mt-5 w-full rounded-full">
                  <Link to="/simulate" search={{ destination: `${d.name}, ${d.country}` }}>
                    Simulate {d.name}
                  </Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4 text-muted-foreground">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="py-3 pr-4 font-medium">
          {c}
        </td>
      ))}
    </tr>
  );
}

function rank(metrics: Record<string, number>) {
  return METRICS.map(([key, label]) => ({ label, value: metrics[key] ?? 0 })).sort((a, b) => b.value - a.value);
}
const bestTag = (m: Record<string, number>) => rank(m)[0]?.label.toLowerCase() ?? "";
const worstTag = (m: Record<string, number>) => rank(m).at(-1)?.label.toLowerCase() ?? "";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/glass-card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { budgetBreakdown } from "@/lib/sim-engine";
import type { BudgetWeights, Simulation } from "@/lib/sim-types";

const COLORS = [
  "oklch(0.58 0.19 258)",
  "oklch(0.72 0.15 45)",
  "oklch(0.62 0.16 190)",
  "oklch(0.6 0.2 310)",
  "oklch(0.7 0.17 145)",
  "oklch(0.5 0.05 260)",
];

const KEYS: { key: keyof BudgetWeights; label: string }[] = [
  { key: "hotel", label: "Hotel comfort" },
  { key: "flight", label: "Flight class" },
  { key: "food", label: "Food spend" },
  { key: "shopping", label: "Shopping" },
  { key: "transport", label: "Local transport" },
  { key: "luxury", label: "Experiences" },
];

export function BudgetPanel({
  sim,
  weights,
  onWeights,
}: {
  sim: Simulation;
  weights: BudgetWeights;
  onWeights: (w: BudgetWeights) => void;
}) {
  const { categories, total, perDay } = budgetBreakdown(sim.input, weights);
  const over = total - sim.input.budget;
  const cumulative = sim.days.map((d, i) => ({
    day: `D${d.day}`,
    spend: Math.round((total / sim.days.length) * (i + 1)),
    budget: Math.round((sim.input.budget / sim.days.length) * (i + 1)),
  }));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <GlassCard>
        <h3 className="text-lg font-semibold">Tune your spending</h3>
        <p className="mb-5 text-sm text-muted-foreground">Move a slider and every chart re-simulates instantly.</p>
        <div className="space-y-5">
          {KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <span className="text-xs text-muted-foreground">{weights[key]}%</span>
              </div>
              <Slider
                value={[weights[key]]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => onWeights({ ...weights, [key]: v ?? 0 })}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-muted/60 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Simulated total</span>
            <span className="font-display text-2xl font-bold">
              {total.toLocaleString()} {sim.input.currency}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">{perDay.toLocaleString()} / day</span>
            <span className={over > 0 ? "text-destructive" : "text-emerald-600"}>
              {over > 0 ? `${over.toLocaleString()} over budget` : `${Math.abs(over).toLocaleString()} under budget`}
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Where the money goes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categories.map((c, i) => (
                    <Cell key={c.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Category comparison</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="oklch(0.58 0.19 258)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Cumulative spend vs budget</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulative}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="oklch(0.58 0.19 258)" strokeWidth={2.5} dot={false} />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="oklch(0.72 0.15 45)"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
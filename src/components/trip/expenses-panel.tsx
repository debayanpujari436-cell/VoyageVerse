import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Simulation } from "@/lib/sim-types";

type Expense = { id: string; label: string; category: string; amount: number };

const CATEGORIES = ["Stay", "Food", "Transport", "Shopping", "Experiences"];
const COLORS = [
  "oklch(0.58 0.19 258)",
  "oklch(0.72 0.15 45)",
  "oklch(0.62 0.16 190)",
  "oklch(0.6 0.2 310)",
  "oklch(0.7 0.17 145)",
];

export function ExpensesPanel({ sim }: { sim: Simulation }) {
  const [items, setItems] = useState<Expense[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0] as string);

  const spent = items.reduce((a, i) => a + i.amount, 0);
  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        value: items.filter((i) => i.category === c).reduce((a, i) => a + i.amount, 0),
      })).filter((c) => c.value > 0),
    [items],
  );

  const add = () => {
    const value = Number(amount);
    if (!label.trim() || !Number.isFinite(value) || value <= 0) return;
    setItems((list) => [{ id: crypto.randomUUID(), label: label.trim(), category, amount: value }, ...list]);
    setLabel("");
    setAmount("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <GlassCard>
        <h3 className="text-lg font-semibold">Expense tracker</h3>
        <p className="mb-4 text-sm text-muted-foreground">Log real spend against your simulated budget.</p>

        <div className="grid gap-2 sm:grid-cols-[1fr_130px_120px_auto]">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What did you buy?" className="rounded-xl" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="0"
            className="rounded-xl"
          />
          <Button onClick={add} className="rounded-xl">
            <Plus className="size-4" />
          </Button>
        </div>

        <ul className="mt-5 space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-medium">{i.label}</span>
                <span className="ml-2 text-muted-foreground">{i.category}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-semibold">
                  {i.amount} {sim.input.currency}
                </span>
                <button
                  aria-label="Remove expense"
                  onClick={() => setItems((list) => list.filter((x) => x.id !== i.id))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing logged yet.
            </li>
          ) : null}
        </ul>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold">Budget health</h3>
        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Spent</span>
            <span className="font-display text-2xl font-bold">
              {spent.toLocaleString()} {sim.input.currency}
            </span>
          </div>
          <Progress value={Math.min(100, (spent / Math.max(1, sim.input.budget)) * 100)} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            of {sim.input.budget.toLocaleString()} {sim.input.currency} planned
          </p>
        </div>
        <div className="mt-5 h-56">
          {byCategory.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {byCategory.map((c, i) => (
                    <Cell key={c.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Add an expense to see the split.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
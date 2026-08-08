import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateAiPlan } from "@/lib/ai.functions";
import { buildSimulation, defaultInput } from "@/lib/sim-engine";
import { DESTINATIONS } from "@/lib/destinations";
import { ACCESSIBILITY, INTERESTS, type SimInput } from "@/lib/sim-types";
import { saveSimulation } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulate")({
  validateSearch: (search: Record<string, unknown>) => ({
    destination: typeof search["destination"] === "string" ? (search["destination"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Build Your Simulation — VoyageVerse" },
      {
        name: "description",
        content:
          "Enter your destination, dates, budget and travel style, and let AI simulate the whole vacation for you.",
      },
      { property: "og:title", content: "Build Your Vacation Simulation" },
      { property: "og:description", content: "Budget, weather, crowds and a day-by-day plan in one run." },
    ],
  }),
  component: SimulatePage,
});

const STYLES = ["Budget", "Balanced", "Luxury", "Backpacking", "Digital nomad"];
const STAYS = ["Hostel", "Boutique hotel", "Resort", "Apartment", "Homestay"];
const TRANSPORT = ["Public transport", "Rental car", "Walking first", "Private driver", "Bike"];
const FOOD = ["Local food", "Street food", "Fine dining", "Vegetarian", "Vegan", "Halal"];
const COMPANIONS = ["Solo", "Couple", "Friends", "Family"];
const PACE = ["Relaxed", "Balanced", "Packed"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];

function SimulatePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState<SimInput>(() => defaultInput(search.destination ?? "Kyoto, Japan"));
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof SimInput>(key: K, value: SimInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleList = (key: "interests" | "accessibility", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const run = async () => {
    if (!form.destination.trim()) {
      toast.error("Where are you going?");
      return;
    }
    setLoading(true);
    const sim = buildSimulation(form);
    try {
      const plan = await generateAiPlan({
        data: {
          destination: form.destination,
          days: form.days,
          travelers: form.travelers,
          budget: form.budget,
          currency: form.currency,
          style: form.style,
          pace: form.pace,
          companions: form.companions,
          food: form.food,
          accommodation: form.accommodation,
          transport: form.transport,
          interests: form.interests,
          accessibility: form.accessibility,
        },
      });
      sim.aiOverview = plan.overview;
      sim.aiNarration = plan.narration;
      sim.days = sim.days.map((d, i) => ({ ...d, title: plan.dayTitles[i] ?? d.title }));
      if (plan.highlights.length) {
        sim.optimizer = [
          ...plan.highlights.slice(0, 3).map((h) => ({ title: h, detail: "AI highlight for your profile.", save: 0 })),
          ...sim.optimizer,
        ];
      }
    } catch (error) {
      console.error(error);
      toast.warning("AI narration unavailable — showing the simulated plan.");
    }
    saveSimulation(sim);
    setLoading(false);
    void navigate({ to: "/trip/$tripId", params: { tripId: sim.id } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <Badge className="mb-3 rounded-full">Simulation setup</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">Design the trip you want to preview</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          The more you tell the simulator, the sharper the budget, crowd and itinerary predictions.
        </p>
      </div>

      <div className="space-y-5">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">The basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destination">
              <Select value={form.destination} onValueChange={(v) => set("destination", v)}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Choose a destination" />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((d) => (
                    <SelectItem key={d.slug} value={`${d.name}, ${d.country}`}>
                      {d.name}, {d.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Start date">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="rounded-xl"
              />
            </Field>
            <Field label={`Trip length — ${form.days} days`}>
              <Slider value={[form.days]} min={1} max={21} step={1} onValueChange={([v]) => set("days", v ?? 1)} />
            </Field>
            <Field label={`Travellers — ${form.travelers}`}>
              <Slider
                value={[form.travelers]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => set("travelers", v ?? 1)}
              />
            </Field>
            <Field label="Total budget">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => set("budget", Number(e.target.value))}
                  className="rounded-xl"
                />
                <Picker value={form.currency} onChange={(v) => set("currency", v)} options={CURRENCIES} className="w-28" />
              </div>
            </Field>
            <Field label="Travel style">
              <Picker value={form.style} onChange={(v) => set("style", v)} options={STYLES} />
            </Field>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Accommodation">
              <Picker value={form.accommodation} onChange={(v) => set("accommodation", v)} options={STAYS} />
            </Field>
            <Field label="Transportation">
              <Picker value={form.transport} onChange={(v) => set("transport", v)} options={TRANSPORT} />
            </Field>
            <Field label="Food">
              <Picker value={form.food} onChange={(v) => set("food", v)} options={FOOD} />
            </Field>
            <Field label="Travelling with">
              <Picker value={form.companions} onChange={(v) => set("companions", v)} options={COMPANIONS} />
            </Field>
            <Field label="Preferred pace">
              <Picker value={form.pace} onChange={(v) => set("pace", v)} options={PACE} />
            </Field>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold">Interests</h2>
          <p className="mb-4 text-sm text-muted-foreground">Pick everything that sounds like a good day out.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <Chip key={i} active={form.interests.includes(i)} onClick={() => toggleList("interests", i)}>
                {i}
              </Chip>
            ))}
          </div>

          <h2 className="mt-7 text-lg font-semibold">Accessibility needs</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ACCESSIBILITY.map((a) => (
              <Chip key={a} active={form.accessibility.includes(a)} onClick={() => toggleList("accessibility", a)}>
                {a}
              </Chip>
            ))}
          </div>
        </GlassCard>

        <div className="sticky bottom-4 z-30">
          <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {form.days} days in {form.destination || "…"} · {form.travelers} traveller
              {form.travelers > 1 ? "s" : ""} · {form.budget} {form.currency}
            </p>
            <Button size="lg" className="h-12 rounded-full px-7" onClick={run} disabled={loading}>
              {loading ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Sparkles className="mr-1 size-4" />}
              {loading ? "Simulating your trip…" : "Generate Simulation"}
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full rounded-xl", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
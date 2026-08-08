import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Gauge,
  Leaf,
  Lightbulb,
  MapPin as MapPinIcon,
  PlayCircle,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { StylizedMap } from "@/components/stylized-map";
import { BudgetPanel } from "@/components/trip/budget-panel";
import { ExpensesPanel } from "@/components/trip/expenses-panel";
import { PackingPanel } from "@/components/trip/packing-panel";
import { TimelinePanel } from "@/components/trip/timeline-panel";
import { WeatherPanel } from "@/components/trip/weather-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { budgetBreakdown } from "@/lib/sim-engine";
import { DEFAULT_WEIGHTS, type BudgetWeights, type Simulation } from "@/lib/sim-types";
import { getSimulation } from "@/lib/store";

export const Route = createFileRoute("/trip/$tripId")({
  head: () => ({
    meta: [
      { title: "Simulation Dashboard — VoyageVerse" },
      {
        name: "description",
        content: "Your simulated trip: itinerary, stylized map, budget sliders, weather and crowd predictions.",
      },
      { property: "og:title", content: "Your Simulated Trip Dashboard" },
      { property: "og:description", content: "Itinerary, map, budget, weather and crowds in one view." },
    ],
  }),
  component: TripPage,
});

function TripPage() {
  const { tripId } = Route.useParams();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [ready, setReady] = useState(false);
  const [weights, setWeights] = useState<BudgetWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const found = getSimulation(tripId);
    setSim(found);
    if (found) setWeights(found.weights ?? DEFAULT_WEIGHTS);
    setReady(true);
  }, [tripId]);

  if (!ready) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading your simulation…</div>;
  }

  if (!sim) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Simulation not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Simulations are stored in this browser. Run a new one to continue.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/simulate">Start a simulation</Link>
          </Button>
        </div>
      </div>
    );
  }

  const budget = budgetBreakdown(sim.input, weights);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <header className="overflow-hidden rounded-3xl border border-border/60">
        <div className="relative h-56 sm:h-72">
          <img
            src={sim.image}
            alt={`${sim.destinationName}, ${sim.country}`}
            className="size-full object-cover"
            width={1600}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-5 sm:p-7">
            <div className="min-w-0 text-white">
              <Badge className="mb-2 rounded-full bg-white/20 text-white backdrop-blur">Simulation ready</Badge>
              <h1 className="truncate font-display text-2xl font-bold sm:text-4xl">
                {sim.input.days} days in {sim.destinationName}
              </h1>
              <p className="mt-1 truncate text-sm text-white/80">
                {sim.country} · {sim.input.startDate} · {sim.input.travelers} traveller
                {sim.input.travelers > 1 ? "s" : ""} · {sim.input.style}
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-full">
              <Link to="/virtual-day/$tripId" params={{ tripId: sim.id }}>
                <PlayCircle className="mr-1 size-4" /> Virtual day
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Simulated cost" value={`${budget.total.toLocaleString()} ${sim.input.currency}`} />
        <Kpi icon={Gauge} label="Trip score" value={`${sim.score}/100`} />
        <Kpi icon={ShieldCheck} label="Safety" value={`${sim.safety}%`} />
        <Kpi icon={Leaf} label="Carbon" value={`${sim.carbonKg} kg CO₂`} />
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl p-1.5">
          {[
            ["overview", "Overview"],
            ["map", "Map"],
            ["timeline", "Itinerary"],
            ["budget", "Budget"],
            ["weather", "Weather & crowds"],
            ["packing", "Packing"],
            ["expenses", "Expenses"],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value as string} className="rounded-xl px-4">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <GlassCard>
              <h2 className="font-display text-xl font-semibold">What this trip feels like</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {sim.aiOverview ??
                  `A ${sim.input.pace.toLowerCase()} ${sim.input.days}-day run through ${sim.destinationName}, tuned for ${sim.input.interests
                    .slice(0, 3)
                    .join(", ")
                    .toLowerCase()} and a ${sim.input.style.toLowerCase()} budget.`}
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <Line label="Crowd level" value={sim.crowdLevel} />
                <Line label="Walking difficulty" value={sim.walkingDifficulty} />
                <Line label="Safety" value={sim.safety} />
                <Line label="Overall match" value={sim.score} />
              </dl>
            </GlassCard>

            <GlassCard>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="size-4 text-primary" /> AI optimizer
              </h2>
              <ul className="mt-4 space-y-3">
                {sim.optimizer.slice(0, 6).map((o) => (
                  <li key={o.title} className="rounded-2xl bg-muted/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium">{o.title}</span>
                      {o.save > 0 ? (
                        <Badge variant="secondary" className="shrink-0 rounded-full">
                          save {o.save} {sim.input.currency}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{o.detail}</p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <GlassCard>
              <h3 className="flex items-center gap-2 font-semibold">
                <CalendarDays className="size-4 text-primary" /> Day highlights
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {sim.days.slice(0, 5).map((d) => (
                  <li key={d.day} className="truncate">
                    <span className="font-medium text-foreground">Day {d.day}:</span> {d.title}
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <h3 className="flex items-center gap-2 font-semibold">
                <Users className="size-4 text-primary" /> Emergency & essentials
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {sim.emergency.map((e) => (
                  <li key={e.label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{e.label}</span>
                    <span className="font-medium">{e.value}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPinIcon className="size-4 text-primary" /> Trip profile
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <Row label="Stay" value={sim.input.accommodation} />
                <Row label="Transport" value={sim.input.transport} />
                <Row label="Food" value={sim.input.food} />
                <Row label="With" value={sim.input.companions} />
                <Row label="Pace" value={sim.input.pace} />
              </ul>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Stylized city map</h2>
            <StylizedMap
              pins={sim.pins}
              routePoints={(sim.days[0]?.activities ?? []).map((a) => ({ x: a.x, y: a.y }))}
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelinePanel sim={sim} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <BudgetPanel sim={sim} weights={weights} onWeights={setWeights} />
        </TabsContent>

        <TabsContent value="weather" className="mt-6">
          <WeatherPanel sim={sim} />
        </TabsContent>

        <TabsContent value="packing" className="mt-6">
          <PackingPanel sim={sim} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesPanel sim={sim} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <GlassCard className="p-5">
      <Icon className="size-5 text-primary" />
      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
    </GlassCard>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </li>
  );
}
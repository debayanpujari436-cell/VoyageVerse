import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Simulation } from "@/lib/sim-types";
import { getSimulation } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/virtual-day/$tripId")({
  head: () => ({
    meta: [
      { title: "Virtual Day Mode — VoyageVerse" },
      {
        name: "description",
        content: "Live an hour-by-hour narrated preview of your trip day before you book anything.",
      },
      { property: "og:title", content: "Virtual Day Mode" },
      { property: "og:description", content: "An AI-narrated, hour-by-hour walkthrough of your simulated day." },
    ],
  }),
  component: VirtualDayPage,
});

function VirtualDayPage() {
  const { tripId } = Route.useParams();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSim(getSimulation(tripId));
    setReady(true);
  }, [tripId]);

  const beats = sim?.days[0]?.activities ?? [];

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= beats.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 3500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, beats.length]);

  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>;

  if (!sim || beats.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Nothing to play yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Run a simulation first, then come back for the walkthrough.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/simulate">Start a simulation</Link>
          </Button>
        </div>
      </div>
    );
  }

  const beat = beats[Math.min(step, beats.length - 1)]!;
  const narration = sim.aiNarration?.[step] ?? beat.why;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Button asChild variant="ghost" className="mb-5 rounded-full">
        <Link to="/trip/$tripId" params={{ tripId: sim.id }}>
          <ArrowLeft className="mr-1 size-4" /> Back to dashboard
        </Link>
      </Button>

      <div className="relative overflow-hidden rounded-3xl border border-border/60">
        <img src={sim.image} alt={sim.destinationName} className="h-72 w-full object-cover sm:h-96" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
          <Badge className="mb-3 rounded-full bg-white/20 text-white backdrop-blur">
            {beat.time} · {beat.slot}
          </Badge>
          <h1 className="font-display text-2xl font-bold sm:text-4xl">{beat.title}</h1>
          <p key={step} className="animate-fade-up mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {narration}
          </p>
        </div>
      </div>

      <GlassCard className="mt-5">
        <Progress value={((step + 1) / beats.length) * 100} className="h-2" />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Moment {step + 1} of {beats.length} · {beat.weather} {beat.tempC}°C · crowd {beat.crowd}%
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => { setStep(0); setPlaying(false); }}>
              <RotateCcw className="mr-1 size-4" /> Restart
            </Button>
            <Button className="rounded-full" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="mr-1 size-4" /> : <Play className="mr-1 size-4" />}
              {playing ? "Pause" : "Play the day"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {beats.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                i === step ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
              )}
            >
              <span className="text-xs font-semibold text-muted-foreground">{b.time}</span>
              <span className="min-w-0 truncate">{b.title}</span>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
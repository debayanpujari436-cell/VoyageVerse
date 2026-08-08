import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plus, Trash2 } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "@/lib/destinations";
import { deleteSimulation, useFavorites, useSimulations } from "@/lib/store";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — VoyageVerse" },
      { name: "description", content: "Your saved simulations, wishlist destinations and travel stats in one place." },
      { property: "og:title", content: "My Simulated Trips" },
      { property: "og:description", content: "Saved simulations, wishlist and travel stats." },
    ],
  }),
  component: MyTripsPage,
});

function MyTripsPage() {
  const sims = useSimulations();
  const { favorites, toggle } = useFavorites();
  const saved = DESTINATIONS.filter((d) => favorites.includes(d.slug));
  const totalDays = sims.reduce((a, s) => a + s.input.days, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <SectionTitle
        eyebrow="Dashboard"
        title="Your travel simulations"
        description="Everything you've simulated in this browser, plus the places you're still dreaming about."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Simulations run" value={String(sims.length)} />
        <Stat label="Days planned" value={String(totalDays)} />
        <Stat label="Wishlist" value={String(saved.length)} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Saved simulations</h2>
        <Button asChild className="rounded-full">
          <Link to="/simulate">
            <Plus className="mr-1 size-4" /> New simulation
          </Link>
        </Button>
      </div>

      {sims.length === 0 ? (
        <GlassCard className="py-16 text-center text-muted-foreground">
          No simulations yet — run your first one to see it here.
        </GlassCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sims.map((s) => (
            <GlassCard key={s.id} className="p-0">
              <img
                src={s.image}
                alt={s.destinationName}
                className="h-40 w-full rounded-t-3xl object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{s.destinationName}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.input.days} days · {s.input.startDate}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-full">
                    {s.score}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1 rounded-full">
                    <Link to="/trip/$tripId" params={{ tripId: s.id }}>
                      Open
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Delete simulation"
                    className="rounded-full"
                    onClick={() => deleteSimulation(s.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-12 font-display text-xl font-semibold">Wishlist</h2>
      {saved.length === 0 ? (
        <GlassCard className="py-12 text-center text-muted-foreground">
          Tap the heart on any destination to save it here.
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((d) => (
            <GlassCard key={d.slug} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.name}</p>
                <p className="truncate text-xs text-muted-foreground">{d.country}</p>
              </div>
              <button aria-label="Remove from wishlist" onClick={() => toggle(d.slug)} className="shrink-0">
                <Heart className="size-4 fill-primary text-primary" />
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold">{value}</div>
    </GlassCard>
  );
}
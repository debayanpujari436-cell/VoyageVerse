import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DESTINATIONS } from "@/lib/destinations";
import { useGeneratedDestinations } from "@/lib/destination-store";
import { useFavorites } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DestinationChat } from "@/components/destination-chat";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Explore Destinations — VoyageVerse" },
      {
        name: "description",
        content: "Browse simulated destinations with daily budgets, safety, weather and AI travel scores.",
      },
      { property: "og:title", content: "Explore Simulated Destinations" },
      { property: "og:description", content: "Daily budgets, safety, weather and AI travel scores at a glance." },
    ],
  }),
  component: DestinationsPage,
});

const FILTERS = ["All", "Beaches", "Mountains", "Food", "History", "Adventure", "Shopping"];

function DestinationsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const generated = useGeneratedDestinations();
  const { favorites, toggle } = useFavorites();

  const allDestinations = [...generated, ...DESTINATIONS];

  const list = useMemo(
    () =>
      allDestinations.filter(
        (d) =>
          (filter === "All" || d.tags.includes(filter)) &&
          `${d.name} ${d.country} ${d.tagline}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [allDestinations, query, filter],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <SectionTitle
        eyebrow="Explore"
        title="Destinations worth simulating"
        description="Save favourites, then run a full simulation to see the real cost of the trip."
      />

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations"
            className="h-11 rounded-full pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition-colors",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <DestinationChat />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <article key={d.slug} className="hover-lift overflow-hidden rounded-3xl border border-border/60 bg-card">
            <div className="relative aspect-[4/3]">
              <img
                src={d.image}
                alt={`${d.name}, ${d.country}`}
                width={1024}
                height={768}
                loading="lazy"
                className="size-full object-cover"
              />
              <button
                onClick={() => toggle(d.slug)}
                aria-label="Save to wishlist"
                className="absolute right-3 top-3 rounded-full bg-background/85 p-2 backdrop-blur transition-transform hover:scale-110"
              >
                <Heart className={cn("size-4", favorites.includes(d.slug) && "fill-primary text-primary")} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-semibold">{d.name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{d.country}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full">
                  {d.score}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{d.tagline}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <Stat label="Per day" value={`$${d.dailyBudget}`} />
                <Stat label="Safety" value={`${d.metrics.safety}`} />
                <Stat label="Wi-Fi" value={`${d.metrics.internetMbps}M`} />
              </dl>
              <Button asChild className="mt-5 w-full rounded-full">
                <Link to="/simulate" search={{ destination: `${d.name}, ${d.country}` }}>
                  Simulate this trip
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No destinations match that search yet.</p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
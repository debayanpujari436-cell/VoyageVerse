import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CloudSun, Compass, MapPinned, Sparkle, Star, Users, Wallet } from "lucide-react";
import hero from "@/assets/hero-coast.jpg";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "@/lib/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoyageVerse — Experience Your Trip Before You Book" },
      {
        name: "description",
        content:
          "Simulate budget, weather, crowd levels and a full day-by-day itinerary with AI before you spend a cent on your vacation.",
      },
      { property: "og:title", content: "Experience Your Vacation Before You Book It" },
      {
        property: "og:description",
        content: "AI simulates your entire trip so you can travel smarter.",
      },
    ],
  }),
  component: Index,
});

const STATS = [
  { icon: Sparkle, label: "Simulations created", value: "1.2M+" },
  { icon: MapPinned, label: "Countries covered", value: "148" },
  { icon: Wallet, label: "Money saved", value: "$46M" },
  { icon: Star, label: "Average user rating", value: "4.9/5" },
];

const TESTIMONIALS = [
  {
    name: "Ana Ferreira",
    role: "Booked Lisbon in October",
    quote:
      "The crowd predictor moved my whole trip a week later. Same budget, half the queues, way better photos.",
  },
  {
    name: "Marcus Lee",
    role: "Family of four, Kyoto",
    quote:
      "Virtual Day Mode sold my kids on temples. We literally watched the trip before paying for it.",
  },
  {
    name: "Priya Raman",
    role: "Solo traveller, Bali",
    quote: "I dropped $610 off my plan by moving three sliders. The alternatives were genuinely better.",
  },
];

const STEPS = [
  { icon: Compass, title: "Tell us the trip", text: "Destination, dates, budget, pace and what you actually enjoy." },
  { icon: Sparkle, title: "AI simulates it", text: "A full itinerary with costs, crowds, weather and travel times." },
  { icon: CloudSun, title: "Tune and compare", text: "Move sliders, swap days, compare destinations side by side." },
];

function Index() {
  const popular = DESTINATIONS.slice(0, 3);
  const trending = DESTINATIONS.filter((d) => d.trending);
  const seasonal = DESTINATIONS.slice(3);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Aerial view of a turquoise tropical coastline at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:pt-28 lg:pb-32">
          <div className="max-w-3xl animate-fade-up">
            <Badge className="mb-5 rounded-full bg-white/15 px-4 py-1.5 text-white backdrop-blur-md">
              AI-powered travel decisions
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Experience Your Vacation Before You Book It.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/85 sm:text-lg">
              AI simulates your entire trip—budget, weather, activities, crowd levels, and personalized
              itineraries—so you can travel smarter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link to="/simulate">
                  Start Your Simulation <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-full border border-white/40 bg-white/15 px-7 text-base text-white backdrop-blur-md hover:bg-white/25"
              >
                <Link to="/destinations">Explore Destinations</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:mt-20 lg:grid-cols-4 lg:gap-4">
            {STATS.map((s) => (
              <GlassCard key={s.label} className="p-5">
                <s.icon className="size-5 text-primary" />
                <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{s.value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <SectionTitle
          eyebrow="Popular right now"
          title="Destinations travellers are simulating"
          description="Every card opens a full simulation: costs, crowds, weather and a day-by-day plan."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((d) => (
            <DestinationCard key={d.slug} d={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionTitle eyebrow="Trending trips" title="What's climbing this month" />
        <div className="grid gap-4 md:grid-cols-3">
          {trending.map((d, i) => (
            <GlassCard key={d.slug} className="flex items-center gap-4">
              <span className="font-display text-3xl font-bold text-primary/40">0{i + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {d.name}, {d.country}
                </p>
                <p className="truncate text-sm text-muted-foreground">{d.tagline}</p>
                <p className="mt-1 text-xs text-primary">~${d.dailyBudget}/day · score {d.score}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionTitle eyebrow="Seasonal picks" title="Best matched to the next 90 days" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seasonal.map((d) => (
            <DestinationCard key={d.slug} d={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <GlassCard key={s.title}>
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl gradient-brand text-primary-foreground">
                <s.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionTitle eyebrow="Loved by travellers" title="What people say after simulating" />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <GlassCard key={t.name}>
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">“{t.quote}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-brand px-6 py-14 text-center text-primary-foreground sm:px-12">
          <Users className="mx-auto mb-4 size-8 opacity-80" />
          <h2 className="text-3xl font-bold sm:text-4xl">Your next trip, previewed in 60 seconds.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            Simulate the full experience, tune the budget, then book with confidence.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7 h-12 rounded-full px-8 text-base">
            <Link to="/simulate">Start Your Simulation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function DestinationCard({ d }: { d: (typeof DESTINATIONS)[number] }) {
  return (
    <Link
      to="/simulate"
      search={{ destination: `${d.name}, ${d.country}` }}
      className="group hover-lift block overflow-hidden rounded-3xl border border-border/60 bg-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={d.image}
          alt={`${d.name}, ${d.country}`}
          width={1024}
          height={768}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 rounded-full bg-background/85 text-foreground backdrop-blur">
          {d.season}
        </Badge>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold">{d.name}</p>
            <p className="truncate text-sm text-muted-foreground">{d.country}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {d.score}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{d.tagline}</p>
        <p className="mt-4 text-sm font-medium text-primary">from ${d.dailyBudget} / day</p>
      </div>
    </Link>
  );
}

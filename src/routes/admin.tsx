import { createFileRoute } from "@tanstack/react-router";
import { Activity, Globe2, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { Progress } from "@/components/ui/progress";
import { DESTINATIONS } from "@/lib/destinations";
import { useSimulations } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Insights — VoyageVerse" },
      { name: "description", content: "Platform analytics: simulation volume, trending destinations and AI usage." },
      { property: "og:title", content: "VoyageVerse Admin Insights" },
      { property: "og:description", content: "Simulation volume, trending destinations and AI usage." },
    ],
  }),
  component: AdminPage,
});

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  day: d,
  simulations: 320 + i * 48 + (i % 3) * 70,
  bookings: 90 + i * 21,
}));

function AdminPage() {
  const sims = useSimulations();
  const popularity = DESTINATIONS.map((d) => ({ name: d.name, runs: d.score * 12 + d.dailyBudget })).sort(
    (a, b) => b.runs - a.runs,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <SectionTitle
        eyebrow="Admin"
        title="Platform insights"
        description="A snapshot of how travellers are using the simulator this week."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Activity} label="Simulations (7d)" value="3,241" delta="+18%" />
        <Kpi icon={Users} label="Active travellers" value="1,864" delta="+9%" />
        <Kpi icon={Globe2} label="Destinations covered" value={String(DESTINATIONS.length * 14)} delta="+4" />
        <Kpi icon={TrendingUp} label="Local simulations" value={String(sims.length)} delta="this browser" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Simulations vs bookings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEK}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="simulations" stroke="oklch(0.58 0.19 258)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="bookings" stroke="oklch(0.72 0.15 45)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Most simulated destinations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="runs" radius={[8, 8, 0, 0]} fill="oklch(0.58 0.19 258)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5">
        <h3 className="mb-4 text-lg font-semibold">AI usage health</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <Meter label="Itinerary generation" value={87} />
          <Meter label="Assistant chats" value={64} />
          <Meter label="Narration requests" value={42} />
        </div>
      </GlassCard>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <GlassCard className="p-5">
      <Icon className="size-5 text-primary" />
      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{delta}</div>
    </GlassCard>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
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
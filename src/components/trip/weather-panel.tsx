import { CloudRain, Droplets, Sunrise, Sunset, Thermometer, Wind } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/glass-card";
import { Progress } from "@/components/ui/progress";
import type { Simulation } from "@/lib/sim-types";

export function WeatherPanel({ sim }: { sim: Simulation }) {
  const crowdByHour = sim.hourly.map((h, i) => ({
    hour: h.hour,
    crowd: Math.max(8, Math.round(sim.crowdLevel * (0.55 + Math.sin((i / 11) * Math.PI) * 0.6))),
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={Thermometer} label="Average temp" value={`${sim.avgTempC}°C`} caption={sim.weatherSummary} />
        <Tile icon={Sunrise} label="Sunrise" value={sim.sunrise} caption="Best light for photos" />
        <Tile icon={Sunset} label="Sunset" value={sim.sunset} caption="Golden hour planning" />
        <Tile icon={CloudRain} label="Rain risk" value={`${Math.round(sim.hourly.reduce((a, h) => a + h.rain, 0) / sim.hourly.length)}%`} caption="Daily average" />
      </div>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Hour-by-hour weather simulation</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sim.hourly}>
              <defs>
                <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.58 0.19 258)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.58 0.19 258)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="tempC" stroke="oklch(0.58 0.19 258)" strokeWidth={2.5} fill="url(#temp)" />
              <Area type="monotone" dataKey="rain" stroke="oklch(0.62 0.16 190)" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Bit icon={Droplets} label="Humidity" value={`${Math.round(sim.hourly.reduce((a, h) => a + h.humidity, 0) / sim.hourly.length)}%`} />
          <Bit icon={Wind} label="Wind" value={`${Math.round(sim.hourly.reduce((a, h) => a + h.wind, 0) / sim.hourly.length)} km/h`} />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold">Crowd predictor</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Simulated footfall across the day — aim for the dips to skip the queues.
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crowdByHour}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="crowd" radius={[8, 8, 0, 0]} fill="oklch(0.72 0.15 45)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-5 space-y-3">
          <Line label="Overall crowd level" value={sim.crowdLevel} />
          <Line label="Walking difficulty" value={sim.walkingDifficulty} />
          <Line label="Safety score" value={sim.safety} />
        </div>
      </GlassCard>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <GlassCard className="p-5">
      <Icon className="size-5 text-primary" />
      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{caption}</div>
    </GlassCard>
  );
}

function Bit({ icon: Icon, label, value }: { icon: typeof Wind; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
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
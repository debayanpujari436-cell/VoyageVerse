import { findDestination } from "./destinations";
import {
  DEFAULT_WEIGHTS,
  type Activity,
  type BudgetWeights,
  type HourWeather,
  type MapPin,
  type SimDay,
  type SimInput,
  type Simulation,
} from "./sim-types";

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const MORNING = [
  ["Sunrise breakfast near your stay", "Food"],
  ["Old town walking loop", "History"],
  ["Signature museum visit", "Museums"],
  ["Coastal viewpoint hike", "Adventure"],
];
const AFTERNOON = [
  ["Local market lunch crawl", "Food"],
  ["Hidden gem neighbourhood", "Photography"],
  ["Boat or cable-car ride", "Adventure"],
  ["Artisan shopping street", "Shopping"],
];
const EVENING = [
  ["Sunset viewpoint", "Photography"],
  ["Chef's table dinner reservation", "Food"],
  ["Riverside stroll", "Relaxation"],
  ["Rooftop aperitivo", "Nightlife"],
];
const NIGHT = [
  ["Live music at a local bar", "Nightlife"],
  ["Night market dessert run", "Food"],
  ["Spa and slow wind-down", "Relaxation"],
  ["Stargazing spot outside town", "Photography"],
];

const SLOTS: { slot: Activity["slot"]; time: string; pool: string[][] }[] = [
  { slot: "Morning", time: "08:30", pool: MORNING },
  { slot: "Afternoon", time: "13:00", pool: AFTERNOON },
  { slot: "Evening", time: "18:30", pool: EVENING },
  { slot: "Night", time: "21:30", pool: NIGHT },
];

export function budgetBreakdown(input: SimInput, w: BudgetWeights) {
  const dest = findDestination(input.destination);
  const nights = Math.max(1, input.days);
  const people = Math.max(1, input.travelers);
  const styleMul = input.style === "Luxury" ? 1.5 : input.style === "Budget" ? 0.65 : 1;

  const hotel = Math.round(dest.metrics.hotelPrice * (0.5 + w.hotel / 60) * nights * styleMul);
  const flight = Math.round((260 + w.flight * 9) * people * styleMul);
  const food = Math.round(dest.metrics.mealPrice * 3 * (0.6 + w.food / 70) * nights * people);
  const shopping = Math.round(w.shopping * 6 * people * styleMul);
  const transport = Math.round((12 + w.transport * 1.4) * nights * styleMul);
  const luxury = Math.round(w.luxury * 14 * people);

  const categories = [
    { name: "Stay", value: hotel },
    { name: "Flights", value: flight },
    { name: "Food", value: food },
    { name: "Transport", value: transport },
    { name: "Shopping", value: shopping },
    { name: "Experiences", value: luxury },
  ];
  const total = categories.reduce((a, c) => a + c.value, 0);
  return { categories, total, perDay: Math.round(total / nights) };
}

function makeHourly(seed: number, base: number): HourWeather[] {
  const r = rng(seed);
  return Array.from({ length: 12 }, (_, i) => {
    const hour = 7 + i;
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      tempC: Math.round(base + Math.sin((i / 11) * Math.PI) * 6 - 3 + r() * 2),
      rain: Math.round(r() * 45),
      humidity: Math.round(45 + r() * 35),
      wind: Math.round(4 + r() * 18),
    };
  });
}

function makePins(seed: number): MapPin[] {
  const r = rng(seed);
  const spec: [MapPin["kind"], string[]][] = [
    ["hotel", ["Your hotel"]],
    ["food", ["Breakfast café", "Market kitchen", "Chef's table", "Night snacks"]],
    ["attraction", ["Main museum", "Old quarter", "Sunset viewpoint", "Historic gate"]],
    ["gem", ["Locals-only courtyard", "Backstreet bakery"]],
    ["hospital", ["Central hospital"]],
    ["transport", ["Metro hub", "Ferry pier"]],
  ];
  const pins: MapPin[] = [];
  spec.forEach(([kind, labels]) =>
    labels.forEach((label, i) =>
      pins.push({
        id: `${kind}-${i}`,
        kind,
        label,
        x: 10 + r() * 78,
        y: 12 + r() * 72,
      }),
    ),
  );
  return pins;
}

function addDays(iso: string, n: number) {
  const d = new Date(iso || Date.now());
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildSimulation(input: SimInput, weights = DEFAULT_WEIGHTS, destinationOverride?: Destination): Simulation {
  const dest = destinationOverride ?? findDestination(input.destination);
  const seed = hash(input.destination + input.startDate + input.days + input.style);
  const r = rng(seed);
  const pins = makePins(seed);
  const paceCount = input.pace === "Packed" ? 4 : input.pace === "Relaxed" ? 2 : 3;
  const baseTemp = 14 + Math.round(dest.metrics.weather / 6);

  const days: SimDay[] = Array.from({ length: Math.max(1, input.days) }, (_, dIdx) => {
    const activities: Activity[] = SLOTS.slice(0, paceCount).map((s, i) => {
      const pick = s.pool[(dIdx + i) % s.pool.length]!;
      const pin = pins[(dIdx * 3 + i) % pins.length]!;
      return {
        id: `d${dIdx}-a${i}`,
        slot: s.slot,
        time: s.time,
        title: `${pick[0]} in ${dest.name}`,
        category: pick[1]!,
        duration: `${1 + Math.round(r() * 2)}h ${Math.round(r() * 5) * 10}m`,
        why: `Matches your ${input.interests[0] ?? input.style.toLowerCase()} preference and sits ${Math.round(
          5 + r() * 20,
        )} minutes from your ${input.accommodation.toLowerCase()}.`,
        distanceKm: Math.round(r() * 60) / 10 + 0.4,
        cost: Math.round((8 + r() * 60) * (input.style === "Luxury" ? 1.8 : 1)),
        weather: r() > 0.75 ? "Light rain" : r() > 0.4 ? "Partly cloudy" : "Clear",
        tempC: baseTemp + Math.round(r() * 8) - 2,
        popularity: Math.round(55 + r() * 44),
        crowd: Math.round(20 + r() * 75),
        rating: Math.round((40 + r() * 10)) / 10,
        reviews: 120 + Math.round(r() * 5400),
        reviewQuote: [
          "Go early — the light is unreal and there is almost nobody there.",
          "Worth every minute. Staff were lovely and prices fair.",
          "Touristy at midday, magical after 6pm.",
          "Bring cash, the best stalls don't take cards.",
        ][Math.floor(r() * 4)]!,
        alternatives: [
          `Quieter alternative: ${dest.name} botanical gardens`,
          `Rainy-day swap: covered ${pick[1]!.toLowerCase()} hall`,
          "Free option: self-guided heritage walk",
        ],
        x: pin.x,
        y: pin.y,
      };
    });
    return {
      day: dIdx + 1,
      date: addDays(input.startDate, dIdx),
      title: dIdx === 0 ? `Arrival & first taste of ${dest.name}` : `Day ${dIdx + 1} in ${dest.name}`,
      summary: activities.map((a) => a.title.split(" in ")[0]).join(" · "),
      activities,
    };
  });

  const budget = budgetBreakdown(input, weights);
  const fit = Math.min(100, Math.round((input.budget / Math.max(1, budget.total)) * 100));

  return {
    id: `${dest.slug}-${seed.toString(36)}`,
    createdAt: new Date().toISOString(),
    input,
    weights,
    destinationSlug: dest.slug,
    destinationName: dest.name,
    country: dest.country,
    image: dest.image,
    score: Math.round(dest.score * 0.7 + fit * 0.3),
    safety: dest.metrics.safety,
    crowdLevel: Math.round(35 + r() * 50),
    walkingDifficulty: Math.round(30 + r() * 55),
    carbonKg: Math.round((320 + r() * 900) * input.travelers),
    weatherSummary: `${baseTemp + 4}°C days, ${baseTemp - 5}°C nights, ${Math.round(r() * 40)}% rain chance`,
    avgTempC: baseTemp + 4,
    sunrise: "06:12",
    sunset: "19:48",
    hourly: makeHourly(seed, baseTemp),
    packing: [
      {
        group: "Clothing",
        items: ["Light layers", "Walking shoes", "Rain shell", "Evening outfit", "Swimwear"],
      },
      { group: "Medicines", items: ["Personal prescriptions", "Painkillers", "Motion sickness tablets", "Blister plasters"] },
      { group: "Documents", items: ["Passport", "Travel insurance", "Booking confirmations", "Emergency contact card"] },
      { group: "Electronics", items: ["Phone + charger", "Power bank", "Camera", "Headphones"] },
      { group: "Adapters", items: [`${dest.country} plug adapter`, "USB-C multi charger"] },
      { group: "Essentials", items: ["Reusable bottle", "Sunscreen SPF50", "Day pack", "Local cash"] },
    ],
    pins,
    emergency: [
      { label: "Emergency number", value: "112" },
      { label: "Nearest hospital", value: `${dest.name} Central Hospital` },
      { label: "Tourist police", value: "+00 000 1122" },
      { label: "Embassy hotline", value: "+00 000 8890" },
    ],
    days,
    optimizer: [
      { title: "Shift the museum to Tuesday morning", detail: "Crowds drop 42% and entry is discounted before 10am.", save: 24 },
      { title: `Stay one metro stop outside central ${dest.name}`, detail: "Same commute, noticeably lower nightly rate.", save: 180 },
      { title: "Swap two dinners for market food halls", detail: "Local favourites, higher ratings, a third of the price.", save: 96 },
      { title: "Book the viewpoint pass as a bundle", detail: "Bundles the cable car and the sunset terrace.", save: 38 },
      { title: "Add a free walking tour on day 2", detail: "Great orientation and covers three of your interests.", save: 30 },
    ],
  };
}

export function defaultInput(destination = "Kyoto, Japan"): SimInput {
  return {
    destination,
    startDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    days: 5,
    travelers: 2,
    budget: 3000,
    style: "Balanced",
    accommodation: "Boutique hotel",
    transport: "Public transport",
    food: "Local food",
    interests: ["Food", "History", "Photography"],
    companions: "Couple",
    accessibility: [],
    pace: "Balanced",
    currency: "USD",
  };
}
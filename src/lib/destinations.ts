import kyoto from "@/assets/dest-kyoto.jpg";
import santorini from "@/assets/dest-santorini.jpg";
import bali from "@/assets/dest-bali.jpg";
import alps from "@/assets/dest-alps.jpg";
import lisbon from "@/assets/dest-lisbon.jpg";
import marrakech from "@/assets/dest-marrakech.jpg";

export type Destination = {
  slug: string;
  name: string;
  country: string;
  image: string;
  tagline: string;
  dailyBudget: number;
  score: number;
  tags: string[];
  season: string;
  trending?: boolean;
  metrics: {
    weather: number;
    food: number;
    nightlife: number;
    safety: number;
    transport: number;
    shopping: number;
    family: number;
    adventure: number;
    internetMbps: number;
    visaDifficulty: number;
    hotelPrice: number;
    mealPrice: number;
  };
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    image: kyoto,
    tagline: "Temples, tea houses and blossom-lined canals.",
    dailyBudget: 165,
    score: 94,
    tags: ["History", "Food", "Photography"],
    season: "Spring",
    trending: true,
    metrics: {
      weather: 82,
      food: 96,
      nightlife: 72,
      safety: 97,
      transport: 95,
      shopping: 84,
      family: 88,
      adventure: 68,
      internetMbps: 138,
      visaDifficulty: 20,
      hotelPrice: 148,
      mealPrice: 22,
    },
  },
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    image: santorini,
    tagline: "Caldera sunsets, white villages and blue water.",
    dailyBudget: 210,
    score: 91,
    tags: ["Beaches", "Relaxation", "Photography"],
    season: "Summer",
    trending: true,
    metrics: {
      weather: 93,
      food: 88,
      nightlife: 80,
      safety: 90,
      transport: 68,
      shopping: 70,
      family: 74,
      adventure: 62,
      internetMbps: 74,
      visaDifficulty: 25,
      hotelPrice: 235,
      mealPrice: 32,
    },
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    image: bali,
    tagline: "Rice terraces, surf breaks and jungle waterfalls.",
    dailyBudget: 85,
    score: 89,
    tags: ["Beaches", "Adventure", "Relaxation"],
    season: "Year-round",
    metrics: {
      weather: 84,
      food: 86,
      nightlife: 82,
      safety: 76,
      transport: 58,
      shopping: 72,
      family: 78,
      adventure: 92,
      internetMbps: 42,
      visaDifficulty: 35,
      hotelPrice: 62,
      mealPrice: 9,
    },
  },
  {
    slug: "interlaken",
    name: "Interlaken",
    country: "Switzerland",
    image: alps,
    tagline: "Alpine lakes, cable cars and glacier air.",
    dailyBudget: 245,
    score: 92,
    tags: ["Mountains", "Adventure", "Photography"],
    season: "Summer",
    metrics: {
      weather: 74,
      food: 78,
      nightlife: 52,
      safety: 98,
      transport: 97,
      shopping: 66,
      family: 90,
      adventure: 97,
      internetMbps: 160,
      visaDifficulty: 30,
      hotelPrice: 268,
      mealPrice: 42,
    },
  },
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    image: lisbon,
    tagline: "Tiled streets, trams and Atlantic light.",
    dailyBudget: 120,
    score: 90,
    tags: ["Food", "History", "Nightlife"],
    season: "Autumn",
    trending: true,
    metrics: {
      weather: 88,
      food: 92,
      nightlife: 90,
      safety: 89,
      transport: 84,
      shopping: 78,
      family: 82,
      adventure: 70,
      internetMbps: 122,
      visaDifficulty: 25,
      hotelPrice: 112,
      mealPrice: 18,
    },
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    image: marrakech,
    tagline: "Souks, riads and desert doorways.",
    dailyBudget: 95,
    score: 87,
    tags: ["Shopping", "History", "Food"],
    season: "Winter",
    metrics: {
      weather: 80,
      food: 85,
      nightlife: 66,
      safety: 72,
      transport: 64,
      shopping: 95,
      family: 70,
      adventure: 84,
      internetMbps: 38,
      visaDifficulty: 30,
      hotelPrice: 78,
      mealPrice: 11,
    },
  },
];

export function findDestination(query: string): Destination {
  const q = query.trim().toLowerCase();
  return (
    DESTINATIONS.find((d) => q.includes(d.name.toLowerCase()) || q.includes(d.slug)) ??
    DESTINATIONS.find((d) => q.includes(d.country.toLowerCase())) ??
    DESTINATIONS[0]!
  );
}
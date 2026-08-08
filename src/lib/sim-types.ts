export type SimInput = {
  destination: string;
  startDate: string;
  days: number;
  travelers: number;
  budget: number;
  style: string;
  accommodation: string;
  transport: string;
  food: string;
  interests: string[];
  companions: string;
  accessibility: string[];
  pace: string;
  currency: string;
};

export type BudgetWeights = {
  hotel: number;
  flight: number;
  food: number;
  shopping: number;
  transport: number;
  luxury: number;
};

export type Activity = {
  id: string;
  slot: "Morning" | "Afternoon" | "Evening" | "Night";
  time: string;
  title: string;
  category: string;
  duration: string;
  why: string;
  distanceKm: number;
  cost: number;
  weather: string;
  tempC: number;
  popularity: number;
  crowd: number;
  rating: number;
  reviews: number;
  reviewQuote: string;
  alternatives: string[];
  x: number;
  y: number;
};

export type SimDay = {
  day: number;
  date: string;
  title: string;
  summary: string;
  activities: Activity[];
};

export type MapPin = {
  id: string;
  label: string;
  kind: "hotel" | "food" | "attraction" | "hospital" | "gem" | "transport";
  x: number;
  y: number;
};

export type HourWeather = {
  hour: string;
  tempC: number;
  rain: number;
  humidity: number;
  wind: number;
};

export type Simulation = {
  id: string;
  createdAt: string;
  input: SimInput;
  weights: BudgetWeights;
  destinationSlug: string;
  destinationName: string;
  country: string;
  image: string;
  score: number;
  safety: number;
  crowdLevel: number;
  walkingDifficulty: number;
  carbonKg: number;
  weatherSummary: string;
  avgTempC: number;
  sunrise: string;
  sunset: string;
  hourly: HourWeather[];
  packing: { group: string; items: string[] }[];
  pins: MapPin[];
  emergency: { label: string; value: string }[];
  days: SimDay[];
  optimizer: { title: string; detail: string; save: number }[];
  aiOverview?: string;
  aiNarration?: string[];
};

export const DEFAULT_WEIGHTS: BudgetWeights = {
  hotel: 50,
  flight: 40,
  food: 50,
  shopping: 30,
  transport: 45,
  luxury: 25,
};

export const INTERESTS = [
  "Beaches",
  "Mountains",
  "Adventure",
  "Museums",
  "Shopping",
  "Nightlife",
  "Wildlife",
  "History",
  "Photography",
  "Food",
  "Relaxation",
];

export const ACCESSIBILITY = [
  "Step-free access",
  "Low walking distance",
  "Quiet / sensory friendly",
  "Dietary needs",
];
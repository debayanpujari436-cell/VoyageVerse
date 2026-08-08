import { createServerFn } from "@tanstack/react-start";
import { generateImage, streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, AI_MODEL } from "./ai-gateway.server";
import type { Destination } from "./destinations";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const InputSchema = z.object({
  history: z.array(ChatMessageSchema).min(1),
});

const DestinationBaseSchema = z.object({
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  tagline: z.string(),
  dailyBudget: z.number().int().positive(),
  score: z.number().int().min(1).max(100),
  tags: z.array(z.string()).nonempty(),
  season: z.string(),
  metrics: z.object({
    weather: z.number().int().min(1).max(100),
    food: z.number().int().min(1).max(100),
    nightlife: z.number().int().min(1).max(100),
    safety: z.number().int().min(1).max(100),
    transport: z.number().int().min(1).max(100),
    shopping: z.number().int().min(1).max(100),
    family: z.number().int().min(1).max(100),
    adventure: z.number().int().min(1).max(100),
    internetMbps: z.number().int().min(10),
    visaDifficulty: z.number().int().min(1).max(100),
    hotelPrice: z.number().int().min(10),
    mealPrice: z.number().int().min(5),
  }),
  imagePrompt: z.string().min(10),
});

const SuggestedDestinationSchema = DestinationBaseSchema.extend({
  why: z.string().min(10),
  estimatedBudget: z.string().min(1),
  recommendedDuration: z.string().min(1),
  activities: z.array(z.string()).nonempty(),
  itinerary: z.array(z.string()).nonempty(),
});

const ResponseSchema = z.object({
  questions: z.array(z.string()).optional(),
  suggestions: z.array(SuggestedDestinationSchema).optional(),
});

function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  return raw.slice(start, end + 1);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const generateDestination = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const gateway = createLovableAiGatewayProvider(key);
    const conversation = data.history
      .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
      .join("\n");

    const prompt = `You are a smart VoyageVerse travel assistant that helps travellers discover unusual trips. Based on the conversation below, either ask 2-4 intelligent follow-up questions or return 3 highly unusual destination suggestions.

Conversation:
${conversation}

Return valid JSON only using exactly these fields:
{
  "questions": ["..."],
  "suggestions": [
    {
      "slug": "",
      "name": "",
      "country": "",
      "tagline": "",
      "dailyBudget": 0,
      "score": 0,
      "tags": [""],
      "season": "",
      "metrics": {
        "weather": 0,
        "food": 0,
        "nightlife": 0,
        "safety": 0,
        "transport": 0,
        "shopping": 0,
        "family": 0,
        "adventure": 0,
        "internetMbps": 0,
        "visaDifficulty": 0,
        "hotelPrice": 0,
        "mealPrice": 0
      },
      "imagePrompt": "",
      "why": "",
      "estimatedBudget": "",
      "recommendedDuration": "",
      "activities": [""],
      "itinerary": [""]
    }
  ]
}

If you still need more details, return only questions and omit suggestions. If you have enough detail, return only suggestions and omit questions. Do not include markdown, explanation, or extra fields.`;

    const result = streamText({ model: gateway(AI_MODEL), prompt });
    const text = await result.text;
    const raw = extractJson(text);
    if (!raw) throw new Error("AI response did not include valid JSON.");

    const parsed = JSON.parse(raw);
    const response = ResponseSchema.parse(parsed);

    let imageSuggestions = response.suggestions;
    if (imageSuggestions?.length) {
      imageSuggestions = await Promise.all(
        imageSuggestions.map(async (suggestion) => {
          const imageResult = await generateImage({
            model: "google/gemini-3.6-flash",
            prompt: suggestion.imagePrompt,
            size: "1024x768",
            n: 1,
          });

          const file = imageResult.images[0];
          if (!file) throw new Error("Image generation failed.");

          return {
            ...suggestion,
            image: `data:${file.mediaType};base64,${file.base64}`,
            slug: slugify(suggestion.slug || `${suggestion.name}-${suggestion.country}`),
          };
        }),
      );
    }

    return { questions: response.questions, suggestions: imageSuggestions };
  });

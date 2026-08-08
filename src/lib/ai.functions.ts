import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  destination: z.string().min(1),
  days: z.number(),
  travelers: z.number(),
  budget: z.number(),
  currency: z.string(),
  style: z.string(),
  pace: z.string(),
  companions: z.string(),
  food: z.string(),
  accommodation: z.string(),
  transport: z.string(),
  interests: z.array(z.string()),
  accessibility: z.array(z.string()),
});

export type AiPlan = {
  overview: string;
  highlights: string[];
  dayTitles: string[];
  narration: string[];
  warnings: string[];
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const generateAiPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AiPlan> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const { createLovableAiGatewayProvider, AI_MODEL } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `Simulate a vacation and answer with JSON only.
Trip: ${data.days} days in ${data.destination} for ${data.travelers} traveller(s) (${data.companions}).
Budget: ${data.budget} ${data.currency}. Style: ${data.style}. Pace: ${data.pace}.
Stay: ${data.accommodation}. Transport: ${data.transport}. Food: ${data.food}.
Interests: ${data.interests.join(", ") || "general"}. Accessibility: ${data.accessibility.join(", ") || "none"}.

Return this exact JSON shape:
{
  "overview": "2-3 sentence vivid summary of how this trip will actually feel",
  "highlights": ["5 short specific highlights, each under 90 characters"],
  "dayTitles": ["one evocative title per day, ${data.days} items, each under 60 characters"],
  "narration": ["8 second-person hour-by-hour moments starting at 07:00, each 2 sentences, mention time, weather, place names, senses"],
  "warnings": ["3 short practical warnings or budget cautions"]
}
Use real, well known place names in ${data.destination}. No markdown, no commentary.`;

    const result = streamText({
      model: gateway(AI_MODEL),
      prompt,
    });

    const text = await result.text;
    const parsed = extractJson(text) as Partial<AiPlan> | null;
    if (!parsed?.overview) throw new Error("The AI could not simulate this trip. Try again.");

    const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
    return {
      overview: String(parsed.overview),
      highlights: arr(parsed.highlights),
      dayTitles: arr(parsed.dayTitles),
      narration: arr(parsed.narration),
      warnings: arr(parsed.warnings),
    };
  });
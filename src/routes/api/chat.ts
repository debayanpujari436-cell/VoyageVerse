import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  AI_MODEL,
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";

type Body = { messages?: unknown; context?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const system = `You are the VoyageVerse travel assistant: warm, concrete and concise.
You help travellers preview and tune a simulated trip: budget, itinerary swaps, crowds, weather, food and hidden gems.
Answer in short markdown with bullet lists where useful, always give specific place names and rough costs.
Current simulated trip context: ${JSON.stringify(body.context ?? {}).slice(0, 2000)}`;

        const result = streamText({
          model: gateway(AI_MODEL),
          system,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });
      },
    },
  },
});
import Anthropic from "@anthropic-ai/sdk";
import prompt from "./prompt.ts";

const anthropic = new Anthropic();

export async function generateResponse(input: string, debug = false) {
  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 8000,
    temperature: 1,
    system: prompt.system,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: input,
          },
        ],
      },
    ],
  });

  if (debug) {
    console.log(JSON.stringify(response, null, 2));
  }

  return response;
}

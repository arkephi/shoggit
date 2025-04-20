import OpenAI from "openai";
const client = new OpenAI();
import prompt from "./prompt.ts";

export async function generateResponse(input: string, debug = false) {
  const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: prompt.system,
      },
      {
        role: "user",
        content: input,
      },
    ],
  });

  if (debug) {
    console.log(JSON.stringify(response, null, 2));
  }

  return response;
}

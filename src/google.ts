import { GoogleGenAI } from "@google/genai";
import prompt from "./prompt.ts";

const ai = new GoogleGenAI({ apiKey: Bun.env.GEMINI_API_KEY });

export async function generateResponse(input: string, debug = false) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: input,
    config: {
      systemInstruction: prompt.system,
    },
  });

  if (debug) {
    console.log(JSON.stringify(response, null, 2));
  }

  return response;
}

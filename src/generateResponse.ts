import { generateResponse as generateAnthropicResponse } from "./anthropic.ts";
import { generateResponse as generateGoogleResponse } from "./google.ts";
import { generateResponse as generateOpenAIResponse } from "./openai.ts";

export async function generateResponse(
  input: string,
  provider: "anthropic" | "google" | "openai",
  debug = false
) {
  let response;
  switch (provider) {
    case "anthropic":
      response = await generateAnthropicResponse(input, debug);
      break;
    case "google":
      response = await generateGoogleResponse(input, debug);
      break;
    case "openai":
      response = await generateOpenAIResponse(input, debug);
      break;
    default:
      throw new Error("Unsupported provider");
  }

  return response;
}

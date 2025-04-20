import type Anthropic from "@anthropic-ai/sdk";
import type OpenAI from "openai";
import { type GenerateContentResponse } from "@google/genai";

namespace AnthropicSdk {
  export type Message = Anthropic.Message;
}

export type Provider = "anthropic" | "openai" | "google";
export type ResponseUnion =
  | AnthropicSdk.Message
  | OpenAI.ChatCompletion
  | GenerateContentResponse;

export function parseResponse(response: ResponseUnion, provider: Provider) {
  let text = "";
  switch (provider) {
    case "anthropic":
      const content = (response as AnthropicSdk.Message).content;
      const firstBlock = content[0];
      if (firstBlock?.type === "text") {
        text = firstBlock.text;
      } else {
        throw new Error(
          `Expected an Anthropic TextBlock in the response. Received type ${firstBlock?.type}`
        );
      }
      break;
    case "openai":
      const choices = (response as OpenAI.ChatCompletion).choices;
      const firstChoice = choices[0];
      if (firstChoice?.message?.content) {
        text = firstChoice.message.content;
      } else {
        throw new Error(
          `Expected an OpenAI ChatCompletion message. First choice was invalid: ${JSON.stringify(
            firstChoice
          )}`
        );
      }
      break;
    case "google":
      const genaiResponse = response as GenerateContentResponse;
      const responseText = genaiResponse.text;
      if (responseText) {
        text = responseText;
      } else {
        throw new Error(
          `Expected a Google GenAI response. response.text did not return a valid string`
        );
      }
      break;
    default:
      throw new Error("Unsupported response type");
  }

  if (!text) {
    throw new Error("No text content found in message");
  }

  const lines = text.split(/\r?\n/);
  let startIndex = 0;
  let endIndex = lines.length;

  startIndex = lines.findIndex((line) => line?.trim().startsWith("```"));
  if (startIndex === -1) {
    throw new Error("Could not find beginning of code fenced content");
  }
  endIndex = lines.findLastIndex((line) => line?.trim().endsWith("```"));
  if (endIndex === -1) {
    throw new Error("Could not find end of code fenced content");
  }

  startIndex++; // Skip the opening code fence

  if (startIndex >= endIndex) {
    throw new Error("No valid code fenced content found");
  }

  const diffLines = lines.slice(startIndex, endIndex);

  if (diffLines.length > 0 && diffLines[diffLines.length - 1] !== "") {
    diffLines.push(""); // Ensure a newline at the end
  }

  const diffText = diffLines.join("\n");

  return diffText;
}

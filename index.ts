#! /usr/bin/env bun

import { confirm, number } from "@inquirer/prompts";
import { generateResponse } from "./src/generateResponse.ts";
import { formatPromptInput } from "./src/formatPromptInput.ts";
import { saveLogFile } from "./src/saveLogFile.ts";
import { readFileContents } from "./src/readFileContents.ts";
import { normalizeFilePaths } from "./src/normalizeFilePaths.ts";
import { parseCliArguments } from "./src/parseCliArguments.ts";
import { applyPatch, checkPatch } from "./src/git.ts";
import { parseResponse } from "./src/parseResponse.ts";
import { parseUnifiedDiff } from "./src/parseUnifiedDiff.ts";
import { colorizeDiffLine } from "./src/colorizeDiffLine.ts";

const { args, prompt } = parseCliArguments();
const filePaths = normalizeFilePaths(args.files, args.debug);
const fileContents = await readFileContents(filePaths, args.debug);
const promptInput = formatPromptInput(fileContents, prompt, args.debug);

console.log(`Requesting patch from ${args.provider}...`);
const response = await generateResponse(promptInput, args.provider, args.debug);
await saveLogFile(JSON.stringify(response, null, 2), "json", args.provider);

const generatedDiff = parseResponse(response, args.provider);
await saveLogFile(generatedDiff, "patch", args.provider);

// Parse the patch to get individual hunks and colorize the diff
const { hunks, patch, transformedPatch, oldFileName, newFileName } =
  parseUnifiedDiff(generatedDiff, colorizeDiffLine);

console.log(transformedPatch);

let confirmApply = false;
if (args["auto-apply"]) {
  confirmApply = true;
  console.log("Auto-apply is enabled. Applying patch...");
} else {
  confirmApply = await confirm({
    message: `Apply this patch to ${newFileName}?`,
  });
}

if (confirmApply) {
  let numContextLines = 3;
  let retry = false;

  do {
    const { success, output } = await checkPatch(patch, numContextLines);

    if (!success) {
      console.log(output);
      retry = await confirm({
        message: `Patch failed to apply. Try again with fewer context lines?`,
      });
      if (numContextLines >= 0 && retry) {
        numContextLines = await number({
          message: `Enter the number of context lines (original: 3)`,
          min: 0,
          max: 3,
          default: numContextLines - 1,
          required: true,
        });
      }
    } else {
      retry = false;
    }

    if (success) {
      const applyResult = await applyPatch(patch, numContextLines);
    }
  } while (retry);
  console.log("Patch applied successfully.");
} else {
  console.log("Patch not applied.");
}

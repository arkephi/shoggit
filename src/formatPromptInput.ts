/**
 * Format file contents for the prompt
 */
export function formatPromptInput(
  fileContents: Array<{ path: string; content: string }>,
  prompt: string,
  debug: boolean
) {
  const promptInputFiles = fileContents
    .map(
      (file) =>
        `- File: \`${file.path}\`\n\`\`\`typescript\n${file.content}\n\`\`\``
    )
    .join("\n");

  const promptInput = `${promptInputFiles}\n\n${prompt}`;

  if (debug) {
    console.log("Prompt input:\n", promptInput);
  }
  return promptInput;
}

import { jack } from "jackspeak";
import { z } from "zod";

export const argsSchema = z.object({
  files: z.array(z.string()),
  provider: z.enum(["anthropic", "openai", "google"]),
  prompt: z.string().optional(),
  "auto-apply": z.boolean(),
  "log-patch": z.boolean(),
  debug: z.boolean(),
  interactive: z.boolean(),
});

export type Args = z.infer<typeof argsSchema>;

/**
 * Configure CLI options and parse arguments
 */
export function parseCliArguments() {
  const j = jack({
    envPrefix: "MEM_GIT",
    usage: "prompt [options] <files>",
  })
    .heading("LLM Patch CLI")
    .description("Get code changes as git patches")
    .flag({
      "auto-apply": {
        description: "Automatically apply generated patches",
        short: "a",
        default: false,
      },
      "log-patch": {
        description: "Output the patch to the console",
        short: "l",
        default: true,
      },
      debug: {
        description: "Enable debug logging",
        short: "d",
        default: false,
      },
      interactive: {
        description: "Enable interactive mode",
        short: "i",
        default: false,
      },
    })
    .opt({
      provider: {
        description: "LLM provider to use",
        default: "anthropic",
        choices: ["anthropic", "openai", "google"],
      },
      prompt: {
        description: "Prompt to send to the LLM",
      },
    })
    .optList({
      files: {
        description: "Files that will be sent to the LLM",
        delim: "\n",
      },
    });

  const { values, positionals } = j.parse();

  // Debug logging
  if (values.debug) {
    console.log("CLI args:", JSON.stringify(values, null, 2));
    console.log("Files:", process.env.MEM_GIT_FILES);
    console.log("Positionals:", positionals);
  }

  const parsedArgs = argsSchema.safeParse(values);
  if (!parsedArgs.success) {
    console.error("Invalid arguments:", parsedArgs.error);
    console.log(j.usage());
    process.exit(1);
  }

  const args = parsedArgs.data;

  const prompt = positionals[0];

  if (!args.interactive && !prompt) {
    throw new Error("Prompt is required in non-interactive mode");
  }

  return { args, prompt };
}

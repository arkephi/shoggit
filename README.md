# Shoggit

A simple command line utility for requesting code changes from LLM providers. Shoggit allows you to describe changes you want to make to your codebase, and it will generate a Git patch using LLMs (Large Language Models) that you can review and apply to your files.

## Features

- Generate code changes using multiple LLM providers (Anthropic, OpenAI, Google)
- Returns changes as unified diffs (Git patches)
- Interactive review and application of patches
- Configurable context lines for patch application
- Debug mode for troubleshooting

## Installation

```bash
# Clone the repository
git clone https://github.com/arkephi/shoggit.git
cd shoggit

# Install dependencies
bun install

# Run it with Bun
bun run index.ts

# OR

# Make the CLI executable if you want to 
chmod +x index.ts

# OR

# Link the binary to use it globally
bun link
bun link shoggit
```

## Usage

Basic usage:

```bash
shoggit "Add error handling to the function" --files="src/myFile.ts,index.ts" --provider=anthropic
```

### Command Line Options

```
Usage: prompt [options] <files>

LLM Patch CLI
  Get code changes as git patches

Options:
  -a, --auto-apply       Automatically apply generated patches (default: false)
  -l, --log-patch        Output the patch to the console (default: true)
  -d, --debug            Enable debug logging (default: false)
  -i, --interactive      Enable interactive mode (default: false)
  --provider <provider>  LLM provider to use (choices: "anthropic", "openai", "google", default: "anthropic")
  --prompt <prompt>      Prompt to send to the LLM (not implemented yet!)
  --files <files>        Files that will be sent to the LLM
```

### Examples

1. Generate a patch using Anthropic (Claude) for multiple files:

   ```bash
   shoggit "Refactor the error handling logic" --files="src/error.ts,src/logger.ts" --provider anthropic
   ```

2. Use OpenAI to generate changes and automatically apply them:

   ```bash
   shoggit "Add JSDoc comments to all functions" --files src/utils.ts --provider openai --auto-apply
   ```

3. Run in debug mode to see detailed information:

   ```bash
   shoggit "Fix the type definitions" --files src/types.ts --debug
   ```

4. Use interactive mode to be guided through the process: Not implemented yet!
   ```bash
   shoggit --interactive
   ```

## Environment Variables

Make sure to set the appropriate API keys for your chosen provider in your environment!

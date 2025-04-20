import pc from "picocolors";

/**
 * Colorize diff lines using picocolors
 * @param line - the line to apply color formatting to
 */
export function colorizeDiffLine(line: string) {
  if (line.startsWith("@@")) {
    return pc.dim(line);
  }
  if (line.startsWith("+") && !line.startsWith("+++")) {
    return pc.green(line);
  }
  if (line.startsWith("-") && !line.startsWith("---")) {
    return pc.red(line);
  }
  if (line.startsWith("--- ") || line.startsWith("+++ ")) {
    return pc.dim(line);
  }
  return line;
}

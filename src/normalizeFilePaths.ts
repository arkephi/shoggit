/**
 * Parse and normalize file paths from CLI arguments
 */
export function normalizeFilePaths(files: string[], debug: boolean): string[] {
  const filePaths = files
    .map((file) => {
      const splitPaths = file.split(/[,\s]/);
      return splitPaths.map((p) => p.trim()).filter((p) => p !== "");
    })
    .flat();

  if (debug) {
    console.log("Normalized file paths:", filePaths);
  }

  return filePaths;
}

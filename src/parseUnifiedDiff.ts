export type Hunk = {
  header: string;
  lines: string[];
  oldFileName: string;
  newFileName: string;
  oldStart: number;
  newStart: number;
  added: number;
  removed: number;
  originalHunk?: string;
  correctedHunk?: string;
  transformedHunk?: string | null;
};

export type LineTransform = (line: string) => string;

/**
 * Parse a unified diff and process hunks with optional line transformation
 */
export function parseUnifiedDiff(
  diffText: string,
  transformCallback?: LineTransform
) {
  const lines = diffText.split("\n");
  const hunks: Hunk[] = [];
  let currentHunk = null;
  let oldFileName = "";
  let newFileName = "";
  let preamble = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === undefined) {
      throw new Error("Line is undefined");
    }

    // Handle file headers
    if (line.startsWith("--- ")) {
      oldFileName = line.slice(4).trim().replace(/^b\//, "");
      preamble = lines.slice(0, i).join("\n");
      continue;
    }
    if (line.startsWith("+++ ")) {
      newFileName = line.slice(4).trim().replace(/^a\//, "");
      continue;
    }

    // Handle hunk header (e.g., @@ -1,4 +1,4 @@)
    if (line.startsWith("@@ ")) {
      if (currentHunk) {
        hunks.push(finalizeHunk(currentHunk, transformCallback));
      }
      currentHunk = {
        header: line,
        lines: [] as string[],
        oldFileName: oldFileName,
        newFileName: newFileName,
        oldStart: 0,
        newStart: 0,
        added: 0,
        removed: 0,
      };
      continue;
    }

    // Collect lines in the current hunk
    if (currentHunk) {
      currentHunk.lines.push(line);
      if (line.startsWith("+") && !line.startsWith("+++")) {
        currentHunk.added += 1;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        currentHunk.removed += 1;
      } else if (line.startsWith(" ")) {
        currentHunk.removed += 1;
        currentHunk.added += 1;
      }
    }
  }

  // Finalize the last hunk
  if (currentHunk) {
    hunks.push(finalizeHunk(currentHunk, transformCallback));
  }

  const patch =
    preamble + "\n" + hunks.map((hunk) => hunk.correctedHunk).join("\n");

  const transformedPatch =
    preamble + "\n" + hunks.map((hunk) => hunk.transformedHunk).join("\n");

  return { hunks, patch, transformedPatch, oldFileName, newFileName };
}

// Finalize a hunk: compute corrected header and apply optional transform
function finalizeHunk(hunk: Hunk, transformCallback?: LineTransform) {
  const headerMatch = hunk.header.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
  if (
    !headerMatch ||
    headerMatch[1] === undefined ||
    headerMatch[3] === undefined
  ) {
    throw new Error(`Invalid hunk header format\n${hunk.header}`);
  }
  const oldStart = headerMatch ? parseInt(headerMatch[1], 10) : 1;
  const newStart = headerMatch ? parseInt(headerMatch[3], 10) : 1;

  const correctedHeader = `@@ -${oldStart},${hunk.removed} +${newStart},${hunk.added} @@`;

  const originalHunk = [hunk.header, ...hunk.lines].join("\n");

  const correctedHunk = [correctedHeader, ...hunk.lines].join("\n");

  let transformedHunk = null;
  if (transformCallback) {
    const transformedLines = hunk.lines.map((line) => transformCallback(line));
    transformedHunk = [
      transformCallback(correctedHeader),
      ...transformedLines,
    ].join("\n");
  }

  return {
    header: correctedHeader,
    lines: hunk.lines,
    oldFileName: hunk.oldFileName,
    newFileName: hunk.newFileName,
    oldStart,
    newStart,
    added: hunk.added,
    removed: hunk.removed,
    originalHunk,
    correctedHunk,
    transformedHunk,
  };
}

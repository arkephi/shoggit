import * as Bun from "bun";

/**
 * Read file contents from provided paths
 */
export async function readFileContents(filePaths: string[], debug: boolean) {
  const bunFiles = filePaths.map((path) => Bun.file(path));

  const fileContents = await Promise.all(
    bunFiles
      .map(async (file) => {
        if (!file.name) {
          throw new Error(`File name is empty: ${file}`);
        }
        if (!file.exists()) {
          throw new Error(`File not found: ${file.name}`);
        }
        const content = await file.text();
        return { path: file.name, content };
      })
      .filter((file): file is NonNullable<typeof file> => file !== null)
  );

  if (debug) {
    console.log("Files read:", fileContents.map((f) => f.path).join(", "));
  }

  return fileContents;
}

import { simpleGit, type SimpleGit, type SimpleGitOptions } from "simple-git";
import isoGit from "isomorphic-git";
import { memfs } from "memfs";
import { parsePatch, applyPatch as jsApplyPatch } from "diff";

const { fs } = memfs();

export const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const git: SimpleGit = simpleGit(options);

/**
 * Creates an in-memory copy of a local git repository
 * @param repoPath - Path to the local git repository
 * @returns In-memory filesystem with the repository contents
 */
export async function createInMemoryRepo(repoPath: string) {
  fs.mkdirSync("/repo", { recursive: true });

  await isoGit.init({
    fs,
    dir: "/repo",
  });

  const fileList = await git.raw(["ls-files"], { cwd: repoPath });
  const files = fileList.split("\n").filter(Boolean);

  for (const file of files) {
    try {
      const content = await Bun.file(`${repoPath}/${file}`).text();
      const dirPath = file.split("/").slice(0, -1).join("/");

      if (dirPath) {
        fs.mkdirSync(`/repo/${dirPath}`, { recursive: true });
      }

      fs.writeFileSync(`/repo/${file}`, content);
    } catch (error) {
      console.error(`Error copying file ${file}: ${error}`);
    }
  }

  return fs;
}
/**
 * Applies a patch to an in-memory filesystem
 * @param patch - The unified diff string
 * @param fileName - Path to the file to patch
 * @returns A promise that resolves if the patch applies successfully, or rejects with error output.
 */
export async function applyPatchToInMemory(
  patch: string,
  fileName: string
): Promise<void> {
  const originalContent = fs.existsSync(fileName)
    ? (fs.readFileSync(fileName, "utf8") as string)
    : "";

  const newContent = jsApplyPatch(originalContent, patch);

  if (!newContent) {
    throw new Error("Failed to apply patch");
  }

  fs.writeFileSync(fileName, newContent);
}

/**
 * Applies a git patch file using 'git apply'
 * @param unifiedDiff - The full text of the unified diff received from the LLM
 * @returns A promise that resolves if the patch applies successfully, or rejects with error output.
 */
export async function applyPatch(unifiedDiff: string, contextLines = 3) {
  const tmpFileName = `./tmp/out.patch`;
  const tmpFile = Bun.file(tmpFileName);
  await tmpFile.write(unifiedDiff);

  try {
    return await git.applyPatch(tmpFileName, [
      `-C${contextLines}`,
      "--recount",
      "--ignore-whitespace",
      "--verbose",
    ]);
  } catch (error) {
    throw new Error(`Failed to apply patch: ${error}`);
  } finally {
    await tmpFile.delete();
  }
}

export async function checkPatch(unifiedDiff: string, contextLines = 3) {
  const tmpFileName = `./tmp/out.patch`;
  const tmpFile = Bun.file(tmpFileName);
  await tmpFile.write(unifiedDiff);

  try {
    const result = await git.applyPatch(tmpFileName, [
      `-C${contextLines}`,
      "--check",
      "--recount",
      "--ignore-whitespace",
      "--verbose",
    ]);
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  } finally {
    await tmpFile.delete();
  }
}

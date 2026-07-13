import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export type ContentSourceResolution = {
  path: string;
  resolvedFrom: "submodule" | "sibling" | "cloned";
};

export function ensureContentSource(args: {
  repoUrl: string;
  targetDir: string;
  requiredPaths: string[];
}): ContentSourceResolution {
  if (fs.existsSync(args.targetDir)) {
    const hasRequiredPaths = args.requiredPaths.every((relativePath) =>
      fs.existsSync(path.join(args.targetDir, relativePath)),
    );
    if (hasRequiredPaths) {
      return { path: args.targetDir, resolvedFrom: "submodule" };
    }
  }

  const parentDir = path.dirname(args.targetDir);
  fs.mkdirSync(parentDir, { recursive: true });

  execFileSync("git", ["clone", args.repoUrl, args.targetDir], {
    stdio: "inherit",
  });

  const hasRequiredPaths = args.requiredPaths.every((relativePath) =>
    fs.existsSync(path.join(args.targetDir, relativePath)),
  );
  if (!hasRequiredPaths) {
    throw new Error(
      `Cloned repository at ${args.targetDir} is missing required paths:\n${args.requiredPaths.map((p) => `- ${p}`).join("\n")}`,
    );
  }

  return { path: args.targetDir, resolvedFrom: "cloned" };
}

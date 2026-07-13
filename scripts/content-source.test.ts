import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ensureContentSource } from "./content-source";

test("ensureContentSource clones a repo when the required paths are missing", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "content-source-"));
  const sourceRepo = path.join(tmpRoot, "source-repo");
  const targetDir = path.join(tmpRoot, "target-repo");

  execFileSync("git", ["init", "--initial-branch=main", sourceRepo], {
    stdio: "ignore",
  });
  fs.mkdirSync(path.join(sourceRepo, "skills", "ui-style-library", "references"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(sourceRepo, "skills", "ui-style-library", "SKILL.md"),
    "# skill",
  );
  fs.writeFileSync(
    path.join(sourceRepo, "skills", "ui-style-library", "references", "demo.md"),
    "# demo",
  );
  execFileSync("git", ["-C", sourceRepo, "config", "user.email", "test@example.com"]);
  execFileSync("git", ["-C", sourceRepo, "config", "user.name", "Test User"]);
  execFileSync("git", ["-C", sourceRepo, "add", "."]);
  execFileSync("git", ["-C", sourceRepo, "commit", "-m", "init"], {
    stdio: "ignore",
  });

  const result = ensureContentSource({
    repoUrl: sourceRepo,
    targetDir,
    requiredPaths: [
      "skills/ui-style-library/SKILL.md",
      "skills/ui-style-library/references",
    ],
  });

  assert.equal(result.path, targetDir);
  assert.equal(result.resolvedFrom, "cloned");
  assert.ok(fs.existsSync(path.join(targetDir, "skills/ui-style-library/SKILL.md")));
  assert.ok(fs.existsSync(path.join(targetDir, "skills/ui-style-library/references")));
});

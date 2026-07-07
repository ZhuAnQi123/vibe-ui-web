import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  Catalog,
  CatalogItem,
  CatalogItemType,
  CatalogPreview,
} from "../src/types/catalog";

const ROOT = path.join(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "src/data/catalog.json");
const MOTION_CDN_BASE =
  process.env.MOTION_CDN_BASE ??
  "https://pub-78bb53484bcd4179b692b8ebeee0e014.r2.dev";

function isVideoAsset(filename: string): boolean {
  return /\.(mp4|webm|mov|gif)$/i.test(filename);
}

function resolveMotionAssetUrl(assetPath: string): string {
  const filename = path.basename(assetPath);
  if (isVideoAsset(filename)) {
    return `${MOTION_CDN_BASE}/${filename}`;
  }
  return `/content-assets/${filename}`;
}

const CONTENT_SOURCES = {
  vibeUi: {
    repo: "vibe-ui" as const,
    candidates: [
      path.join(ROOT, "content/vibe-ui"),
      path.join(ROOT, "../vibe-ui"),
      path.join(ROOT, "vibe-ui"),
    ],
    referencesDir: "skills/ui-style-library/references",
    skillPath: "skills/ui-style-library/SKILL.md",
    type: "ui" as const,
  },
  vibeMotionMd: {
    repo: "vibe-motion" as const,
    candidates: [
      path.join(ROOT, "content/vibe-motion"),
      path.join(ROOT, "../vibe-motion"),
      path.join(ROOT, "vibe-motion"),
    ],
    referencesDir: "skills/interaction-library/references",
    skillPath: "skills/interaction-library/SKILL.md",
    type: "motion" as const,
  },
};

function resolveContentRoot(candidates: string[]) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const resolvedFrom = candidate.includes(`${path.sep}content${path.sep}`)
        ? "submodule"
        : "sibling";
      return { path: candidate, resolvedFrom } as const;
    }
  }

  throw new Error(
    `Content source not found. Tried:\n${candidates.map((c) => `- ${c}`).join("\n")}`,
  );
}

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  if (raw.startsWith("---\n")) {
    const end = raw.indexOf("\n---\n", 4);
    if (end === -1) {
      return { data: {}, body: raw };
    }

    const yamlBlock = raw.slice(4, end);
    const body = raw.slice(end + 5);
    try {
      return { data: parseYaml(yamlBlock) ?? {}, body };
    } catch (e) {
      console.warn("YAML parse error:", e);
      return { data: {}, body };
    }
  }

  const fencedMatch = raw.match(/^`{3,4}yaml\n([\s\S]*?)\n---\n/);
  if (fencedMatch) {
    const bodyStart = fencedMatch[0].length;
    try {
      return {
        data: parseYaml(fencedMatch[1]) ?? {},
        body: raw.slice(bodyStart),
      };
    } catch (e) {
      console.warn("YAML parse error:", e);
      return { data: {}, body: raw.slice(bodyStart) };
    }
  }

  return { data: {}, body: raw };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return [];
}

function extractTriggers(description: unknown): string[] {
  if (typeof description !== "string") {
    return [];
  }

  const match = description.match(/触发词[：:]\s*(.+)/);
  if (!match) {
    return [];
  }

  return match[1]
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hexToLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return 0.5;
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastTextColor(backgroundColor: string): string {
  return hexToLuminance(backgroundColor) > 0.6 ? "#171717" : "#FFFFFF";
}

function extractHexColors(text: string): string[] {
  const matches = text.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  return [...new Set(matches)];
}

function derivePreview(
  data: Record<string, unknown>,
  body: string,
  type: CatalogItemType,
): CatalogPreview {
  const preview = data.preview as
    | { backgroundColor?: string; textColor?: string }
    | undefined;

  if (preview?.backgroundColor) {
    return {
      backgroundColor: preview.backgroundColor,
      textColor:
        preview.textColor ?? contrastTextColor(preview.backgroundColor),
    };
  }

  const primaryMatch = body.match(
    /\*\*Primary[^*]*\*\*[：:]\s*`?(#[0-9A-Fa-f]{6})`?/i,
  );
  if (primaryMatch) {
    const backgroundColor = primaryMatch[1];
    return {
      backgroundColor,
      textColor: contrastTextColor(backgroundColor),
    };
  }

  if (type === "ui") {
    const accentMatch = body.match(
      /\*\*Accent[^*]*\*\*[：:]\s*`?(#[0-9A-Fa-f]{6})`?/i,
    );
    if (accentMatch) {
      const backgroundColor = accentMatch[1];
      return {
        backgroundColor,
        textColor: contrastTextColor(backgroundColor),
      };
    }
  }

  const paletteColors = extractHexColors(body);
  if (paletteColors.length > 0) {
    const backgroundColor = paletteColors[0];
    return {
      backgroundColor,
      textColor: contrastTextColor(backgroundColor),
    };
  }

  return type === "motion"
    ? { backgroundColor: "#171717", textColor: "#FFFFFF" }
    : { backgroundColor: "#F4F4F5", textColor: "#171717" };
}

function buildItem(
  filePath: string,
  fileName: string,
  repoRoot: string,
  repo: "vibe-ui" | "vibe-motion",
  type: CatalogItemType,
  skillPath: string,
): CatalogItem {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const id =
    (typeof data.id === "string" && data.id) ||
    (typeof data.name === "string" && data.name) ||
    fileName.replace(/\.md$/, "");
  const name =
    (typeof data.name === "string" && data.name) || id.replace(/-/g, " ");
  const nameZh = typeof data.name_zh === "string" ? data.name_zh : undefined;
  const description =
    typeof data.description === "string" ? data.description.trim() : "";

  const referencePath = path
    .relative(repoRoot, filePath)
    .split(path.sep)
    .join("/");

  // Handle new cover_image and cover_video
  const publicAssetsDir = path.join(ROOT, "public/content-assets");
  if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
  }

  let coverImage: string | undefined = undefined;
  if (typeof data.cover_image === "string" && data.cover_image) {
    const assetRelativePath = data.cover_image.replace(/^\.\.\//, `skills/${type === "ui" ? "ui-style-library" : "interaction-library"}/`);
    const sourceAssetPath = path.join(repoRoot, assetRelativePath);
    const targetAssetPath = path.join(publicAssetsDir, path.basename(assetRelativePath));
    if (fs.existsSync(sourceAssetPath)) {
      fs.copyFileSync(sourceAssetPath, targetAssetPath);
      coverImage = `/content-assets/${path.basename(assetRelativePath)}`;
    }
  }

  let coverVideo: string | undefined = undefined;
  if (typeof data.cover_video === "string" && data.cover_video) {
    const assetRelativePath = data.cover_video.replace(
      /^\.\.\//,
      `skills/${type === "ui" ? "ui-style-library" : "interaction-library"}/`,
    );
    const filename = path.basename(assetRelativePath);

    if (type === "motion" && isVideoAsset(filename)) {
      coverVideo = resolveMotionAssetUrl(assetRelativePath);
    } else {
      const sourceAssetPath = path.join(repoRoot, assetRelativePath);
      const targetAssetPath = path.join(publicAssetsDir, filename);
      if (fs.existsSync(sourceAssetPath)) {
        fs.copyFileSync(sourceAssetPath, targetAssetPath);
        coverVideo = `/content-assets/${filename}`;
      } else if (type === "motion") {
        coverVideo = resolveMotionAssetUrl(assetRelativePath);
      }
    }
  }

  const assetsMatch = body.match(/`\.\.\/assets\/[^`]+`/g) ?? [];
  const bodyAssets = assetsMatch.map((item) => {
    const cleanPath = item
      .replace(/`/g, "")
      .replace(/^\.\.\//, "skills/interaction-library/");
    return cleanPath;
  });

  // Motion items: prefer cover_video (mp4) over stale gif paths in markdown body
  const assetPaths =
    type === "motion" && typeof data.cover_video === "string" && data.cover_video
      ? [
          data.cover_video.replace(
            /^\.\.\//,
            "skills/interaction-library/",
          ),
        ]
      : bodyAssets;

  assetPaths.forEach((assetPath) => {
    const filename = path.basename(assetPath);
    if (type === "motion" && isVideoAsset(filename)) {
      return;
    }

    const sourceAssetPath = path.join(repoRoot, assetPath);
    const targetAssetPath = path.join(publicAssetsDir, filename);
    if (fs.existsSync(sourceAssetPath)) {
      fs.copyFileSync(sourceAssetPath, targetAssetPath);
    } else {
      console.warn(`Warning: Asset not found at ${sourceAssetPath}`);
    }
  });

  const publicAssetsUrls = assetPaths.map((assetPath) => {
    const filename = path.basename(assetPath);
    if (type === "motion" && isVideoAsset(filename)) {
      return resolveMotionAssetUrl(assetPath);
    }
    if (fs.existsSync(path.join(repoRoot, assetPath))) {
      return `/content-assets/${filename}`;
    }
    return type === "motion" 
      ? resolveMotionAssetUrl(assetPath)
      : null;
  }).filter((url): url is string => url !== null);

  return {
    id,
    type,
    name,
    nameZh,
    description,
    domains: asStringArray(data.domain ?? data.domains),
    aesthetics: asStringArray(data.aesthetic ?? data.aesthetics),
    interactionTypes: asStringArray(data.interactionTypes ?? data.interaction_types),
    components: asStringArray(data.components),
    effects: asStringArray(data.effects),
    colorScheme:
      typeof data.color_scheme === "string" ? data.color_scheme : undefined,
    website: typeof data.website === "string" ? data.website : undefined,
    preview: derivePreview(data, body, type),
    coverImage,
    coverVideo,
    source: {
      repo,
      referencePath,
      skillPath,
    },
    assets: publicAssetsUrls,
    triggers: extractTriggers(data.description),
    content: raw,
  };
}

function scanReferences(
  repoRoot: string,
  referencesDir: string,
  repo: "vibe-ui" | "vibe-motion",
  type: CatalogItemType,
  skillPath: string,
): CatalogItem[] {
  const dir = path.join(repoRoot, referencesDir);
  if (!fs.existsSync(dir)) {
    throw new Error(`References directory not found: ${dir}`);
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .sort()
    .map((file) =>
      buildItem(path.join(dir, file), file, repoRoot, repo, type, skillPath),
    );
}

function buildFilters(items: CatalogItem[]): Catalog["filters"] {
  const uniq = (values: string[]) => [...new Set(values)].sort();

  return {
    domains: uniq(items.flatMap((item) => item.domains)),
    aesthetics: uniq(items.flatMap((item) => item.aesthetics)),
    interactionTypes: uniq(items.flatMap((item) => item.interactionTypes)),
    types: ["ui", "motion"],
  };
}

function main() {
  const vibeUi = resolveContentRoot(CONTENT_SOURCES.vibeUi.candidates);
  const vibeMotionMd = resolveContentRoot(
    CONTENT_SOURCES.vibeMotionMd.candidates,
  );

  const uiItems = scanReferences(
    vibeUi.path,
    CONTENT_SOURCES.vibeUi.referencesDir,
    CONTENT_SOURCES.vibeUi.repo,
    CONTENT_SOURCES.vibeUi.type,
    CONTENT_SOURCES.vibeUi.skillPath,
  );

  const motionItems = scanReferences(
    vibeMotionMd.path,
    CONTENT_SOURCES.vibeMotionMd.referencesDir,
    CONTENT_SOURCES.vibeMotionMd.repo,
    CONTENT_SOURCES.vibeMotionMd.type,
    CONTENT_SOURCES.vibeMotionMd.skillPath,
  );

  const items = [...uiItems, ...motionItems].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const catalog: Catalog = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    sources: {
      vibeUi: {
        path: path.relative(ROOT, vibeUi.path) || ".",
        resolvedFrom: vibeUi.resolvedFrom,
      },
      vibeMotionMd: {
        path: path.relative(ROOT, vibeMotionMd.path) || ".",
        resolvedFrom: vibeMotionMd.resolvedFrom,
      },
    },
    items,
    filters: buildFilters(items),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`Catalog written to ${OUTPUT_PATH}`);
  console.log(
    `  UI styles: ${uiItems.length} (${vibeUi.resolvedFrom}: ${vibeUi.path})`,
  );
  console.log(
    `  Motion refs: ${motionItems.length} (${vibeMotionMd.resolvedFrom}: ${vibeMotionMd.path})`,
  );
}

main();

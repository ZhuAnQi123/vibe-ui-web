import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Catalog,
  CatalogItem,
  CatalogItemType,
  CatalogListItem,
  CatalogListResponse,
} from "./types.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

let cachedCatalog: Catalog | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

function resolveLocalCatalogPath(): string | undefined {
  const candidates = [
    process.env.VIBE_CATALOG_PATH,
    path.join(moduleDir, "../../src/data/catalog.json"),
    path.join(process.cwd(), "src/data/catalog.json"),
    path.join(process.cwd(), "../src/data/catalog.json"),
  ].filter(Boolean) as string[];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function fetchRemoteCatalog(): Promise<Catalog> {
  const baseUrl = process.env.VIBE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("VIBE_API_URL is not set");
  }

  const response = await fetch(`${baseUrl}/api/catalog?includeContent=true`);
  if (!response.ok) {
    throw new Error(`Failed to fetch remote catalog (${response.status})`);
  }

  return (await response.json()) as Catalog;
}

function readLocalCatalog(): Catalog {
  const catalogPath = resolveLocalCatalogPath();
  if (!catalogPath) {
    throw new Error(
      [
        "Local catalog.json not found.",
        "Run `npm run catalog:build` in vibe-ui-web,",
        "set VIBE_CATALOG_PATH, or set VIBE_API_URL for remote mode.",
      ].join(" "),
    );
  }

  return JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Catalog;
}

export async function loadCatalog(force = false): Promise<Catalog> {
  const now = Date.now();
  if (!force && cachedCatalog && now - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  const catalog = process.env.VIBE_API_URL
    ? await fetchRemoteCatalog()
    : readLocalCatalog();

  cachedCatalog = catalog;
  cacheLoadedAt = now;
  return catalog;
}

export function toListItem(item: CatalogItem): CatalogListItem {
  const { content: _content, ...rest } = item;
  return rest;
}

export function toListResponse(catalog: Catalog): CatalogListResponse {
  return {
    ...catalog,
    items: catalog.items.map(toListItem),
  };
}

export function findItem(
  catalog: Catalog,
  id: string,
  type?: CatalogItemType,
): CatalogItem | undefined {
  const normalizedId = id.trim().toLowerCase();

  return catalog.items.find((item) => {
    if (type && item.type !== type) {
      return false;
    }

    const candidates = [
      item.id,
      item.name,
      item.nameZh,
      ...item.triggers,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return candidates.some(
      (candidate) =>
        candidate === normalizedId || candidate.includes(normalizedId),
    );
  });
}

export function searchItems(
  catalog: Catalog,
  options: {
    query?: string;
    type?: CatalogItemType | "all";
    tag?: string;
    limit?: number;
  },
): CatalogListItem[] {
  const {
    query,
    type = "all",
    tag,
    limit = 20,
  } = options;

  const normalizedQuery = query?.trim().toLowerCase();

  const results = catalog.items.filter((item) => {
    if (type !== "all" && item.type !== type) {
      return false;
    }

    if (tag) {
      const normalizedTag = tag.toLowerCase();
      const tags = (item as any).tags || [];
      if (!tags.some((value: string) => value.toLowerCase().includes(normalizedTag))) {
        return false;
      }
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      item.id,
      item.name,
      item.nameZh,
      item.description,
      item.website,
      ...item.triggers,
      ...((item as any).tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return results.slice(0, limit).map(toListItem);
}

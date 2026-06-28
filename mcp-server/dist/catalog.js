import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
let cachedCatalog = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000;
function resolveLocalCatalogPath() {
    const candidates = [
        process.env.VIBE_CATALOG_PATH,
        path.join(moduleDir, "../../src/data/catalog.json"),
        path.join(process.cwd(), "src/data/catalog.json"),
        path.join(process.cwd(), "../src/data/catalog.json"),
    ].filter(Boolean);
    return candidates.find((candidate) => fs.existsSync(candidate));
}
async function fetchRemoteCatalog() {
    const baseUrl = process.env.VIBE_API_URL?.replace(/\/$/, "");
    if (!baseUrl) {
        throw new Error("VIBE_API_URL is not set");
    }
    const response = await fetch(`${baseUrl}/api/catalog?includeContent=true`);
    if (!response.ok) {
        throw new Error(`Failed to fetch remote catalog (${response.status})`);
    }
    return (await response.json());
}
function readLocalCatalog() {
    const catalogPath = resolveLocalCatalogPath();
    if (!catalogPath) {
        throw new Error([
            "Local catalog.json not found.",
            "Run `npm run catalog:build` in vibe-ui-web,",
            "set VIBE_CATALOG_PATH, or set VIBE_API_URL for remote mode.",
        ].join(" "));
    }
    return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}
export async function loadCatalog(force = false) {
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
export function toListItem(item) {
    const { content: _content, ...rest } = item;
    return rest;
}
export function toListResponse(catalog) {
    return {
        ...catalog,
        items: catalog.items.map(toListItem),
    };
}
export function findItem(catalog, id, type) {
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
        return candidates.some((candidate) => candidate === normalizedId || candidate.includes(normalizedId));
    });
}
export function searchItems(catalog, options) {
    const { query, type = "all", domain, aesthetic, limit = 20, } = options;
    const normalizedQuery = query?.trim().toLowerCase();
    const results = catalog.items.filter((item) => {
        if (type !== "all" && item.type !== type) {
            return false;
        }
        if (domain) {
            const normalizedDomain = domain.toLowerCase();
            if (!item.domains.some((value) => value.toLowerCase().includes(normalizedDomain))) {
                return false;
            }
        }
        if (aesthetic) {
            const normalizedAesthetic = aesthetic.toLowerCase();
            if (!item.aesthetics.some((value) => value.toLowerCase().includes(normalizedAesthetic))) {
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
            ...item.domains,
            ...item.aesthetics,
            ...item.triggers,
            ...(item.components ?? []),
            ...(item.effects ?? []),
            ...(item.interactionTypes ?? []),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return haystack.includes(normalizedQuery);
    });
    return results.slice(0, limit).map(toListItem);
}

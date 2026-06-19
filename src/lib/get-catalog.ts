import catalogData from "../data/catalog.json";
import type { Catalog, CatalogItem, CatalogItemType } from "../types/catalog";

const catalog = catalogData as Catalog;

export function getCatalog(): Catalog {
  return catalog;
}

export function getCatalogItems(filter?: {
  type?: CatalogItemType | "all";
}): CatalogItem[] {
  const { type = "all" } = filter ?? {};

  if (type === "all") {
    return catalog.items;
  }

  return catalog.items.filter((item) => item.type === type);
}

/** Lightweight list items without full markdown content for client hydration. */
export type CatalogListItem = Omit<CatalogItem, "content">;

export function getCatalogListItems(filter?: {
  type?: CatalogItemType | "all";
}): CatalogListItem[] {
  return getCatalogItems(filter).map(({ content: _content, ...item }) => item);
}

export function getCatalogItemContent(
  id: string,
  type: CatalogItemType,
): string | undefined {
  return catalog.items.find((item) => item.id === id && item.type === type)
    ?.content;
}

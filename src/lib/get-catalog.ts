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

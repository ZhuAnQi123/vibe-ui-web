"use server";

import type { CatalogItemType } from "../../types/catalog";
import { getCatalogItemContent } from "../../lib/get-catalog";

export async function fetchCatalogItemContent(
  id: string,
  type: CatalogItemType,
): Promise<string> {
  return getCatalogItemContent(id, type) ?? "";
}

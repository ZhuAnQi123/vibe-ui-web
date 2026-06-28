import type { Catalog, CatalogItem, CatalogItemType, CatalogListItem, CatalogListResponse } from "./types.js";
export declare function loadCatalog(force?: boolean): Promise<Catalog>;
export declare function toListItem(item: CatalogItem): CatalogListItem;
export declare function toListResponse(catalog: Catalog): CatalogListResponse;
export declare function findItem(catalog: Catalog, id: string, type?: CatalogItemType): CatalogItem | undefined;
export declare function searchItems(catalog: Catalog, options: {
    query?: string;
    type?: CatalogItemType | "all";
    domain?: string;
    aesthetic?: string;
    limit?: number;
}): CatalogListItem[];

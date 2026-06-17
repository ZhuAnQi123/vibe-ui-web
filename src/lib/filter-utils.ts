import type { CatalogItem, CatalogItemType } from "../types/catalog";

export type FilterType = "all" | CatalogItemType;
export type FilterSort = "relevance" | "latest";

export type FilterState = {
  q: string;
  type: FilterType;
  domains: string[];
  aesthetics: string[];
  interactions: string[];
  sort: FilterSort;
};

export type FilterOptions = {
  types: FilterType[];
  domains: string[];
  aesthetics: string[];
  interactions: string[];
};

export const DEFAULT_FILTER_STATE: FilterState = {
  q: "",
  type: "all",
  domains: [],
  aesthetics: [],
  interactions: [],
  sort: "relevance",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function stableSort(values: string[]): string[] {
  return [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function buildFilterOptions(items: CatalogItem[]): FilterOptions {
  const domains = stableSort(
    [...new Set(items.flatMap((item) => item.domains))].filter(Boolean),
  );
  const aesthetics = stableSort(
    [...new Set(items.flatMap((item) => item.aesthetics))].filter(Boolean),
  );
  const interactions = stableSort(
    [...new Set(items.flatMap((item) => item.interactionTypes))].filter(Boolean),
  );

  return {
    types: ["all", "ui", "motion"],
    domains,
    aesthetics,
    interactions,
  };
}

function matchesAny(selectedValues: string[], itemValues: string[]): boolean {
  if (selectedValues.length === 0) {
    return true;
  }

  return selectedValues.some((value) => itemValues.includes(value));
}

export function applyFilters(
  items: CatalogItem[],
  filterState: FilterState,
): CatalogItem[] {
  const normalizedQuery = normalizeText(filterState.q);

  return items.filter((item) => {
    if (filterState.type !== "all" && item.type !== filterState.type) {
      return false;
    }

    if (!matchesAny(filterState.domains, item.domains)) {
      return false;
    }

    if (!matchesAny(filterState.aesthetics, item.aesthetics)) {
      return false;
    }

    if (!matchesAny(filterState.interactions, item.interactionTypes)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      item.name,
      item.description,
      ...item.domains,
      ...item.aesthetics,
      ...item.interactionTypes,
      ...item.triggers,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function splitParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseFilterStateFromSearchParams(
  params: URLSearchParams,
): FilterState {
  const typeParam = params.get("type");
  const type: FilterType =
    typeParam === "ui" || typeParam === "motion" ? typeParam : "all";

  const sortParam = params.get("sort");
  const sort: FilterSort = sortParam === "latest" ? "latest" : "relevance";

  return {
    q: params.get("q") ?? "",
    type,
    domains: splitParam(params.get("domains")),
    aesthetics: splitParam(params.get("aesthetics")),
    interactions: splitParam(params.get("interactions")),
    sort,
  };
}

export function buildSearchParamsFromFilterState(
  filterState: FilterState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filterState.q.trim()) {
    params.set("q", filterState.q.trim());
  }

  if (filterState.type !== "all") {
    params.set("type", filterState.type);
  }

  if (filterState.domains.length > 0) {
    params.set("domains", filterState.domains.join(","));
  }

  if (filterState.aesthetics.length > 0) {
    params.set("aesthetics", filterState.aesthetics.join(","));
  }

  if (filterState.interactions.length > 0) {
    params.set("interactions", filterState.interactions.join(","));
  }

  if (filterState.sort !== "relevance") {
    params.set("sort", filterState.sort);
  }

  return params;
}

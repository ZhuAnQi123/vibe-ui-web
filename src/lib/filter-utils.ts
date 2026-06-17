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

export type InteractionFacetKind = "interaction" | "effect" | "component";
export type InteractionFacet = {
  kind: InteractionFacetKind;
  value: string;
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

const INTERACTION_FACET_SEPARATOR = ":";
const INTERACTION_FACET_ORDER: Record<InteractionFacetKind, number> = {
  interaction: 0,
  effect: 1,
  component: 2,
};

export function encodeInteractionFacet(facet: InteractionFacet): string {
  return `${facet.kind}${INTERACTION_FACET_SEPARATOR}${facet.value}`;
}

export function decodeInteractionFacet(encoded: string): InteractionFacet | null {
  const separatorIndex = encoded.indexOf(INTERACTION_FACET_SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }

  const kind = encoded.slice(0, separatorIndex) as InteractionFacetKind;
  const value = encoded.slice(separatorIndex + 1).trim();

  if (!value || !["interaction", "effect", "component"].includes(kind)) {
    return null;
  }

  return { kind, value };
}

function getItemInteractionFacets(item: CatalogItem): string[] {
  const facets = [
    ...item.interactionTypes.map((value) =>
      encodeInteractionFacet({ kind: "interaction", value }),
    ),
    ...(item.effects ?? []).map((value) =>
      encodeInteractionFacet({ kind: "effect", value }),
    ),
    ...(item.components ?? []).map((value) =>
      encodeInteractionFacet({ kind: "component", value }),
    ),
  ];

  return [...new Set(facets)].filter(Boolean);
}

export function buildFilterOptions(items: CatalogItem[]): FilterOptions {
  const domains = stableSort(
    [...new Set(items.flatMap((item) => item.domains))].filter(Boolean),
  );
  const aesthetics = stableSort(
    [...new Set(items.flatMap((item) => item.aesthetics))].filter(Boolean),
  );
  const interactions = [...new Set(items.flatMap(getItemInteractionFacets))]
    .filter(Boolean)
    .sort((a, b) => {
      const aFacet = decodeInteractionFacet(a);
      const bFacet = decodeInteractionFacet(b);

      if (!aFacet || !bFacet) {
        return a.localeCompare(b);
      }

      const kindDiff =
        INTERACTION_FACET_ORDER[aFacet.kind] - INTERACTION_FACET_ORDER[bFacet.kind];
      if (kindDiff !== 0) {
        return kindDiff;
      }

      return aFacet.value.localeCompare(bFacet.value);
    });

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

function matchesAnyInteraction(selectedValues: string[], item: CatalogItem): boolean {
  if (selectedValues.length === 0) {
    return true;
  }

  const encodedFacets = getItemInteractionFacets(item);
  const rawFacetValues = new Set(
    encodedFacets.map((facet) => decodeInteractionFacet(facet)?.value ?? facet),
  );

  return selectedValues.some(
    (selected) => encodedFacets.includes(selected) || rawFacetValues.has(selected),
  );
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

    if (!matchesAnyInteraction(filterState.interactions, item)) {
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
      ...(item.effects ?? []),
      ...(item.components ?? []),
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

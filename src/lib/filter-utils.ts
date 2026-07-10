import type { CatalogListItem } from "./get-catalog";

export type FilterType = "all" | "ui" | "motion";

export type FilterState = {
  q: string;
  type: FilterType;
};

export function parseFilterStateFromSearchParams(
  params: URLSearchParams,
): FilterState {
  const typeParam = params.get("type");
  const type: FilterType =
    typeParam === "ui" || typeParam === "motion" ? typeParam : "all";

  return {
    q: params.get("q") ?? "",
    type,
  };
}

export function buildSearchParamsFromFilterState(
  state: FilterState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.q) {
    params.set("q", state.q);
  }

  if (state.type !== "all") {
    params.set("type", state.type);
  }

  return params;
}

export function applyFilters(
  items: CatalogListItem[],
  state: FilterState,
): CatalogListItem[] {
  return items.filter((item) => {
    // 1. 类型过滤 (UI / Motion)
    if (state.type !== "all" && item.type !== state.type) {
      return false;
    }

    // 2. 搜索关键词过滤 (基于新 tags)
    if (state.q) {
      const query = state.q.toLowerCase();
      // 兼容 TS 类型，如果还没更新 get-catalog.ts，断言一下
      const tags = (item as any).tags || []; 
      
      const haystack = [
        item.name,
        item.nameZh,
        item.description,
        ...tags,
        ...(item.triggers || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function buildFilterOptions(items: CatalogListItem[]) {
  return {
    // 因为标签已经下放给 StyleGrid.tsx 本地控制，全局过滤器只需保留三大类
    types: ["all", "ui", "motion"] as FilterType[],
  };
}

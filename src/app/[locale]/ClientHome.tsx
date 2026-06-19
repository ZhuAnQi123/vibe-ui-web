"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HeroSearch } from "../../components/HeroSearch";
import { ElasticFilter } from "../../components/ElasticFilter";
import { StyleGrid } from "../../components/StyleGrid";
import { LanguageToggle } from "../../components/LanguageToggle";
import type { CatalogListItem } from "../../lib/get-catalog";
import type { Dictionary } from "../../i18n/types";
import {
  applyFilters,
  buildFilterOptions,
  parseFilterStateFromSearchParams,
  buildSearchParamsFromFilterState,
  type FilterState,
} from "../../lib/filter-utils";

export const ClientHome = ({
  initialItems,
  locale,
  t,
  searchParams,
}: {
  initialItems: CatalogListItem[];
  locale: string;
  t: Dictionary;
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [filterState, setFilterState] = useState<FilterState>(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    return parseFilterStateFromSearchParams(params);
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = buildSearchParamsFromFilterState(filterState);
      const newQuery = params.toString();
      const currentQuery = window.location.search.replace(/^\?/, "");
      
      if (newQuery !== currentQuery) {
        const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
        router.replace(newUrl, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filterState, pathname, router]);

  const filterOptions = useMemo(() => buildFilterOptions(initialItems), [initialItems]);
  const filteredItems = useMemo(
    () => applyFilters(initialItems, filterState),
    [initialItems, filterState],
  );

  const toggleValue = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <main className="min-h-screen bg-vibe-flow font-sans selection:bg-neutral-900 selection:text-white relative">
      <header className="w-full h-20 flex items-center justify-between px-8 max-w-7xl mx-auto gap-4 relative">
        <div className="text-2xl font-black tracking-tighter text-neutral-900 shrink-0">
          Vibe UI<span className="text-neutral-400">.</span>
        </div>
        <div className="flex items-center gap-4 min-w-0">
          <ElasticFilter
            activeDomain={filterState.domains[0] ?? null}
            onDomainChange={(domain) =>
              setFilterState((prev) => ({
                ...prev,
                domains: domain ? [domain] : [],
              }))
            }
            domainOptions={filterOptions.domains}
            selectedAesthetics={filterState.aesthetics}
            selectedInteractions={filterState.interactions}
            aestheticOptions={filterOptions.aesthetics}
            interactionOptions={filterOptions.interactions}
            onToggleAesthetic={(value) =>
              setFilterState((prev) => ({
                ...prev,
                aesthetics: toggleValue(prev.aesthetics, value),
              }))
            }
            onToggleInteraction={(value) =>
              setFilterState((prev) => ({
                ...prev,
                interactions: toggleValue(prev.interactions, value),
              }))
            }
            onClearMoreFilters={() =>
              setFilterState((prev) => ({
                ...prev,
                aesthetics: [],
                interactions: [],
              }))
            }
          />
          <LanguageToggle />
        </div>
      </header>

      <section className="w-full pt-14 pb-12 px-4 flex flex-col items-center text-center">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 max-w-4xl leading-[1.2] flex flex-wrap justify-center items-baseline gap-y-2">
          {locale === "zh" ? (
            <>
              {t.hero.titleInject}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800 align-baseline px-2">
                {t.hero.titleHighlight}
              </span>
              {t.hero.titleSuffix}
            </>
          ) : (
            <>
              {t.hero.titleInject}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800">
                {t.hero.titleHighlight}
              </span>{" "}
              <br />
              {t.hero.titleSuffix}
            </>
          )}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-neutral-500 font-medium max-w-2xl">
          {t.hero.description}
        </p>

        <HeroSearch
          value={filterState.q}
          onChange={(q) =>
            setFilterState((prev) => ({
              ...prev,
              q,
            }))
          }
        />
      </section>

      <StyleGrid 
        items={filteredItems} 
        activeType={filterState.type}
        onTypeChange={(type) => setFilterState((prev) => ({ ...prev, type }))}
        typeOptions={filterOptions.types}
      />
    </main>
  );
};

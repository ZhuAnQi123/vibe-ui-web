"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSearch } from "../../components/HeroSearch";import { ElasticFilter } from "../../components/ElasticFilter";
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

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

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
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterOptions = useMemo(() => buildFilterOptions(initialItems), [initialItems]);
  const filteredItems = useMemo(
    () => applyFilters(initialItems, filterState),
    [initialItems, filterState],
  );

  return (
    <main className="min-h-screen bg-vibe-flow font-sans selection:bg-neutral-900 selection:text-white relative">
      <header className="w-full h-20 flex items-center justify-between px-8 max-w-7xl mx-auto gap-4 relative">
        <div className="text-2xl font-black tracking-tighter text-neutral-900 shrink-0">
          Vibe UI<span className="text-neutral-400">.</span>
        </div>
        <div className="flex items-center gap-4 min-w-0">
         
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

      {/* 回到顶部悬浮按钮 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={fluidSpring}
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 px-5 py-4 rounded-full bg-white/80 backdrop-blur-xl border border-neutral-200/50 text-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow duration-300 cursor-pointer focus:outline-none flex items-center justify-center min-w-[54px] min-h-[54px]"
            aria-label="Scroll to top"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
};

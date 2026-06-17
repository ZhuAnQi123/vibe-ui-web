"use client";

import React, { useMemo, useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { useTranslation } from "../i18n/provider";
import { decodeInteractionFacet } from "../lib/filter-utils";

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

type ElasticFilterProps = {
  activeDomain: string | null;
  onDomainChange: (domain: string | null) => void;
  domainOptions: string[];
  selectedAesthetics: string[];
  selectedInteractions: string[];
  aestheticOptions: string[];
  interactionOptions: string[];
  onToggleAesthetic: (value: string) => void;
  onToggleInteraction: (value: string) => void;
  onClearMoreFilters: () => void;
};

export const ElasticFilter = ({
  activeDomain,
  onDomainChange,
  domainOptions,
  selectedAesthetics,
  selectedInteractions,
  aestheticOptions,
  interactionOptions,
  onToggleAesthetic,
  onToggleInteraction,
  onClearMoreFilters,
}: ElasticFilterProps) => {
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const allTabs = [{ id: "__all__", label: t.filter.all }].concat(
    domainOptions.map((domain) => ({
      id: domain,
      label: t.tags[domain] || domain,
    })),
  );

  const VISIBLE_COUNT = 4;
  const baseVisible = allTabs.slice(0, VISIBLE_COUNT);
  let visibleTabs = [...baseVisible];

  const activeIndex = allTabs.findIndex(
    (tab) => tab.id === (activeDomain ?? "__all__"),
  );

  if (activeIndex >= VISIBLE_COUNT) {
    visibleTabs[VISIBLE_COUNT - 1] = allTabs[activeIndex];
  }

  const activeMoreCount =
    selectedAesthetics.length + selectedInteractions.length;
  const hasAnyMoreFilter = activeMoreCount > 0;
  const canShowMorePanel =
    aestheticOptions.length > 0 || interactionOptions.length > 0;

  const groupedInteractionOptions = useMemo(() => {
    const grouped = {
      interaction: [] as string[],
      effect: [] as string[],
      component: [] as string[],
    };

    interactionOptions.forEach((option) => {
      const decoded = decodeInteractionFacet(option);
      if (!decoded) {
        grouped.interaction.push(option);
        return;
      }

      grouped[decoded.kind].push(option);
    });

    return grouped;
  }, [interactionOptions]);

  const renderInteractionOptions = (options: string[]) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const decoded = decodeInteractionFacet(option);
        const value = decoded?.value ?? option;
        const selected = selectedInteractions.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggleInteraction(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected
                ? "bg-neutral-900 text-white shadow-md scale-105"
                : "bg-white/50 text-neutral-600 border border-neutral-200/80 hover:bg-white hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            {t.tags[value] || value}
          </button>
        );
      })}
    </div>
  );

  return (
    <LayoutGroup id="domain-filter">
      <div className="flex flex-col items-end gap-2 min-w-0 select-none">
        <div className="flex items-center gap-2 max-w-[58vw]">
          {canShowMorePanel && (
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`h-9 px-4 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 whitespace-nowrap ${
                hasAnyMoreFilter || isMoreOpen
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white/70 text-neutral-700 border-neutral-200 hover:bg-white"
              }`}
            >
              {t.filter.more}
              {activeMoreCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full bg-white/20">
                  {activeMoreCount}
                </span>
              )}
            </button>
          )}

          <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-1 relative">
            {visibleTabs.map((tab) => {
              const isActive =
                tab.id === "__all__"
                  ? activeDomain === null
                  : activeDomain === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    onDomainChange(tab.id === "__all__" ? null : tab.id)
                  }
                  className="relative px-3.5 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors duration-200 cursor-pointer focus:outline-none whitespace-nowrap"
                  style={{
                    color: isActive ? "#171717" : "rgba(23,23,23,0.5)",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="domain-slider"
                      transition={fluidSpring}
                      className="absolute inset-0 rounded-full z-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    />
                  )}

                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {isMoreOpen && canShowMorePanel && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-1/2 -translate-x-1/2 w-[80vw] bg-white/80 backdrop-blur-2xl border border-neutral-200/60 rounded-[2rem] px-8 py-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50"
            >
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold tracking-widest uppercase text-neutral-400">
                      {t.filter.aesthetics}
                    </p>
                    {selectedAesthetics.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onClearMoreFilters()}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        {t.filter.clearAll}
                      </button>
                    )}
                  </div>

                  {aestheticOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {aestheticOptions.map((item) => {
                        const selected = selectedAesthetics.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => onToggleAesthetic(item)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              selected
                                ? "bg-neutral-900 text-white shadow-md scale-105"
                                : "bg-white/50 text-neutral-600 border border-neutral-200/80 hover:bg-white hover:border-neutral-300 hover:shadow-sm"
                            }`}
                          >
                            {t.tags[item] || item}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No aesthetics available.
                    </p>
                  )}
                </div>

                <div className="w-px bg-neutral-200/50 hidden md:block" />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold tracking-widest uppercase text-neutral-400">
                      {t.filter.interactions}
                    </p>
                    {selectedInteractions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onClearMoreFilters()}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        {t.filter.clearAll}
                      </button>
                    )}
                  </div>

                  {interactionOptions.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {groupedInteractionOptions.interaction.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            {t.filter.interactionTypes}
                          </p>
                          {renderInteractionOptions(groupedInteractionOptions.interaction)}
                        </div>
                      )}

                      {groupedInteractionOptions.effect.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            {t.filter.interactionEffects}
                          </p>
                          {renderInteractionOptions(groupedInteractionOptions.effect)}
                        </div>
                      )}

                      {groupedInteractionOptions.component.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            {t.filter.interactionComponents}
                          </p>
                          {renderInteractionOptions(groupedInteractionOptions.component)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No interactions available.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

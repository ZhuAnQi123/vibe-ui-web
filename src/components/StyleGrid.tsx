"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../i18n/provider";
import type { CatalogItem } from "../types/catalog";
import { PromptModal } from "./PromptModal";
import { DemoModal } from "./DemoModal";

import type { FilterType } from "../lib/filter-utils";

type StyleGridProps = {
  items: CatalogItem[];
  activeType: FilterType;
  onTypeChange: (type: FilterType) => void;
  typeOptions: FilterType[];
};

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

function getPrimaryTag(item: CatalogItem): string {
  if (item.type === "motion") {
    return item.components?.[0] ?? item.interactionTypes[0] ?? "Motion";
  }

  return item.domains[0] ?? "General";
}

function getSecondaryTag(item: CatalogItem): string {
  if (item.type === "motion") {
    return item.effects?.[0] ?? item.domains[0] ?? "Interaction";
  }

  return item.aesthetics[0] ?? "Style";
}

export const StyleGrid = ({ items, activeType, onTypeChange, typeOptions }: StyleGridProps) => {
  const { t, locale } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [demoItem, setDemoItem] = useState<CatalogItem | null>(null);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 flex flex-col items-center">
      <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-1 mb-6">
        {typeOptions.map((tab) => {
          const isActive = activeType === tab;
          const label =
            tab === "all"
              ? t.grid.tabs.all
              : tab === "ui"
                ? t.grid.tabs.ui
                : t.grid.tabs.motion;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTypeChange(tab)}
              className="relative px-6 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors duration-200 cursor-pointer focus:outline-none whitespace-nowrap min-w-[100px]"
              style={{
                color: isActive ? "#171717" : "rgba(23,23,23,0.55)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="type-slider-grid"
                  transition={fluidSpring}
                  className="absolute inset-0 rounded-full z-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="w-full text-center text-neutral-500 py-12">
          {t.grid.empty}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.article
                layout
                key={`${item.type}:${item.id}:${item.source.referencePath}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="group relative flex flex-col gap-4 cursor-pointer"
              >
                <div
                  className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
                  style={{
                    backgroundColor: item.preview.backgroundColor,
                    color: item.preview.textColor,
                  }}
                >
                  {item.coverVideo ? (
                    <video
                      src={item.coverVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl font-black tracking-tight opacity-90 text-center px-6 leading-tight relative z-10">
                      {locale === "zh" && item.nameZh ? item.nameZh : item.name}
                    </div>
                  )}

                  <span className="absolute top-4 left-4 rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm text-white z-20">
                    {item.type === "ui" ? t.grid.typeUi : t.grid.typeMotion}
                  </span>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-100 transition-transform hover:scale-105"
                    >
                      {t.grid.viewPrompt}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === "ui" && item.website) {
                          window.open(
                            item.website,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else if (item.assets && item.assets.length > 0) {
                          setDemoItem(item);
                        } else {
                          alert("Demo coming soon!");
                        }
                      }}
                      className="bg-black/50 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black/70 backdrop-blur-md transition-transform hover:scale-105"
                    >
                      {t.grid.viewDemo}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 px-2">
                  <h3 className="text-xl font-bold text-neutral-900">
                    {locale === "zh" && item.nameZh ? item.nameZh : item.name}
                  </h3>
                  {locale === "zh" && item.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-500">
                    <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                      {t.tags[getPrimaryTag(item)] || getPrimaryTag(item)}
                    </span>
                    <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                      {t.tags[getSecondaryTag(item)] || getSecondaryTag(item)}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <PromptModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <DemoModal item={demoItem} onClose={() => setDemoItem(null)} />
    </div>
  );
};

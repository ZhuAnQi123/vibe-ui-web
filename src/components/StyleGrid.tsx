"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../i18n/provider";
import type { CatalogItem } from "../types/catalog";

type StyleGridProps = {
  items: CatalogItem[];
};

function getPrimaryTag(item: CatalogItem): string {
  if (item.type === "motion") {
    return item.interactionTypes[0] ?? "Motion";
  }

  return item.domains[0] ?? "General";
}

function getSecondaryTag(item: CatalogItem): string {
  if (item.type === "motion") {
    return item.domains[0] ?? "Interaction";
  }

  return item.aesthetics[0] ?? "Style";
}

export const StyleGrid = ({ items }: StyleGridProps) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 pb-24 text-center text-neutral-500">
        {t.grid.empty}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 pb-24">
      {items.map((item, i) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group relative flex flex-col gap-4 cursor-pointer"
        >
          <div
            className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center p-8 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
            style={{
              backgroundColor: item.preview.backgroundColor,
              color: item.preview.textColor,
            }}
          >
            <span className="absolute top-4 left-4 rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
              {item.type === "ui" ? t.grid.typeUi : t.grid.typeMotion}
            </span>

            <div className="text-3xl font-black tracking-tight opacity-90 text-center">
              {item.name}
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-4">
              <button
                type="button"
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-100 transition-transform hover:scale-105"
              >
                {t.grid.viewPrompt}
              </button>
              <button
                type="button"
                className="bg-black/50 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black/70 backdrop-blur-md transition-transform hover:scale-105"
              >
                {t.grid.copySkill}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 px-2">
            <h3 className="text-xl font-bold text-neutral-900">{item.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-500">
              <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                {getPrimaryTag(item)}
              </span>
              <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                {getSecondaryTag(item)}
              </span>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

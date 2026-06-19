"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../i18n/provider";
import type { CatalogListItem } from "../lib/get-catalog";
import { PromptModal } from "./PromptModal";
import { DemoModal } from "./DemoModal";

import type { FilterType } from "../lib/filter-utils";

type StyleGridProps = {
  items: CatalogListItem[];
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

function getPrimaryTag(item: CatalogListItem): string {
  if (item.type === "motion") {
    return item.components?.[0] ?? item.interactionTypes[0] ?? "Motion";
  }

  return item.domains[0] ?? "General";
}

function getSecondaryTag(item: CatalogListItem): string {
  if (item.type === "motion") {
    return item.effects?.[0] ?? item.domains[0] ?? "Interaction";
  }

  return item.aesthetics[0] ?? "Style";
}

function useInView<T extends HTMLElement>(rootMargin = "80px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

type StyleCardProps = {
  item: CatalogListItem;
  locale: string;
  t: ReturnType<typeof useTranslation>["t"];
  setSelectedItem: (item: CatalogListItem) => void;
  setDemoItem: (item: CatalogListItem) => void;
};

const StyleCard = ({
  item,
  locale,
  t,
  setSelectedItem,
  setDemoItem,
}: StyleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const { ref: cardRef, inView } = useInView<HTMLElement>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isHovered) return;
      if (rafRef.current !== null) return;

      const { clientX, clientY } = e;
      const target = e.currentTarget;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = target.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setRotateX(((y - centerY) / centerY) * 3);
        setRotateY(((x - centerX) / centerX) * -3);
        setTranslateX(((x - centerX) / centerX) * 5);
        setTranslateY(((y - centerY) / centerY) * 5);
      });
    },
    [isHovered],
  );

  const handleMouseLeave = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setTranslateX(0);
    setTranslateY(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col gap-4 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          x: isHovered ? translateX : 0,
          y: isHovered ? translateY : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center relative overflow-hidden transition-shadow duration-500 group-hover:shadow-2xl"
        style={{
          backgroundColor: item.preview.backgroundColor,
          color: item.preview.textColor,
          transformStyle: "preserve-3d",
        }}
      >
        {item.coverVideo ? (
          <video
            ref={videoRef}
            src={item.coverVideo}
            loop
            muted
            playsInline
            preload={inView ? "metadata" : "none"}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-105" : "scale-100"}`}
          />
        ) : item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-105" : "scale-100"}`}
          />
        ) : (
          <div className="text-3xl font-black tracking-tight opacity-90 text-center px-6 leading-tight relative z-10 flex items-center justify-center h-full">
            {locale === "zh" && item.nameZh ? item.nameZh : item.name}
          </div>
        )}

        <span className="absolute top-4 left-4 rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm text-white z-20">
          {item.type === "ui" ? t.grid.typeUi : t.grid.typeMotion}
        </span>

        <div className="absolute inset-0 bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(item);
            }}
            className="bg-white/90 text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white hover:scale-105 transition-all shadow-sm"
          >
            {t.grid.viewPrompt}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (item.type === "ui" && item.website) {
                window.open(item.website, "_blank", "noopener,noreferrer");
              } else if (
                (item.assets && item.assets.length > 0) ||
                item.coverVideo
              ) {
                setDemoItem(item);
              } else {
                alert("Demo coming soon!");
              }
            }}
            className="bg-black/50 text-white border border-white/30 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black/60 hover:scale-105 transition-all shadow-sm"
          >
            {t.grid.viewDemo}
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col gap-2 px-2">
        <h3 className="text-xl font-bold text-neutral-900 leading-snug flex items-center">
          {locale === "zh" && item.nameZh ? item.nameZh : item.name}
        </h3>
        {locale === "zh" && item.description && (
          <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-1">
            {item.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="bg-neutral-50 border border-slate-200/50 text-neutral-500 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider">
            {t.tags[getPrimaryTag(item)] || getPrimaryTag(item)}
          </span>
          <span className="bg-neutral-50 border border-slate-200/50 text-neutral-500 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider">
            {t.tags[getSecondaryTag(item)] || getSecondaryTag(item)}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export const StyleGrid = ({
  items,
  activeType,
  onTypeChange,
  typeOptions,
}: StyleGridProps) => {
  const { t, locale } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<CatalogListItem | null>(null);
  const [demoItem, setDemoItem] = useState<CatalogListItem | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <AnimatePresence mode="sync">
            {items.map((item) => (
              <StyleCard
                key={`${item.type}:${item.id}:${item.source.referencePath}`}
                item={item}
                locale={locale}
                t={t}
                setSelectedItem={setSelectedItem}
                setDemoItem={setDemoItem}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <PromptModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <DemoModal item={demoItem} onClose={() => setDemoItem(null)} />
    </div>
  );
};

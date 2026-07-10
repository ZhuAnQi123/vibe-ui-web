"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTranslation } from "../i18n/provider";
import type { CatalogListItem } from "../lib/get-catalog";
import { PromptModal } from "./PromptModal";
import { DemoModal } from "./DemoModal";
import { ElasticFilter } from "./ElasticFilter";

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
  const tags = item.tags || [];
  if (tags.length > 0) {
    return tags[0];
  }
  return item.type === "motion" ? "Motion" : "Style";
}

function getSecondaryTag(item: CatalogListItem): string {
  const tags = item.tags || [];
  if (tags.length > 1) {
    return tags[1];
  }
  return "";
}

function useInView<T extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold: 0.05 },
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: cardRef, inView } = useInView<HTMLElement>("300px");

  // 使用 Framer Motion 的 MotionValue 驱动 3D 倾斜，避免鼠标移动时触发 React State 改变和组件重绘
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateXSpring = useSpring(useTransform(y, [0, 1], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-3, 3]), { stiffness: 300, damping: 30 });
  const translateXSpring = useSpring(useTransform(x, [0, 1], [-5, 5]), { stiffness: 300, damping: 30 });
  const translateYSpring = useSpring(useTransform(y, [0, 1], [-5, 5]), { stiffness: 300, damping: 30 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      // content-visibility: auto 允许浏览器跳过视口外卡片的渲染树构建，极大地提升长列表的初始化和滚动性能
      className="group relative flex flex-col gap-4 cursor-pointer contain-intrinsic-size-[400px] [content-visibility:auto]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? rotateXSpring.get() : 0,
          rotateY: isHovered ? rotateYSpring.get() : 0,
          x: isHovered ? translateXSpring.get() : 0,
          y: isHovered ? translateYSpring.get() : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center relative overflow-hidden transition-shadow duration-500 group-hover:shadow-2xl"
        style={{
          backgroundColor: item.preview.backgroundColor,
          color: item.preview.textColor,
          transformStyle: "preserve-3d",
        }}
      >
        {/* 极致优化：只有在 inView（接近或进入视口）时才挂载 DOM 媒体资源，彻底释放初次加载的网络与硬件带宽 */}
        {inView && item.coverVideo ? (
          <video
            ref={videoRef}
            src={item.coverVideo}
            loop
            muted
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-105" : "scale-100"}`}
          />
        ) : inView && item.coverImage ? (
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
          {getPrimaryTag(item) && (
            <span className="bg-neutral-50 border border-slate-200/50 text-neutral-500 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider">
              {t.tags[getPrimaryTag(item)] || getPrimaryTag(item)}
            </span>
          )}
          {getSecondaryTag(item) && (
            <span className="bg-neutral-50 border border-slate-200/50 text-neutral-500 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider">
              {t.tags[getSecondaryTag(item)] || getSecondaryTag(item)}
            </span>
          )}
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
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  // 联动过滤卡片列表数据
  const filteredItems = items.filter((item) => {
    if (!activeDomain) return true;
    const tags = item.tags || [];
    return tags.includes(activeDomain);
  });

  // 当主大类 Tab (activeType) 改变时，重置当前的标签激活状态
  useEffect(() => {
    setActiveDomain(null);
  }, [activeType]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 flex flex-col items-center">
      {/* 顶部主分类选择 Tab */}
      <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-1 mb-2">
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

      {/* 阶段三核心联动：将扁平化的 7+12 精选滑块引入 StyleGrid 作为子级过滤逻辑 */}
      <div className="w-full mb-10">
        <ElasticFilter
          activeDomain={activeDomain}
          onDomainChange={setActiveDomain}
          activeType={activeType}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="w-full text-center text-neutral-500 py-12">
          {t.grid.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <AnimatePresence mode="sync">
            {filteredItems.map((item) => (
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

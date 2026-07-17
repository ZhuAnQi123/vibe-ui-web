"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSearch } from "../../components/HeroSearch";import { ElasticFilter } from "../../components/ElasticFilter";
import { StyleGrid } from "../../components/StyleGrid";
import { LanguageToggle } from "../../components/LanguageToggle";
import { McpStatusBadge } from "../../components/McpStatusBadge";
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

const pageContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const pageItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

// 模块级变量：生命周期跟随当前浏览器标签页。
// 完美解决路由切换重复触发动画的问题，且完全不需要 localStorage。
let hasPlayedOpeningAnimation = false;

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
  
  // 初始化时读取模块变量，确保二次路由进入时直接为 false，跳过开场动画
  const [isOpening, setIsOpening] = useState(!hasPlayedOpeningAnimation);

  // 开场动画生命周期控制：1.5s 后触发转场过渡
  useEffect(() => {
    // 如果已经播放过，直接略过
    if (hasPlayedOpeningAnimation) return;

    const timer = setTimeout(() => {
      setIsOpening(false);
      hasPlayedOpeningAnimation = true; // 标记已播放
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
    <main className="min-h-screen bg-vibe-flow font-sans selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      {/* 1. 开场动画全屏 Overlay 阶段 */}
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              y: "-100%", // 像高级大剧院幕布一样向上滑出物理视口
              transition: { 
                duration: 0.95, 
                ease: [0.76, 0, 0.24, 1] // 极度丝滑的 Quintic Ease-In-Out
              }
            }}
            className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center px-4 origin-top"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 max-w-6xl w-full">
              
              {/* 中央两行主文字 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 shrink-0">
                {/* 第一行文字 */}
                <motion.div
                  initial={{ opacity: 0, z: -10, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    z: 0, 
                    y: 0, 
                    scale: 1,
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-200/95"
                >
                  通过精准提示词高度还原你想要的
                </motion.div>
                
                {/* 第二行文字 */}
                <motion.div
                  initial={{ opacity: 0, z: -10, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    z: 0, 
                    y: 0, 
                    scale: 1,
                    transition: { duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
                >
                  Vibe Coding页面
                </motion.div>
              </div>

              {/* 右侧 Logo 品牌登场 */}
              <motion.div
                layoutId="brand-logo"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  transition: { 
                    duration: 0.7, 
                    delay: 0.4, 
                    type: "spring",
                    stiffness: 120,
                    damping: 14 
                  } 
                }}
                className="px-6 py-3 rounded-2xl bg-white text-neutral-950 text-2xl md:text-3xl font-black tracking-tighter shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center"
              >
                Vibe UI.
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 主页面内容：在 isOpening 为 false 时或过渡期无缝衔接 */}
      <header className="w-full h-20 flex items-center justify-between px-8 max-w-7xl mx-auto gap-4 relative z-10">
        {/* Logo 轨迹过渡目标 */}
        <div className="shrink-0">
          {!isOpening ? (
            <motion.div 
              layoutId="brand-logo"
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} // 与幕布上滑完美合拍的物理路径
              className="text-2xl font-black tracking-tighter text-neutral-900 cursor-default bg-transparent p-0"
            >
              Vibe UI<span className="text-neutral-400">.</span>
            </motion.div>
          ) : (
            <div className="w-[100px] h-8" /> // 保持占位
          )}
        </div>
        <div className="flex items-center gap-4 min-w-0">
          <McpStatusBadge />
          <LanguageToggle />
        </div>
      </header>

      {/* 主视觉 Hero 区域 */}
      <section className="w-full pt-14 pb-12 px-4 flex flex-col items-center text-center relative z-10">
        <motion.div
          variants={pageContentVariants}
          initial="hidden"
          animate={!isOpening ? "visible" : "hidden"}
          className="w-full flex flex-col items-center"
        >
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 max-w-4xl leading-[1.2] flex flex-wrap justify-center items-baseline gap-y-2">
            {locale === "zh" ? (
              <>
                <span className="text-neutral-900">{t.hero.titleInject}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800 align-baseline px-2 inline-block">
                  {t.hero.titleHighlight}
                </span>
                <span>{t.hero.titleSuffix}</span>
              </>
            ) : (
              <>
                <span className="mr-3">{t.hero.titleInject}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800 inline-block mr-3">
                  {t.hero.titleHighlight}
                </span>
                <br />
                <span className="w-full">{t.hero.titleSuffix}</span>
              </>
            )}
          </h1>

          {/* 搜索和描述部分采用 Stagger 阶梯渐显 */}
          <motion.p 
            variants={pageItemVariants} 
            className="mt-6 text-lg md:text-xl text-neutral-500 font-medium max-w-2xl"
          >
            {t.hero.description}
          </motion.p>

          <motion.div variants={pageItemVariants} className="w-full max-w-md mt-2">
            <HeroSearch
              value={filterState.q}
              onChange={(q) =>
                setFilterState((prev) => ({
                  ...prev,
                  q,
                }))
              }
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 过滤器与风格网格卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={!isOpening ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <StyleGrid 
          items={filteredItems} 
          activeType={filterState.type}
          onTypeChange={(type) => setFilterState((prev) => ({ ...prev, type }))}
          typeOptions={filterOptions.types}
        />
      </motion.div>

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

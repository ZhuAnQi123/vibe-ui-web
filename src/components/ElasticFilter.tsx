"use client";

import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useTranslation } from "../i18n/provider";

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

// 统一精选的 UI (7个) 与 Motion (12个) 标签
const SELECTED_UI_TAGS = ["Bento", "Brutalist", "Minimalist", "Organic", "Terminal", "SaaS", "Editorial"];
const SELECTED_MOTION_TAGS = [
  "Elastic", "Magnetic", "Scroll", "Reveal", "Hover", "Proximity", 
  "Curtain", "Button", "Card", "Carousel", "Accordion", "Click"
];

type ElasticFilterProps = {
  activeDomain: string | null;
  onDomainChange: (domain: string | null) => void;
  activeType: "all" | "ui" | "motion";
};

export const ElasticFilter = ({
  activeDomain,
  onDomainChange,
  activeType,
}: ElasticFilterProps) => {
  const { t } = useTranslation();

  // 根据 Recent Design 哲学，标签栏不再采用多维交叉抽屉，而是直接扁平化为一阶主滑块。
  // 主滑块会根据当前所属大类（UI 或 Motion）自适应显示扁平化后的 7 + 12 精选标签。
  const tagsToRender = activeType === "motion" 
    ? SELECTED_MOTION_TAGS 
    : activeType === "ui" 
      ? SELECTED_UI_TAGS 
      : [...new Set([...SELECTED_UI_TAGS, ...SELECTED_MOTION_TAGS])]; // "all" 状态下展示两者的交集并去重

  const allTabs = [{ id: "__all__", label: t.filter.all }].concat(
    tagsToRender.map((tag) => ({
      id: tag,
      label: t.tags[tag] || tag,
    })),
  );

  return (
    <LayoutGroup id="domain-filter">
      <div className="flex flex-col items-center w-full min-w-0 select-none">
        {/* 
          滚动自适应容器：在移动端支持横向惯性滚动，在桌面端保持无感滚动条。
          这使得 UI 7个标签及 Motion 12个标签均能以优雅、连续且不拥挤的 Slider 呈现在单层级中。
        */}
        <div className="w-full overflow-x-auto scrollbar-none flex justify-center py-2">
          <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-1 relative whitespace-nowrap">
            {allTabs.map((tab) => {
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
                    className="relative px-4 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors duration-200 cursor-pointer focus:outline-none"
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
      </div>
    </LayoutGroup>
  );
};

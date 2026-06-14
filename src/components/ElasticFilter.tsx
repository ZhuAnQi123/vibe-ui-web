"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useTranslation } from "../i18n/provider";

const DOMAIN_IDS = [
  { id: "all", key: "all" as const, type: "dark" as const },
  { id: "saas", key: "saas" as const, type: "light" as const },
  { id: "finance", key: "finance" as const, type: "light" as const },
  { id: "healthcare", key: "healthcare" as const, type: "light" as const },
  { id: "portfolio", key: "portfolio" as const, type: "light" as const },
  { id: "terminal", key: "terminal" as const, type: "light" as const },
];

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

export const ElasticFilter = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <LayoutGroup id="domain-filter">
      <div className="flex items-center justify-center select-none my-2 overflow-x-auto hide-scrollbar min-w-0">
        <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-1">
          {DOMAIN_IDS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDarkBg = tab.type === "dark";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-6 py-2.5 rounded-full text-base font-semibold tracking-tight transition-colors duration-200 cursor-pointer focus:outline-none whitespace-nowrap min-w-[80px]"
                style={{
                  color: isActive
                    ? isDarkBg
                      ? "#ffffff"
                      : "#171717"
                    : "rgba(23,23,23,0.5)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="fluidSlider"
                    transition={fluidSpring}
                    className={`absolute inset-0 rounded-full z-0 ${
                      isDarkBg
                        ? "bg-neutral-900 shadow-md"
                        : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    }`}
                  />
                )}

                <span className="relative z-10">{t.filter[tab.key]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
};

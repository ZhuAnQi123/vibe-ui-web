"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../i18n/provider";

const fluidSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.9,
};

type HeroSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const HeroSearch = ({ value, onChange }: HeroSearchProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "搜索 '霓虹极简' ...",
    "探索 '赛博朋克 动效' ...",
    "输入 'SaaS 干净风格' ..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isActive = isHovered || isFocused;

  return (
    <div className="w-full flex justify-center select-none my-12">
      <div
        className="w-full max-w-2xl h-20 bg-white/80 backdrop-blur-xl border-2 border-neutral-900 rounded-[2.5rem] flex items-center justify-between pl-8 pr-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full flex items-center">
          {!value && (
            <div className="absolute inset-0 flex items-center pointer-events-none z-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-xl text-neutral-400 font-medium"
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <input
            type="text"
            value={value}
            className="w-full h-full bg-transparent text-xl text-neutral-800 font-medium focus:outline-none relative z-10"
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        <div className="flex items-center gap-4 relative shrink-0">
          <motion.div
            animate={{
              x: isActive ? 25 : 0,
              opacity: isActive ? 0 : 1,
              scale: isActive ? 0.4 : 1,
            }}
            transition={fluidSpring}
            className="w-4 h-4 rounded-full bg-neutral-900 z-10"
          />

          <motion.button
            type="button"
            animate={{
              width: isActive ? "140px" : "96px",
            }}
            transition={fluidSpring}
            className="h-16 bg-neutral-900 text-white font-bold text-lg rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden relative z-20 hover:bg-black"
          >
            <motion.span
              layout="position"
              className="tracking-wide whitespace-nowrap"
            >
              {isActive ? t.search.search : t.search.go}
            </motion.span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

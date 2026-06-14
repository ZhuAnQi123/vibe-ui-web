"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../i18n/provider";

const fluidSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.9,
};

export const HeroSearch = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isHovered || isFocused;

  return (
    <div className="w-full flex justify-center select-none my-12">
      <div
        className="w-full max-w-2xl h-20 bg-white/80 backdrop-blur-xl border-2 border-neutral-900 rounded-[2.5rem] flex items-center justify-between pl-8 pr-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="text"
          placeholder={t.search.placeholder}
          className="w-full h-full bg-transparent text-xl text-neutral-800 font-medium placeholder-neutral-400 focus:outline-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

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

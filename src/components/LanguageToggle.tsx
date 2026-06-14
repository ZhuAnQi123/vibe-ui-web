"use client";

import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  localeLabels,
  locales,
  type Locale,
} from "../i18n/config";
import { useTranslation } from "../i18n/provider";

const fluidSpring = {
  type: "spring" as const,
  stiffness: 450,
  damping: 26,
  mass: 0.8,
};

export function LanguageToggle() {
  const { locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    document.cookie = `locale=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;

    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  return (
    <LayoutGroup id="language-toggle">
      <div className="flex items-center select-none shrink-0">
        <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200/50 gap-0.5">
          {locales.map((item) => {
            const isActive = locale === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => switchLocale(item)}
                aria-label={`Switch to ${localeLabels[item]}`}
                aria-pressed={isActive}
                className="relative px-4 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors duration-200 cursor-pointer focus:outline-none whitespace-nowrap min-w-[52px]"
                style={{
                  color: isActive ? "#171717" : "rgba(23,23,23,0.5)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="langSlider"
                    transition={fluidSpring}
                    className="absolute inset-0 rounded-full z-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  />
                )}
                <span className="relative z-10">{localeLabels[item]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../i18n/provider";

const MOCK_STYLES = [
  {
    id: "copula",
    name: "Copula Agency",
    color: "bg-[#FF4500]",
    textColor: "text-[#F4F1EA]",
  },
  {
    id: "tiimo",
    name: "Tiimo Organic",
    color: "bg-[#5BA8A0]",
    textColor: "text-white",
  },
  {
    id: "units",
    name: "Units Housing",
    color: "bg-[#FFBB00]",
    textColor: "text-black",
  },
  {
    id: "vercel",
    name: "Vercel Geist",
    color: "bg-black",
    textColor: "text-white",
  },
  {
    id: "linear",
    name: "Linear App",
    color: "bg-[#5E6AD2]",
    textColor: "text-white",
  },
  {
    id: "stripe",
    name: "Stripe Press",
    color: "bg-[#F6F9FC]",
    textColor: "text-[#0A2540]",
  },
];

export const StyleGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 pb-24">
      {MOCK_STYLES.map((style, i) => {
        const styleMeta = t.grid.styles[style.id];

        return (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative flex flex-col gap-4 cursor-pointer"
          >
            <div
              className={`w-full aspect-[4/3] rounded-3xl ${style.color} flex items-center justify-center p-8 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl`}
            >
              <div
                className={`text-3xl font-black tracking-tight ${style.textColor} opacity-90`}
              >
                {style.name}
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-4">
                <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-100 transition-transform hover:scale-105">
                  {t.grid.viewPrompt}
                </button>
                <button className="bg-black/50 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black/70 backdrop-blur-md transition-transform hover:scale-105">
                  {t.grid.copySkill}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 px-2">
              <h3 className="text-xl font-bold text-neutral-900">{style.name}</h3>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                  {styleMeta.domain}
                </span>
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md">
                  {styleMeta.aesthetic}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatalogItem } from "../types/catalog";

type DemoModalProps = {
  item: CatalogItem | null;
  onClose: () => void;
};

export const DemoModal = ({ item, onClose }: DemoModalProps) => {
  const [mounted, setMounted] = useState(false);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !item || item.assets.length === 0) return null;

  const assetUrl = item.assets[0];
  const isVideo = assetUrl.endsWith(".mp4") || assetUrl.endsWith(".webm") || assetUrl.endsWith(".mov");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl flex flex-col bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-end z-10 pointer-events-none">
            <button
              onClick={onClose}
              className="p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors pointer-events-auto border border-white/10"
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="w-full bg-black flex items-center justify-center min-h-[50vh] max-h-[85vh]">
            {isVideo ? (
              <video
                src={assetUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={assetUrl}
                alt={`${item.name} demo`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          <div className="p-6 bg-neutral-900 border-t border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{item.name}</h3>
              <p className="text-neutral-400 text-sm mt-1 line-clamp-1">{item.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
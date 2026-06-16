"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CatalogItem } from "../types/catalog";
import { useTranslation } from "../i18n/provider";

type PromptModalProps = {
  item: CatalogItem | null;
  onClose: () => void;
};

export const PromptModal = ({ item, onClose }: PromptModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent hydration mismatch for syntax highlighter
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(item.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header (Black) */}
            <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 font-mono text-sm text-neutral-400">
                  {item.source.referencePath}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isCopied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-transparent"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {t.modal.copied}
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      {t.modal.copy}
                    </>
                  )}
                </motion.button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
            </div>

            {/* Content (White with animated code) */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#1E1E1E]">
              <SyntaxHighlighter
                language="markdown"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: "transparent",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
                wrapLines={true}
                lineProps={(lineNumber) => {
                  return {
                    style: {
                      display: "block",
                      animation: `fade-in-up 0.4s ease-out forwards`,
                      animationDelay: `${Math.min(lineNumber * 0.02, 2)}s`, // Cap delay at 2s so it doesn't take forever
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                  };
                }}
              >
                {item.content}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

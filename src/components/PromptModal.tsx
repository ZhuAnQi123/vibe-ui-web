"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CatalogListItem } from "../lib/get-catalog";
import { fetchCatalogItemContent } from "../app/actions/catalog";
import { useTranslation } from "../i18n/provider";
import { DotsLoading } from "./DotsLoading";

type PromptModalProps = {
  item: CatalogListItem | null;
  onClose: () => void;
};

// 扩展 item 结构类型以支持动态 assetsMeta 渲染
interface ExtendedCatalogListItem extends CatalogListItem {
  assetsMeta?: {
    required: boolean;
    items: Array<{
      name: string;
      type: string;
      description: string;
      templateUrl?: string;
    }>;
    dependencies: string[];
  };
}

export const PromptModal = ({ item: rawItem, onClose }: PromptModalProps) => {
  const item = rawItem as ExtendedCatalogListItem | null;
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isTriggerCopied, setIsTriggerCopied] = useState(false);
  const [content, setContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
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

  useEffect(() => {
    if (!item) {
      setContent("");
      return;
    }

    let cancelled = false;
    setIsLoadingContent(true);

    fetchCatalogItemContent(item.id, item.type)
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingContent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item]);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
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
            className="relative w-full max-w-6xl h-[85vh] flex flex-col bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 顶栏 Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-neutral-800 text-white shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 font-mono text-sm text-neutral-400">
                  {item.source.referencePath}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* 只有当明确标记需要素材时，才展示醒目的素材盾牌提醒 */}
                {item.type === "motion" && item.assetsMeta?.required && item.assetsMeta?.items && item.assetsMeta.items.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-medium mr-2">
                    ⚠️ 需要提供素材
                  </div>
                )}
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

            {/* 核心双栏工作区 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 左侧栏：AI 指引与素材检查（Prerequisite Checklist） */}
              {item.type === "motion" ? (
                <div className="w-full md:w-80 shrink-0 bg-[#0A0A0A] border-r border-neutral-800 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-neutral-800 pb-3">
                     使用方法
                  </h3>

                  {/* B. 方式二：手动复制粘贴提示词 */}
                  <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/80 mb-4">
                    <h4 className="text-yellow-500/90 font-semibold text-xs mb-3 flex items-center gap-1.5">
                      方式 A：在代码编辑器中实现
                    </h4>
                    <ul className="space-y-3 text-xs text-neutral-400 leading-relaxed">
                      <li className="flex gap-2">
                        <span className="text-neutral-600 font-bold">01</span>
                        <span>复制右侧 Prompt，并在聊天框中 
                            <span className="text-neutral-200 text-yellow-500/90">@ 您的目标组件文件
                            </span>
                           明确告诉AI你想在什么组件上实现</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-neutral-600 font-bold">02</span>
                        <span>将您项目中的 <strong>package.json</strong> 添加到对话让agent根据你的依赖更好为你实现。</span>
                      </li>
                    </ul>
                  </div>

                  {/* A. 方式一：MCP 智能体自动化协同 (Phase 3 核心亮点) */}
                  <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 mb-4">
                    <h4 className="text-yellow-500/90 font-semibold text-xs mb-3 flex items-center gap-1.5">
                      方式 B：已安装好 MCP 的用户
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                      已在 IDE 中配置好 MCP 后，您可以直接在 Composer 或 Chat 框中 
                      <span className="text-neutral-200 text-yellow-500/90">@ 您的目标组件文件</span>明确告诉AI你想在什么组件上实现。直接说：
                    </p>

                    {/* 动态展示该 Item 专用的 MCP 调试指令与 API 请求示例 */}
                    <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-800/80 mb-3 font-mono text-[11px] text-neutral-400 space-y-1.5">
                      你请帮我引用 vibe-ui 里的 {item.name} 这个动效实现xx组件
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {/* C. 条件展示：仅在需要素材时列出特定素材自备规范提示 */}
                    {item.assetsMeta?.required && item.assetsMeta?.items && item.assetsMeta.items.length > 0 &&(
                      <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10">
                        <h4 className="text-neutral-200 font-medium text-xs mb-3 flex items-center gap-1">🛡️ 素材盾自备提示</h4>
                        {item.assetsMeta.items.map((asset, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <label className="flex items-start gap-2.5 text-sm text-neutral-400">
                              <input type="checkbox" readOnly checked className="mt-0.5 rounded border-neutral-700 bg-neutral-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-neutral-900" />
                              <span className="text-xs leading-relaxed">
                                <strong className="text-neutral-200">{asset.name} ({asset.type})</strong>: {asset.description}
                              </span>
                            </label>
                          </div>
                        ))}
                        <p className="text-[10px] text-yellow-500/70 mt-3 leading-relaxed">
                          * 请在向 AI 发出指令前，自行在本地项目中准备好上述格式的对应素材。
                        </p>
                      </div>
                    ) }

                    {/* D. 条件展示：核心依赖项检查态 */}
                    {item.assetsMeta?.dependencies && item.assetsMeta.dependencies.length > 0 && (
                      <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                        <h4 className="text-neutral-200 font-medium text-xs mb-3">📦 核心依赖包</h4>
                        <label className="flex items-start gap-2.5 text-sm text-neutral-400">
                          <input type="checkbox" readOnly checked className="mt-0.5 rounded border-neutral-700 bg-neutral-800 text-yellow-500" />
                          <span className="text-xs font-mono text-neutral-300">
                            {item.assetsMeta.dependencies.join(", ")}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                
                </div>
              ) : null}

              {/* 右侧栏：Prompt Code 原文 */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#121212] custom-scrollbar">
                {isLoadingContent ? (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                    <DotsLoading className="text-neutral-500" />
                  </div>
                ) : (
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
                          animationDelay: `${Math.min(lineNumber * 0.02, 2)}s`,
                          opacity: 0,
                          transform: "translateY(10px)",
                        },
                      };
                    }}
                  >
                    {content}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { DotsLoading } from "./DotsLoading";

/**
 * 带有独立复制按钮的高级代码块组件
 */
const CopyableCode = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-2 rounded-xl bg-black/60 border border-neutral-800/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-neutral-800/50 text-[10px] font-mono text-neutral-500">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? (
            <span className="text-green-400">✓ 已复制</span>
          ) : (
            <span>复制</span>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-text">{code.trim()}</pre>
    </div>
  );
};

export const McpStatusBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 避免 Next.js SSR 渲染时 document 未定义的问题
  useEffect(() => {
    setMounted(true);
  }, []);

  // 模拟检测本地/远程 MCP 服务的健康状态
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("http://127.0.0.1:31337/health");
      const data = await response.json();
      setIsConnected(data.status === "ok");
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // 抽屉首次打开且未连接时，自动触发一次检测
  useEffect(() => {
    if (isOpen && !isConnected) {
      checkConnection();
    }
  }, [isOpen, isConnected]);

  // 极客风的交错动画变体 (Staggered Animation Variants)
  const containerVars: Variants = {
    initial: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    animate: { transition: { delayChildren: 0.15, staggerChildren: 0.08, staggerDirection: 1 } },
  };

  const itemVars: Variants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 25 } },
  };

  return (
    <>
      {/* 顶部导航栏胶囊徽章 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-[#121212] text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700 hover:text-white transition-all shadow-sm"
        aria-label="MCP Connection Status"
      >
        <span className="relative flex h-2.5 w-2.5">
          {/* 呼吸灯特效 */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        MCP Native
      </button>

      {/* 滑出式抽屉 (Drawer) - 使用 Portal 渲染至 body 以解决层级遮挡 */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* 遮罩层 */}
                <motion.div
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/60 z-40"
                />
                
                {/* 抽屉主体 */}
                <motion.div
                  initial={{ x: "100%", borderTopLeftRadius: "2rem", borderBottomLeftRadius: "2rem" }}
                  animate={{ x: 0, borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
                  exit={{ x: "100%", borderTopLeftRadius: "2rem", borderBottomLeftRadius: "2rem" }}
                  transition={{ type: "spring", damping: 28, stiffness: 220, mass: 0.8 }}
                  className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0A0A0A] border-l border-neutral-800 shadow-2xl shadow-black/80 z-50 p-6 flex flex-col overflow-hidden"
                >
                  <motion.div 
                    variants={containerVars}
                    initial="initial"
                    animate="animate"
                    className="flex flex-col h-full">
                  <motion.div variants={itemVars} className="flex items-center justify-between mb-8 shrink-0">
                    <h2 className="text-lg font-semibold text-white">Vibe MCP Server</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>

                  <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {/* 状态监控卡片 */}
                    <motion.div variants={itemVars} className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Connection Status</span>
                        {isChecking ? (
                          <DotsLoading className="text-neutral-400" />
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {isConnected ? "Connected" : "Disconnected"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                        Server handles <code className="text-neutral-300 font-mono bg-black/50 px-1 rounded">get_vibe_style</code> and strictly checks motion prerequisite assets.
                      </p>
                    </motion.div>

                  {/* 保姆级快速配置指引 */}
                  <motion.div variants={itemVars} className="space-y-6">
                    <div className="border-t border-neutral-800/60 pt-6">
                      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-800 text-[10px]">1</span>
                        第一步：全局安装 CLI
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed pl-7">
                        确保本地已配置 Node.js 环境，在终端中运行以下命令：
                      </p>
                      <div className="pl-7">
                        <CopyableCode 
                          code="npm install -g @vibe-ui-n-motion/mcp" 
                          language="bash" 
                        />
                      </div>
                    </div>

                    <div className="border-t border-neutral-800/60 pt-6">
                      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-800 text-[10px]">2</span>
                        第二步：将 JSON 填入 AI 编辑器
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed pl-7">
                        在编辑器 MCP 配置中添加下述节点：
                      </p>
                      <div className="pl-7">
                        <CopyableCode 
                          code={`{
  "mcpServers": {
    "vibe-ui": {
      "command": "vibe-mcp",
      "env": {
        "VIBE_API_URL": "https://vibe-ui-prompt.online/"
      }
    }
  }
}`} 
                          language="json" 
                        />
                      </div>
                    </div>

                    {/* 常见编辑器入口看板 */}
                    <div className="border-t border-neutral-800/60 pt-6">
                      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                        ⚙️ 常见编辑器配置入口
                      </h3>
                      <div className="space-y-3 pl-2">
                        <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/50">
                          <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Cursor (推荐)
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-normal">
                            进入 <code className="text-neutral-300 font-mono bg-neutral-800/50 px-1 py-0.5 rounded">Settings</code> → <code className="text-neutral-300 font-mono bg-neutral-800/50 px-1 py-0.5 rounded">Features</code> → <code className="text-neutral-300 font-mono bg-neutral-800/50 px-1 py-0.5 rounded">MCP</code> 并点击 <span className="text-neutral-200 font-medium">+ Add New MCP Server</span>。
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/50">
                          <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            VS Code (Claude Dev / Cline)
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-normal">
                            呼出命令面板 (<kbd className="text-neutral-500 font-mono text-[9px] bg-neutral-800 px-1 py-0.5 rounded">Cmd/Ctrl+Shift+P</kbd>) 输入 <span className="text-neutral-200">"MCP: Open User Configuration"</span>。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 测试验证 */}
                    <div className="border-t border-neutral-800/60 pt-6 pb-8">
                      <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 text-emerald-400/90 text-[11px] leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 mb-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          如何验证是否成功？
                        </div>
                        在对话框中 @ 您的目标文件，并直接询问：
                        <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-900 my-2 font-mono text-[10px] text-neutral-300">
                          “我想要使用 Vibe UI MCP 帮我重构这个页面，请列出可用的 UI 风格并检查前置依赖。”
                        </div>
                        如果 AI 调用了 <code className="text-emerald-300">get_vibe_style</code> 并返回了列表，说明已配置成功。
                      </div>
                    </div>
                  </motion.div>
                  </div>

                  {/* 底部操作区 */}
                  <motion.div variants={itemVars} className="pt-6 mt-auto shrink-0">
                    <button
                      onClick={checkConnection}
                      disabled={isChecking}
                      className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {isChecking ? "Testing Connection..." : "Ping MCP API"}
                    </button>
                  </motion.div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
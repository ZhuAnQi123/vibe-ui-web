import React from "react";

interface DotsLoadingProps {
  /**
   * 可通过 className 覆盖容器及原点的颜色/尺寸。
   * 默认继承父级文本颜色 (bg-current)，尺寸为 w-2 h-2。
   * @example "text-blue-500" 或 "gap-2"
   */
  className?: string;
}

export const DotsLoading: React.FC<DotsLoadingProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 text-current ${className}`}
      aria-label="Loading"
      role="status"
    >
      {/* 使用纯 CSS 实现透明度交替淡入淡出 */}
      <style>{`
        @keyframes dots-fade {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-dot-fade {
          animation: dots-fade 1.4s infinite ease-in-out both;
        }
      `}</style>
      <span className="animate-dot-fade w-2 h-2 rounded-full bg-current" style={{ animationDelay: "-0.32s" }} />
      <span className="animate-dot-fade w-2 h-2 rounded-full bg-current" style={{ animationDelay: "-0.16s" }} />
      <span className="animate-dot-fade w-2 h-2 rounded-full bg-current" style={{ animationDelay: "0s" }} />
    </div>
  );
};
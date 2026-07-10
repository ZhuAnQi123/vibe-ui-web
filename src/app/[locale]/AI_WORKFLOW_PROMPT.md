---
version: beta-v2
name: interaction-name-analysis
name_zh: "动效中文名称"
cover_video: "../assets/replace-with-name.mp4" # 必须直接替换为 name 字段的实际值，例如 ../assets/donmolinico-intro-menu-hover.mp4
cdn_video_url: "https://pub-78bb53484bcd4179b692b8ebeee0e014.r2.dev/replace-with-name.mp4" # 必须直接替换为 name 字段的实际值
# 📢 Standard Tags System Specification:
# You MUST select 1 to 3 tags strictly from the following 12 Vibe Motion standard tags array. No custom tags allowed.
# Allowed tags: ["Elastic", "Magnetic", "Scroll", "Reveal", "Hover", "Proximity", "Curtain", "Button", "Card", "Carousel", "Accordion", "Click"]
tags: ["Elastic", "Hover", "Button"]
preview: { backgroundColor: "#171717", textColor: "#FFFFFF" }
description: >
  详细描述该交互的“核心体感”。例如：
  “这是一个类似 iOS 控制中心的流体扩展动效，元素展开时带有明显的阻尼感，松手时有基于初速度的惯性回弹。”
  触发词：[填入触发词，如 流体展开、阻尼回弹、iOS风卡片]
website: "Original design URL (Optional)"

# ==========================================
# VISION-AGENT GUIDE: 动效物理预设词典 (仅供 Vision-Agent 分析时选择套用)
# ==========================================
# Please match the visual movement in the video with one of the following presets:
# - PRESET_SPRING_BOUNCE (Highly elastic, playful): stiffness: 400, damping: 15, mass: 1
# - PRESET_SPRING_SMOOTH (Fluid, iOS-like, premium): stiffness: 200, damping: 25, mass: 1
# - PRESET_SPRING_STIFF (Snappy, mechanical): stiffness: 500, damping: 40, mass: 1
# - PRESET_EASE_OUT_EXPO (Ultra-smooth decelerating slide): cubic-bezier(0.16, 1, 0.3, 1), duration: "400ms"
# - PRESET_EASE_IN_OUT (Standard smooth transition): cubic-bezier(0.4, 0, 0.2, 1), duration: "300ms"

motion_tokens:
  selected_preset: "PRESET_SPRING_SMOOTH" # Vision-Agent 根据视频视觉特征选择填入
  transform_origin: "center center" # 关键变形原点: e.g., center, top-left, bottom
  stagger_delay: "40ms" # 多子元素交错延迟时间

  # Framer Motion / CSS 映射参数
  active_physics:
    stiffness: 200
    damping: 25
    mass: 1
  css_fallback_easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  duration: "350ms"

  # 结构化状态变体 (Strict English Specs for Code-Agent)
  variants:
    initial: { opacity: 0, scale: 0.95, y: 15, filter: "blur(4px)" }
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
    exit: { opacity: 0, scale: 0.95, y: -10, filter: "blur(2px)" }
---

# [动效中文名称 / English Name] Specification & Implementation Protocol

## 1. Interaction & Feel Vibe (动效体感)

- **Visual Physics Class**: [Choose one: Fluid-Elastic / Snappy-Mechanical / Linear-Smooth]
- **Core Experience**: [Describe the sensory feedback. E.g., "The card inflates on click like a physical bubble, with micro-bouncing. Sub-elements fade in sequentially with a subtle blur-to-clear transition."]
- **Interaction Flow**: [E.g., Hover -> Scale Up 1.02; Click -> Scale Up 1.05 and expand layout; Click Close -> Reverse to initial state smoothly.]

## 2. Component DOM Mapping (元素与动效节点映射)

*_Vision-Agent: Map the visual elements in the video to a virtual DOM structure before defining motion._*

- **[Parent Container]** (e.g., `div` - Card Wrapper)
  - Apply `transform_origin` and shadow elevation transition.
- **[Child Node A]** (e.g., `img` - Hero Image)
  - Scales independently to create a depth-of-field (parallax) effect.
- **[Child Node B]** (e.g., `div` - Text Block)
  - Animates with a stagger delay relative to the Parent Container.

## 3. Detailed Timeline Sequence (时序编排)

*_Vision-Agent: Define the exact motion sequence in milliseconds based on video analysis._*

- **[0ms - 250ms] Trigger Phase**:
  - Parent Container scales from `1.0` to `1.05` via `PRESET_SPRING_SMOOTH`.
  - Elevation: Box shadow transitions from shallow `0 4px 6px` to deep floating shadow `0 20px 25px`.
- **[80ms - 350ms] Content Sequence**:
  - Child Node B (Text Block) begins to slide up (`translateY: 15px -> 0px`) and fade in.
- **[Exit Phase] Dismiss Sequence**:
  - Upon close trigger, all elements reverse to initial states within `200ms` using `PRESET_EASE_IN_OUT` (no spring bounce on exit to keep it snappy).

## 4. Implementation Directives for Code-Agent (核心指令)

> **⚠️ CRITICAL IMPLEMENTATION RULES (NO-NEGOTIABLE):**
>
> 1. **Framework Auto-Detection (Priority 0)**: You MUST inspect `package.json` in the root folder to detect the framework (React/Next.js/Svelte/Vue) and styling system (Tailwind v3/v4, CSS Modules) currently in use. Adapt your output code to the exact versions found. If package.json is missing or not accessible, default to **React + Tailwind CSS + Framer Motion** and explicitly state this assumption in the first line of your code output.
> 2. **Performance Guard**: ONLY animate GPU-accelerated properties (`transform`, `opacity`, `filter`). Do NOT transition properties that cause Reflow (e.g., `width`, `height`, `top`, `left`, `margin`).
> 3. **Exit Animation Safeguard**: If using React, ensure components use `<AnimatePresence>` (or equivalent framework lifecycle hooks) so exit animations play fully before unmounting. Do not let elements disappear instantly.
> 4. **Clipping & Shadow Prevention**: Ensure container divs have proper padding or avoid `overflow: hidden` if the floating card shadow gets clipped during scaling.

## 5. Generated Code Skeleton (示例代码)

*_Vision-Agent: Generate a complete, working component code block based on your analysis of the tech stack in package.json (or default to the React block below)._*

```tsx
// Complete production-ready implementation of [动效名称]
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Insert custom physics from motion_tokens
const physicsConfig = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const InteractionComponent = () => {
  return (
    <motion.div
      initial={{ scale: 1, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
        transition: physicsConfig,
      }}
      whileTap={{ scale: 0.98 }}
      style={{ transformOrigin: "center center" }}
      className="rounded-2xl bg-white p-6 cursor-pointer"
    >
      {/* Children elements with stagger delay */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
      >
        <h3 className="text-xl font-bold">Staggered Content</h3>
      </motion.div>
    </motion.div>
  );
};
```

## 🛑 AI Anti-Patterns & Blocklist (AI 避坑防偏与硬性禁忌)

> **⚠️ [SYSTEM RULE]** As a Senior Motion Developer, you must strictly AVOID the following anti-patterns. Violating any of these rules will result in layout shift and rendering stutter.

### 1. The "Sticky Animation" Trap (时长失控)
- ❌ **DON'T**: Do NOT write transitions or spring animations with a duration exceeding `400ms` unless specifically requested. It makes the UI feel laggy and sticky.
- **DO**: Default to snappy durations (`150ms - 300ms`). High-frequency micro-interactions (like buttons/taps) must be under `150ms`.

### 2. The "Layout Thrashing" Catastrophe (严禁非 GPU 加速属性)
- ❌ **DON'T**: NEVER use `transition: all`. Never animate layout-shifting properties: `width`, `height`, `top`, `left`, `margin`, `padding`, or `border-width`.
- **DO**: Only animate `transform` (scale, translate, rotate) and `opacity`. If you need to animate border changes, use `box-shadow: inset` or a pseudo-element (`::after`) with opacity scale.

### 3. Dark Mode Shadow Pollution (暗黑模式脏阴影)
- ❌ **DON'T**: Do NOT apply standard dark shadows (`rgba(0,0,0,0.5)`) on dark-themed components—they become invisible or look muddy. NEVER use bright white shadows.
- **DO**: In dark mode, replace floating shadows with a subtle semi-transparent border (e.g., `border: 1px solid rgba(255, 255, 255, 0.08)`) and a slight background highlight (elevation tint).

### 4. Instantly Vanishing Exit (销毁无动画)
- ❌ **DON'T**: Do NOT let elements disappear instantly from the DOM when they are closed or unmounted.
- **DO**: You must wrap conditional rendering with `<AnimatePresence>` (Framer Motion) or leverage CSS transition-end event listeners to ensure the `exit` state plays out fully before node destruction.

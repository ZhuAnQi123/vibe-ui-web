<motion_analysis>
### 💡 第一步：深度逆向工程分析

1.  **时序与节奏拆解**：
    *   **整体加载动画 (0:00 - 0:02)**:
        *   **Logo 出现与放大 (0:01 - 0:01.5)**: 视频开始时，Logo 从无到有，伴随轻微的放大（约 0.95 -> 1.05 -> 1），整个过程约 500ms。速度峰值在放大到 1.05 左右，然后迅速回弹到 1。这是一种快速的 Spring 弹簧回弹。
        *   **Logo 缩小并定位到顶部 (0:01.5 - 0:02)**: Logo 随后平滑地缩小并向上移动，同时背景图片和底部文字（"DESDE NAVARRA"）从下方滑入并淡入。这个过程约 500ms，是平滑的 Ease-out 曲线，带有轻微的错开（stagger）。
    *   **菜单项悬停动画 (0:02 - 0:03)**:
        *   当鼠标悬停在导航菜单项（如 "PRODUCTOS"）上时，文本会迅速放大（约 1 -> 1.05）并改变颜色。移出时则迅速恢复原状。
        *   这个动画非常快速，几乎没有可见的回弹，但有明显的“弹性”感，响应迅速。持续时间约 100-150ms。速度峰值在动画开始后很短的时间内达到。

2.  **物理特性推导**：
    *   **Logo 出现与放大**: 具有清脆的弹性回弹感，但回弹幅度不大，很快稳定。
        *   对照 Framer Motion 物理参考系，它介于【清脆/标准弹性】和【超强弹性/快速响应】之间。由于回弹非常迅速且不拖沓，阻尼不宜过低，但需要较高的刚度来保证速度。
        *   **估算参数**: `stiffness: 350`, `damping: 28`, `mass: 1`。这个组合能提供快速响应和轻微的、不拖沓的回弹。
    *   **菜单项悬停**: 极快的响应速度，几乎无可见回弹，但有“按压”的弹性反馈。
        *   这需要更高的刚度来确保即时响应，同时保持适中的阻尼以避免任何可见的“晃动”。
        *   **估算参数**: `stiffness: 450`, `damping: 30`, `mass: 1`。这个组合能提供非常清脆、快速且稳定的缩放效果。
    *   **背景与文字滑入**: 这是一个平滑的过渡，没有弹性。
        *   **估算参数**: 适合使用 `cubic-bezier` 缓动曲线，例如 `ease-out` 或 `cubic-bezier(0.25, 1, 0.5, 1)`，配合约 500ms 的持续时间。

3.  **状态变化矩阵**：
    *   **Logo (Intro)**:
        *   `initial`: `opacity: 0, scale: 0.95`
        *   `animate_fullscreen`: `opacity: 1, scale: 1.05` (spring)
        *   `animate_header`: `scale: 0.8, y: -20` (smooth tween)
    *   **内容区 (Intro)**:
        *   `initial`: `opacity: 0, y: 20`
        *   `animate`: `opacity: 1, y: 0` (staggered, smooth tween)
    *   **菜单项 (Hover)**:
        *   `idle`: `scale: 1, color: #333333`
        *   `hover`: `scale: 1.05, color: #A08040` (spring)
</motion_analysis>

---

```yaml
---
version: v2.0
name: donmolinico-intro-menu-hover
description: >
  该动效包含网站加载时的Logo弹性出现、内容平滑滑入，以及导航菜单项的快速弹性悬停反馈。
  整体体感清脆、响应迅速，带有轻微的物理弹性。
触发词：网站加载, 菜单悬停, 弹性缩放, 平滑滑入, 快速响应


metadata:
  original_video_url: "https://www.donmolinico.es/"
  performance_impact: "Low"

# 结构化的物理动效参数（供 AI 高度还原读取）
motion_tokens:
  # 触发与交互手势
  trigger_type: "mount | hover" # 综合了加载和悬停两种触发方式

  # Framer Motion 物理弹簧推荐参数 (主要针对菜单悬停和Logo的弹性出现)
  spring:
    stiffness: 450 # 较高的刚度，确保快速响应
    damping: 30    # 适中的阻尼，防止过度回弹，保持清脆感
    mass: 1
    restDelta: 0.001

  # CSS 缓动曲线与时间（作为兜底或纯CSS实现参考，主要针对内容平滑滑入）
  css_easing: "cubic-bezier(0.25, 1, 0.5, 1)" # 经典的 ease-out 曲线
  duration: "350ms" # 适用于平滑过渡的默认时长

  # 编排参数（Orchestration）
  orchestration:
    delayChildren: 0.1 # 子元素动画延迟
    staggerChildren: 0.08 # 子元素动画错开时间

  # 关键状态变体（Variants）高度精确到具体数值与单位
  variants:
    # 网站加载时Logo的初始状态与全屏显示状态
    logoInitial:
      opacity: 0
      scale: 0.95
    logoAnimateFullscreen:
      opacity: 1
      scale: 1.05
      transition: { type: "spring", stiffness: 350, damping: 28, mass: 1 }
    logoAnimateHeader: # Logo从全屏缩小到header位置
      scale: 0.8
      y: -20 # 假设向上移动20px到header位置
      transition: { duration: 0.5, ease: "easeOut" }

    # 网站加载时内容元素的初始状态与显示状态
    contentInitial:
      opacity: 0
      y: 20 # 从下方20px处滑入
    contentAnimate:
      opacity: 1
      y: 0
      transition: { duration: 0.5, ease: "easeOut" }

    # 菜单项的悬停状态
    menuItemIdle:
      scale: 1
      color: "#333333" # 假设的默认文本颜色
    menuItemHover:
      scale: 1.05
      color: "#A08040" # 网站Logo中的金色
      transition: { type: "spring", stiffness: 450, damping: 30, mass: 1 }
---
```

# Don Molinico 网站加载与菜单悬停动效规范

## 1. 动效体感 (Feel & Vibe)

-   **视觉感受**：网站加载时，Logo 以一种清脆、带有轻微回弹的弹性效果出现，随后平滑地缩小并定位到页面顶部。同时，背景图片和主要内容文字从底部优雅地滑入并淡出。导航菜单项在鼠标悬停时，会迅速且带有微弱弹性的放大并改变颜色，提供即时、精致的反馈。
-   **交互逻辑**：
    *   **加载阶段**：页面加载完成后，Logo 和核心内容以精心编排的动画序列呈现在用户面前，引导用户注意力。Logo 的弹性出现增加了品牌的活力。
    *   **菜单悬停**：用户将鼠标悬停在导航链接上时，链接会立即放大并变色，提供清晰的视觉反馈，增强可点击性，且动效快速不干扰阅读。
-   **适用场景**：适用于品牌官网、电商网站、作品集等需要营造高端、精致、响应迅速用户体验的场景。特别适合作为页面加载动画、导航菜单、按钮等交互元素的反馈动效。

## 2. 媒体参考 (Reference Asset)

-   **原视频/演示网站**：[https://www.donmolinico.es/](https://www.donmolinico.es/)
-   **离线文件路径**：`../assets/donmolinico-intro-menu-hover.gif`

## 3. 技术实现要点 (Implementation Details)

### 推荐库与渲染方式

-   **首选技术栈**：Framer Motion (React)
    *   Framer Motion 的 `spring` 动画引擎能够精确模拟视频中的物理弹性效果，提供高度可控的 `stiffness`、`damping` 和 `mass` 参数。
    *   其 `variants` 和 `AnimatePresence` 特性非常适合处理复杂的入场/退场动画编排。
-   **性能优化**：
    *   **GPU 硬件加速**：所有动画属性（如 `transform` (包括 `scale`, `y` 等) 和 `opacity`）都应开启 GPU 硬件加速。Framer Motion 默认会优化这些属性。
    *   **避免 Layout 属性动画**：绝对不要对影响布局的属性（如 `width`, `height`, `margin`, `padding`, `left`, `top` 等）进行动画，这会导致浏览器强制重排（reflow），严重影响性能。
    *   **动画防抖**：对于快速触发的交互（如菜单悬停），Framer Motion 会自动处理动画中断和新动画的启动，确保流畅性。

## 4. 示例代码骨架 (Code Skeleton)

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// 定义颜色变量
const Colors = {
  primaryText: '#333333',
  hoverGold: '#A08040',
  redBackground: '#C8202F', // 视频中Logo背景的红色
};

// 样式组件
const GlobalContainer = styled(motion.div)`
  min-height: 100vh;
  background-color: #f8f8f8; /* 假设的页面背景色 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden; /* 防止内容溢出 */
`;

const Header = styled(motion.header)`
  width: 100%;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
`;

const LogoPlaceholder = styled(motion.div)`
  font-family: 'Georgia', serif; /* 假设的字体 */
  font-size: 1.5rem;
  font-weight: bold;
  color: ${Colors.hoverGold};
  height: 40px; /* 假设header中logo的高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.redBackground};
  padding: 0 10px;
  border-radius: 4px;
  white-space: nowrap;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavItem = styled(motion.a)`
  font-family: 'Arial', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${Colors.primaryText};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${Colors.hoverGold}; /* 悬停时颜色变化 */
  }
`;

const MainContent = styled(motion.div)`
  margin-top: 100px; /* 留出header空间 */
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  text-align: center;
`;

const HeroSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background-image: url('https://www.donmolinico.es/wp-content/uploads/2023/02/donmolinico-home-hero.jpg'); /* 示例背景图 */
  background-size: cover;
  background-position: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
`;

const HeroText = styled(motion.h1)`
  font-family: 'Georgia', serif;
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled(motion.p)`
  font-family: 'Arial', sans-serif;
  font-size: 1.5rem;
`;

const FullScreenLogoWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${Colors.redBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const FullScreenLogo = styled(motion.div)`
  font-family: 'Georgia', serif;
  font-size: 4rem;
  font-weight: bold;
  color: ${Colors.hoverGold};
  white-space: nowrap;
`;


// Framer Motion Variants
const introVariants = {
  logoInitial: { opacity: 0, scale: 0.95 },
  logoAnimateFullscreen: {
    opacity: 1,
    scale: 1.05,
    transition: { type: "spring", stiffness: 350, damping: 28, mass: 1, restDelta: 0.001 }
  },
  logoAnimateHeader: {
    scale: 0.8,
    y: -20, // Adjust based on actual header height and logo final position
    transition: { duration: 0.5, ease: "easeOut" }
  },
  contentInitial: { opacity: 0, y: 20 },
  contentAnimate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const navItemVariants = {
  idle: {
    scale: 1,
    color: Colors.primaryText,
    transition: { type: "spring", stiffness: 450, damping: 30, mass: 1, restDelta: 0.001 }
  },
  hover: {
    scale: 1.05,
    color: Colors.hoverGold,
    transition: { type: "spring", stiffness: 450, damping: 30, mass: 1, restDelta: 0.001 }
  },
};

const DonMolinicoWebsite: React.FC = () => {
  const [showIntro, setShowIntro] = React.useState(true);
  const [showLogoInHeader, setShowLogoInHeader] = React.useState(false);

  React.useEffect(() => {
    // Simulate intro sequence
    const timer1 = setTimeout(() => {
      // Logo full screen animation ends, start shrinking to header
      setShowLogoInHeader(true);
    }, 1500); // After full screen logo animation

    const timer2 = setTimeout(() => {
      // Intro sequence fully complete, hide full screen overlay
      setShowIntro(false);
    }, 2000); // Total intro duration

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <GlobalContainer>
      <AnimatePresence>
        {showIntro && (
          <FullScreenLogoWrapper
            initial={{ opacity: 1 }}
            animate={{ opacity: showLogoInHeader ? 0 : 1 }} // Fade out background when logo moves to header
            exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.5 } }} // Delay exit to allow logo to settle
          >
            <FullScreenLogo
              initial="logoInitial"
              animate={showLogoInHeader ? "logoAnimateHeader" : "logoAnimateFullscreen"}
              variants={introVariants}
              onAnimationComplete={() => {
                if (showLogoInHeader) {
                  // This callback fires when logoAnimateHeader completes
                  // In a real app, you might want to ensure the header logo is rendered before this
                }
              }}
            >
              DON MOLINICO
            </FullScreenLogo>
          </FullScreenLogoWrapper>
        )}
      </AnimatePresence>

      <Header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: showIntro ? 1.8 : 0, duration: 0.5, ease: "easeOut" }} // Delay header appearance until intro is almost done
      >
        <LogoPlaceholder>
          DON MOLINICO
        </LogoPlaceholder>
        <Nav>
          {['PRODUCTOS', 'NUESTRA HISTORIA', 'CONTACTO'].map((item) => (
            <NavItem
              key={item}
              variants={navItemVariants}
              initial="idle"
              whileHover="hover"
            >
              {item}
            </NavItem>
          ))}
        </Nav>
      </Header>

      <MainContent>
        <HeroSection
          initial="contentInitial"
          animate="contentAnimate"
          variants={introVariants}
          transition={{ delay: showIntro ? 2.2 : 0, ...introVariants.contentAnimate.transition }} // Delay content appearance
        >
          <HeroText
            initial="contentInitial"
            animate="contentAnimate"
            variants={introVariants}
            transition={{ delay: showIntro ? 2.4 : 0, ...introVariants.contentAnimate.transition }}
          >
            DESDE NAVARRA
          </HeroText>
          <HeroSubtitle
            initial="contentInitial"
            animate="contentAnimate"
            variants={introVariants}
            transition={{ delay: showIntro ? 2.6 : 0, ...introVariants.contentAnimate.transition }}
          >
            NUEVA TRADICION
          </HeroSubtitle>
        </HeroSection>
        {/* More content here */}
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Scroll down for more...</h2>
        </div>
      </MainContent>
    </GlobalContainer>
  );
};

export default DonMolinicoWebsite;
```

## 5. 易错点与禁忌 (Gotchas & Don'ts)

-   **绝对不要**：
    *   **在动画中过度使用 `damping` 或 `stiffness` 的极端值**：过高的 `stiffness` 可能导致动画过于生硬或跳跃，过低的 `damping` 会导致元素持续回弹，产生“晃动”感，影响用户体验。视频中的动效非常克制，需要精确调校。
    *   **在 `AnimatePresence` 中忘记设置 `key` 属性**：这会导致 Framer Motion 无法正确识别组件的进入和退出，从而无法触发 `exit` 动画。
    *   **对 `color` 属性使用 `spring` 动画**：`color` 属性通常更适合使用 `tween` 或 `CSS transition` 进行平滑过渡，`spring` 动画在颜色变化上可能表现不自然。在示例中，`color` 的 `transition` 继承了 `spring` 的参数，但实际效果会是平滑的插值。如果需要更精确的控制，可以为 `color` 单独指定 `type: "tween"`.
-   **交互兜底**：
    *   **快速点击/悬停下的动画截断/重置逻辑**：Framer Motion 默认会处理动画中断和新动画的启动，确保流畅性。但对于复杂的交互，仍需测试在极端快速操作下的表现。
    *   **无障碍性 (Accessibility)**：确保动画不会对有运动敏感的用户造成不适。考虑提供一个选项来禁用或简化所有动效。
    *   **性能监控**：在生产环境中，使用浏览器开发者工具（如 Performance 面板）监控动画的帧率，确保动画始终保持在 60fps，避免掉帧。
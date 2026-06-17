import fs from 'node:fs';
import path from 'node:path';

const uiDir = '/Users/mac/Documents/code/vibe-ui/skills/ui-style-library/references';
const motionDir = '/Users/mac/Documents/code/vibe-motion/skills/interaction-library/references';

const uiMap = {
  'bento-grid-layout': '便当盒模块化网格布局',
  'copula-neo-brutalism': 'Copula 高饱和新粗野主义',
  'modern-flat-micro-textures': '现代扁平微质感界面',
  'neo-brutalism-core': '新粗野主义核心体系',
  'nvrmnd-editorial-neo-brutalism': 'NVRMND 编辑感新粗野主义',
  'organic-soft-minimalism': '有机柔和极简风格',
  'spatial-glass-ui': '空间玻璃态界面',
  'terminal-ai-first-aesthetic': '终端优先 AI 工具风格',
  'tiimo-organic-minimalism': 'Tiimo 有机治愈极简风',
  'ultra-minimalist-swiss-design': '超极简瑞士设计体系',
  'units-playful-brutalism': 'Units 趣味粗野主义'
};

const motionMap = {
  'corner-elastic-curtain-expand': '角落弹性幕布展开',
  'elastic-sidebar-menu-reveal': '弹性侧边栏菜单揭示',
  'fluid-elastic-button-hover': '流体弹性按钮悬停',
  'kinetic-scroll-typography-reveal': '动能滚动文字揭示',
  'list-item-inverse-stretch-reveal': '列表项反向拉伸揭示',
  'magnetic-button-magnetic-arrow': '磁吸按钮与箭头联动',
  'magnetic-circular-button-hover': '磁吸圆形按钮悬停',
  'minimalist-text-menu-hover': '极简文字菜单悬停',
  'multi-column-accordion-reveal': '多列手风琴展开揭示',
  'multi-section-sticky-overlap': '多区块粘性叠层滚动',
  'sticky-horizontal-line-indicator': '粘性横线滚动指示',
  'typographic-carousel-slide': '排版轮播滑动切换',
  'typographic-menu-preview-card': '排版菜单预览卡片'
};

function upsertLine(content, key, value, isFencedYaml = false) {
  const escaped = value.replace(/"/g, '\\"');
  const line = `${key}: "${escaped}"`;

  if (new RegExp(`^${key}:`, 'm').test(content)) {
    return content.replace(new RegExp(`^${key}:.*$`, 'm'), line);
  }

  if (isFencedYaml) {
    return content.replace(/^(name:\s*.+)$/m, `$1\n${line}`);
  }

  return content.replace(/^(name:\s*.+)$/m, `$1\n${line}`);
}

function updateUiFiles() {
  const files = fs.readdirSync(uiDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    const nameZh = uiMap[id];
    if (!nameZh) continue;

    const filePath = path.join(uiDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const updated = upsertLine(raw, 'name_zh', nameZh, false);
    fs.writeFileSync(filePath, updated);
  }
}

function updateMotionFiles() {
  const files = fs.readdirSync(motionDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    const nameZh = motionMap[id];
    if (!nameZh) continue;

    const filePath = path.join(motionDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const updated = upsertLine(raw, 'name_zh', nameZh, true);
    fs.writeFileSync(filePath, updated);
  }
}

updateUiFiles();
updateMotionFiles();
console.log('Added name_zh to UI and motion references.');

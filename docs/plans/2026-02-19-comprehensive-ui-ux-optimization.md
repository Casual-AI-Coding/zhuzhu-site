# UI/UX/多端适配优化实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 全面升级网站的 UI/UX 和多端适配能力，包括点击涟漪效果、骨架屏加载、iPhone 安全区域适配、平板/大屏/横屏/折叠屏布局优化、自定义滚动条、选中文本样式、猪猪 emoji 光标、统一动画系统等 17 项优化。

**Architecture:** 通过创建通用 CSS 工具类、新增 Vue 组件（Skeleton、Ripple）、修改 Tailwind 配置、优化响应式断点、添加 CSS 变量和动画系统来实现。所有优化都遵循移动端优先原则，确保在各种设备上都有良好的体验。

**Tech Stack:** Vue 3, Tailwind CSS, CSS Variables, CSS Animations, Intersection Observer API

---

## 阶段一：全局样式基础（先完成，其他任务依赖）

### Task 1: 统一动画系统 - 定义动画变量和曲线

**Files:**
- Modify: `src/styles/index.css` (添加动画变量)

**Step 1: 添加 CSS 动画变量**

在 `:root` 中添加：

```css
:root {
  /* 已有变量保持不变 */
  --color-primary: #D4A574;
  --color-background: #F5EDE4;
  --color-card: #FFF8F0;
  --color-text-main: #3D3D3D;
  --color-text-secondary: #8B7355;
  --color-border: #E8DDD0;
  
  /* 新增动画变量 */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

在 `@layer utilities` 中添加：

```css
@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70;
  }
  
  /* 动画工具类 */
  .animate-fade-in {
    animation: fadeIn var(--duration-normal) var(--ease-out-expo) forwards;
  }
  
  .animate-slide-up {
    animation: slideUp var(--duration-normal) var(--ease-out-expo) forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn var(--duration-normal) var(--ease-out-back) forwards;
  }
  
  .animate-pulse-subtle {
    animation: pulseSubtle 2s var(--ease-in-out-sine) infinite;
  }
}

/* 关键帧动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

**Step 2: 验证文件修改**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add unified animation system with CSS variables"
```

---

### Task 2: 自定义滚动条样式

**Files:**
- Modify: `src/styles/index.css` (在 @layer base 中添加)

**Step 1: 添加自定义滚动条样式**

在 `@layer base` 中的 `body` 后面添加：

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-background text-text-main font-body antialiased;
  }
  
  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-secondary);
  }
  
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }
}
```

**Step 2: 验证**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add custom scrollbar styles"
```

---

### Task 3: 选中文本高亮样式

**Files:**
- Modify: `src/styles/index.css`

**Step 1: 添加选中文本样式**

在 `@layer base` 中添加：

```css
@layer base {
  /* 已有代码... */
  
  /* 选中文本样式 */
  ::selection {
    background-color: var(--color-primary);
    color: var(--color-background);
  }
  
  ::-moz-selection {
    background-color: var(--color-primary);
    color: var(--color-background);
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add text selection highlight styles"
```

---

### Task 4: 猪猪 Emoji 光标

**Files:**
- Create: `public/cursor-pig.png` (需要提前准备 32x32 的猪猪光标图片)
- Modify: `src/styles/index.css`

**Step 1: 添加光标样式**

在 `@layer base` 中添加：

```css
@layer base {
  /* 已有代码... */
  
  /* 猪猪光标 - 普通状态 */
  body {
    cursor: url('/cursor-pig.png'), auto;
  }
  
  /* 链接和按钮用手型 */
  a, button, [role="button"], input[type="submit"], input[type="button"] {
    cursor: pointer;
  }
  
  /* 可拖拽元素 */
  [draggable="true"] {
    cursor: move;
  }
  
  /* 禁用状态 */
  :disabled, [disabled] {
    cursor: not-allowed;
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add pig emoji cursor styles"
```

---

## 阶段二：组件级优化

### Task 5: 创建统一的 Skeleton 骨架屏组件

**Files:**
- Create: `src/components/SkeletonCard.vue`
- Create: `src/components/SkeletonGrid.vue`

**Step 1: 创建 SkeletonCard 组件**

```vue
<template>
  <div class="skeleton-card animate-pulse">
    <div class="skeleton-image bg-gray-200 dark:bg-gray-700 rounded-2xl" :class="aspectClass"></div>
    <div class="skeleton-content p-4 space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  aspectClass: { type: String, default: 'aspect-[4/3]' },
});
</script>

<style scoped>
.skeleton-card {
  background: var(--color-card);
  border-radius: 1rem;
  overflow: hidden;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
```

**Step 2: 创建 SkeletonGrid 组件**

```vue
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <SkeletonCard
      v-for="i in count"
      :key="i"
      :aspect-class="aspectClass"
    />
  </div>
</template>

<script setup>
import SkeletonCard from './SkeletonCard.vue';

defineProps({
  count: { type: Number, default: 6 },
  aspectClass: { type: String, default: 'aspect-[4/3]' },
});
</script>
```

**Step 3: 更新 GalleryView 使用 Skeleton**

Modify: `src/views/GalleryView.vue`

替换 Loading 部分：

```vue
<!-- Loading -->
<div v-if="loading">
  <SkeletonGrid :count="6" aspect-class="aspect-[4/3]" />
</div>
```

添加导入：

```javascript
import SkeletonGrid from '@/components/SkeletonGrid.vue';
```

**Step 4: 验证**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/SkeletonCard.vue src/components/SkeletonGrid.vue src/views/GalleryView.vue
git commit -m "feat: add unified skeleton loading components"
```

---

### Task 6: 创建 Ripple 涟漪效果组件

**Files:**
- Create: `src/components/RippleButton.vue`
- Create: `src/composables/useRipple.js`

**Step 1: 创建 useRipple composable**

```javascript
import { ref } from 'vue';

export function useRipple() {
  const ripples = ref([]);
  let rippleId = 0;

  function createRipple(event, container) {
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = {
      id: rippleId++,
      x,
      y,
      size,
    };
    
    ripples.value.push(ripple);
    
    // 600ms 后移除
    setTimeout(() => {
      const index = ripples.value.findIndex(r => r.id === ripple.id);
      if (index > -1) {
        ripples.value.splice(index, 1);
      }
    }, 600);
  }

  return {
    ripples,
    createRipple,
  };
}
```

**Step 2: 创建 RippleButton 组件**

```vue
<template>
  <button
    ref="buttonRef"
    class="ripple-button relative overflow-hidden"
    @click="handleClick"
  >
    <slot />
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        width: ripple.size + 'px',
        height: ripple.size + 'px',
      }"
    ></span>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { useRipple } from '@/composables/useRipple.js';

const buttonRef = ref(null);
const { ripples, createRipple } = useRipple();

const emit = defineEmits(['click']);

function handleClick(event) {
  createRipple(event, buttonRef.value);
  emit('click', event);
}
</script>

<style scoped>
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-animation 600ms linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
```

**Step 3: 验证**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/composables/useRipple.js src/components/RippleButton.vue
git commit -m "feat: add Material Design ripple effect component"
```

---

## 阶段三：响应式布局优化

### Task 7: 更新 Tailwind 配置 - 响应式断点

**Files:**
- Modify: `tailwind.config.js`

**Step 1: 更新 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // 新增响应式断点
        '3xl': '1920px',      // 大屏桌面
        '4xl': '2560px',      // 4K 屏幕
        'tablet': '768px',    // 平板竖屏
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
        'fold': {'raw': '(max-width: 320px)'},  // 折叠屏折叠状态
        'unfold': {'raw': '(min-width: 700px)'}, // 折叠屏展开状态
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
        },
        text: {
          main: 'var(--color-text-main)',
          secondary: 'var(--color-text-secondary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      // 新增字体大小（大屏适配）
      fontSize: {
        '2xs': '0.625rem',    // 10px
        '4xl': ['2.5rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};
```

**Step 2: 验证**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: update Tailwind config with responsive breakpoints for tablet, landscape, 4K"
```

---

### Task 8: iPhone 安全区域适配

**Files:**
- Modify: `index.html` (添加 viewport-fit)
- Modify: `src/App.vue` (适配底部元素)
- Modify: `src/components/MusicPlayer.vue`
- Modify: `src/components/Fireworks.vue`

**Step 1: 更新 index.html viewport**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**Step 2: 在 CSS 中添加安全区域变量**

Modify: `src/styles/index.css`

在 `@layer base` 中添加：

```css
@layer base {
  /* 已有代码... */
  
  /* iPhone 安全区域 */
  :root {
    --safe-area-inset-top: env(safe-area-inset-top);
    --safe-area-inset-right: env(safe-area-inset-right);
    --safe-area-inset-bottom: env(safe-area-inset-bottom);
    --safe-area-inset-left: env(safe-area-inset-left);
  }
  
  /* 确保内容不被刘海和底部条遮挡 */
  body {
    padding-top: var(--safe-area-inset-top);
    padding-right: var(--safe-area-inset-right);
    padding-bottom: var(--safe-area-inset-bottom);
    padding-left: var(--safe-area-inset-left);
  }
}
```

**Step 3: 更新 MusicPlayer 适配安全区域**

Modify: `src/components/MusicPlayer.vue`

在 style 中添加：

```css
.music-player {
  bottom: calc(20px + var(--safe-area-inset-bottom));
}
```

**Step 4: 更新 Fireworks 适配安全区域**

Modify: `src/components/Fireworks.vue`

在 style 中添加：

```css
.firework-trigger {
  top: calc(100px + var(--safe-area-inset-top));
}
```

**Step 5: 验证**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add index.html src/styles/index.css src/components/MusicPlayer.vue src/components/Fireworks.vue
git commit -m "feat: add iPhone safe area support"
```

---

### Task 9: 平板两栏布局

**Files:**
- Modify: `src/views/GalleryView.vue` (平板横屏两栏)
- Modify: `src/views/HomeView.vue` (精选照片平板布局)

**Step 1: 更新 GalleryView 平板布局**

Modify: `src/views/GalleryView.vue`

在工具栏部分添加平板布局判断：

```vue
<!-- Tablet Landscape: 两栏布局 -->
<div v-if="viewMode === 'masonry'" class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 landscape:columns-2">
```

**Step 2: 更新 HomeView 平板布局**

Modify: `src/views/HomeView.vue`

更新照片网格为响应式：

```vue
<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 landscape:grid-cols-2">
```

**Step 3: Commit**

```bash
git add src/views/GalleryView.vue src/views/HomeView.vue
git commit -m "feat: add tablet two-column layout"
```

---

### Task 10: 大屏/4K 优化

**Files:**
- Modify: `src/styles/index.css`
- Modify: `src/views/HomeView.vue`

**Step 1: 添加大屏字体变量**

Modify: `src/styles/index.css`

在 `:root` 中添加：

```css
:root {
  /* 已有变量... */
  
  /* 响应式字体大小 */
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
}

/* 大屏优化 */
@media (min-width: 1920px) {
  :root {
    --font-size-base: 18px;
    --font-size-lg: 20px;
    --font-size-xl: 24px;
  }
}

@media (min-width: 2560px) {
  :root {
    --font-size-base: 20px;
    --font-size-lg: 24px;
    --font-size-xl: 28px;
  }
}
```

**Step 2: 更新 HomeView 大屏适配**

Modify: `src/views/HomeView.vue`

更新天数显示为大屏优化：

```vue
<div class="text-5xl sm:text-7xl lg:text-9xl 3xl:text-[10rem] 4xl:text-[12rem] font-display text-primary font-bold tracking-tight">
```

**Step 3: Commit**

```bash
git add src/styles/index.css src/views/HomeView.vue
git commit -m "feat: add 4K screen optimization with larger fonts"
```

---

### Task 11: 横屏模式适配

**Files:**
- Modify: `src/views/GalleryView.vue`
- Modify: `src/views/TimelineView.vue`

**Step 1: GalleryView 横屏优化**

Modify: `src/views/GalleryView.vue`

Lightbox 横屏时最大化：

```vue
<div
  v-if="selectedPhoto"
  class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 landscape:p-2"
>
  <div class="max-w-4xl max-h-full landscape:max-w-none landscape:max-h-screen landscape:w-full landscape:h-full" @click.stop>
```

**Step 2: TimelineView 横屏优化**

Modify: `src/views/TimelineView.vue`

横屏时时间线更紧凑：

```vue
<div class="space-y-8 landscape:space-y-4">
```

**Step 3: Commit**

```bash
git add src/views/GalleryView.vue src/views/TimelineView.vue
git commit -m "feat: add landscape mode optimizations"
```

---

## 阶段四：首页体验优化

### Task 12: 倒计时卡片脉动动画

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: 添加脉动动画到倒计时卡片**

```vue
<div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[160px] animate-pulse-subtle">
```

**Step 2: Commit**

```bash
git add src/views/HomeView.vue
git commit -m "feat: add subtle pulse animation to countdown cards"
```

---

### Task 13: 天数卡片渐变边框

**Files:**
- Modify: `src/views/HomeView.vue`
- Modify: `src/styles/index.css`

**Step 1: 添加渐变边框工具类**

Modify: `src/styles/index.css`

在 `@layer components` 中添加：

```css
@layer components {
  /* 已有代码... */
  
  .gradient-border {
    position: relative;
    background: var(--color-card);
    border-radius: 1.5rem;
  }
  
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 1.5rem;
    padding: 2px;
    background: linear-gradient(135deg, var(--color-primary), transparent, var(--color-primary));
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}
```

**Step 2: 应用到天数卡片**

Modify: `src/views/HomeView.vue`

```vue
<div class="glass-nav rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 text-center gradient-border">
```

**Step 3: Commit**

```bash
git add src/styles/index.css src/views/HomeView.vue
git commit -m "feat: add gradient border to days counter card"
```

---

### Task 14: 周年倒计时进度环

**Files:**
- Create: `src/components/ProgressRing.vue`
- Modify: `src/views/HomeView.vue`

**Step 1: 创建 ProgressRing 组件**

```vue
<template>
  <div class="progress-ring relative inline-flex items-center justify-center">
    <svg class="transform -rotate-90" :width="size" :height="size">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-display text-primary">{{ percentage }}%</span>
      <span class="text-xs text-text-secondary">进度</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentage: { type: Number, default: 0 },
  size: { type: Number, default: 100 },
  strokeWidth: { type: Number, default: 8 },
  trackColor: { type: String, default: 'var(--color-border)' },
  progressColor: { type: String, default: 'var(--color-primary)' },
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (props.percentage / 100) * circumference.value);
</script>
```

**Step 2: 在 HomeView 中使用**

Modify: `src/views/HomeView.vue`

添加导入：

```javascript
import ProgressRing from '@/components/ProgressRing.vue';
```

在周年倒计时卡片中添加进度环：

```vue
<div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col items-center">
  <ProgressRing :percentage="anniversaryProgress" size="80" class="mb-2" />
  <p class="text-text-secondary text-xs sm:text-sm text-center">
    距离 {{ nextAnniversary.year }} 周年
  </p>
</div>
```

**Step 3: Commit**

```bash
git add src/components/ProgressRing.vue src/views/HomeView.vue
git commit -m "feat: add progress ring for anniversary countdown"
```

---

### Task 15: 精选照片区域标题和引导

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: 添加标题和引导**

```vue
<!-- Featured Photos Preview -->
<div class="mt-12 sm:mt-16">
  <div class="flex items-center justify-between mb-6 sm:mb-8">
    <div>
      <h2 class="font-display text-xl sm:text-2xl text-text-main">精选瞬间</h2>
      <p class="text-text-secondary text-sm mt-1">记录我们的美好回忆</p>
    </div>
    <RouterLink
      to="/gallery"
      class="group flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
    >
      <span class="text-sm">查看更多</span>
      <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </RouterLink>
  </div>
  
  <!-- 照片网格... -->
</div>
```

**Step 2: 添加导入**

```javascript
import { Image, ChevronRight } from 'lucide-vue-next';
```

**Step 3: Commit**

```bash
git add src/views/HomeView.vue
git commit -m "feat: add section header and CTA for featured photos"
```

---

## 阶段五：图片体验优化

### Task 16: 图片加载失败状态

**Files:**
- Modify: `src/components/PhotoCard.vue`

**Step 1: 优化图片加载失败状态**

```vue
<!-- 错误降级 -->
<div 
  v-if="error" 
  class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl"
>
  <div class="text-center">
    <ImageIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p class="text-gray-400 text-sm mb-2">图片加载失败</p>
    <button 
      @click="retryLoad"
      class="px-3 py-1 text-xs bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
    >
      重试
    </button>
  </div>
</div>
```

在 script 中添加 retryLoad 方法：

```javascript
function retryLoad() {
  error.value = false;
  loading.value = true;
  // 重新触发图片加载
  const img = new Image();
  img.onload = onLoad;
  img.onerror = onError;
  img.src = props.src;
}
```

**Step 2: Commit**

```bash
git add src/components/PhotoCard.vue
git commit -m "feat: enhance image error state with retry button"
```

---

### Task 17: 最终构建和测试

**Step 1: 完整构建**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 2: 检查所有文件修改**

Run: `git status`
Expected: All modified files staged or committed

**Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: comprehensive UI/UX improvements - animations, responsive layouts, interactions"
```

**Step 4: 推送**

```bash
git push
```

---

## 验收清单

- [ ] 天数计数器动画正常播放
- [ ] 自定义滚动条样式生效
- [ ] 选中文本高亮正常
- [ ] 猪猪光标显示（需图片资源）
- [ ] Skeleton 骨架屏组件可用
- [ ] Ripple 涟漪效果正常
- [ ] iPhone 安全区域适配
- [ ] 平板两栏布局生效
- [ ] 4K 屏幕字体变大
- [ ] 横屏模式适配正常
- [ ] 倒计时卡片脉动动画
- [ ] 天数卡片渐变边框
- [ ] 周年进度环显示
- [ ] 精选照片区域标题和引导
- [ ] 图片加载失败可重试
- [ ] 所有页面过渡动画统一
- [ ] 所有构建无错误

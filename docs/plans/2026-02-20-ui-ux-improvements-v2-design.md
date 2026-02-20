# UI/UX 优化设计方案 v2.0

> 版本: 2.0  
> 日期: 2026-02-20  
> 状态: 待实现

---

## 目录

1. [首页大数字动画增强](#1-首页大数字动画增强)
2. [背景装饰元素](#2-背景装饰元素)
3. [照片轮播Ken Burns效果](#3-照片轮播ken-burns效果)
4. [照片卡片3D倾斜效果](#4-照片卡片3d倾斜效果)
5. [页面切换动画优化](#5-页面切换动画优化)
6. [Lightbox改进](#6-lightbox改进)
7. [时光轴连线动画](#7-时光轴连线动画)
8. [留言入场动画增强](#8-留言入场动画增强)
9. [底部信息栏](#9-底部信息栏)

---

## 1. 首页大数字动画增强

### 当前状态
```
┌─────────────────────────┐
│      我们在一起          │
│                         │
│        5 1 9            │  ← 简单弹入动画
│         天              │
└─────────────────────────┘
```

### 设计目标
```
┌─────────────────────────┐
│      我们在一起          │
│                         │
│     ╭─────────╮         │
│     │  5 1 9  │         │  ← 数字滚动效果
│     ╰─────────╯         │
│     ∿∿∿∿∿∿∿∿∿          │  ← 底部光波
│         天              │
│     ──────────          │  ← 装饰线
└─────────────────────────┘
```

### 动画效果

**入场动画序列：**
```
0ms    → 数字从下方飞入，带弹性
300ms  → 数字产生波动效果
500ms  → 底部光波动画开始
800ms  → 装饰线从中间向两边展开
```

**数字滚动动画：**
- 使用CSS counter或JS实现数字从0滚动到目标值
- 每个数字独立动画，产生错落感
- 可选：数字变化时产生轻微抖动

### 实现方案

**CSS动画：**
```css
/* 数字滚动容器 */
.digit-roll {
  overflow: hidden;
  height: 1em;
}

.digit-roll span {
  display: block;
  animation: rollIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes rollIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 光波效果 */
.glow-wave {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent, 
    var(--color-primary), 
    transparent
  );
  animation: wavePulse 2s ease-in-out infinite;
}

@keyframes wavePulse {
  0%, 100% {
    opacity: 0.3;
    transform: translateX(-50%) scaleX(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) scaleX(1);
  }
}
```

---

## 2. 背景装饰元素

### 设计目标

**Before:**
```
┌─────────────────────────┐
│                         │
│    纯色背景，无装饰      │
│                         │
└─────────────────────────┘
```

**After:**
```
┌─────────────────────────┐
│  ❤️        💕           │  ← 漂浮心形
│      💗                 │
│         💖        💝    │
│    💘        💓         │
│              💞    💗   │
└─────────────────────────┘
```

### 装饰元素类型

1. **漂浮心形** - 大小不一，缓慢上下浮动
2. **闪烁星星** - 小型星星，随机闪烁
3. **粒子效果** - 微小的光点，缓慢飘动

### 动画参数

| 元素 | 大小 | 动画时长 | 动画类型 |
|------|------|----------|----------|
| 大心形 | 24-32px | 4-6s | 上下浮动 |
| 小心形 | 16-20px | 3-5s | 上下浮动+轻微旋转 |
| 星星 | 8-12px | 2-3s | 闪烁 |
| 粒子 | 4-6px | 8-10s | 缓慢飘动 |

### 实现方案

**新建组件：`FloatingDecorations.vue`**

```vue
<template>
  <div class="floating-decorations">
    <!-- 心形 -->
    <div v-for="heart in hearts" :key="heart.id"
      class="floating-heart"
      :style="heart.style">
      {{ heart.emoji }}
    </div>
    
    <!-- 星星 -->
    <div v-for="star in stars" :key="star.id"
      class="twinkling-star"
      :style="star.style">
      ✨
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const hearts = ref([]);
const stars = ref([]);

const heartEmojis = ['❤️', '💕', '💗', '💖', '💝', '💘', '💓', '💞'];

onMounted(() => {
  // 生成随机位置的心形
  for (let i = 0; i < 8; i++) {
    hearts.value.push({
      id: i,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${16 + Math.random() * 16}px`,
        animationDuration: `${4 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 2}s`,
      }
    });
  }
  
  // 生成随机位置的星星
  for (let i = 0; i < 12; i++) {
    stars.value.push({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${8 + Math.random() * 8}px`,
        animationDuration: `${2 + Math.random() * 2}s`,
        animationDelay: `${Math.random() * 2}s`,
      }
    });
  }
});
</script>

<style scoped>
.floating-decorations {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-heart {
  position: absolute;
  animation: floatHeart 4s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes floatHeart {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.twinkling-star {
  position: absolute;
  animation: twinkle 2s ease-in-out infinite;
  opacity: 0.4;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style>
```

---

## 3. 照片轮播Ken Burns效果

### 设计目标

Ken Burns效果 = 照片缓慢缩放 + 平移，产生电影感

**效果示意：**
```
原始状态                动画过程              最终状态
┌──────────┐         ┌──────────┐        ┌──────────┐
│ 照片A    │   →     │ 照片A    │   →    │ 照片A    │
│          │  缓慢    │  (放大)  │  移动   │ (平移)   │
└──────────┘  放大   └──────────┘        └──────────┘
```

### 动画参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 缩放范围 | 1.0 → 1.15 | 轻微放大 |
| 动画时长 | 5s | 与轮播间隔相同 |
| 平移方向 | 随机 | 左/右/上/下 |
| 缓动函数 | ease-in-out | 平滑过渡 |

### 实现方案

**修改 `PhotoCarousel.vue`：**

```css
.carousel-slide.is-active img {
  animation: kenBurns 5s ease-in-out forwards;
}

@keyframes kenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.1) translate(-2%, -2%);
  }
}

/* 不同方向的Ken Burns效果 */
.ken-burns-left { animation-name: kenBurnsLeft; }
.ken-burns-right { animation-name: kenBurnsRight; }
.ken-burns-up { animation-name: kenBurnsUp; }
.ken-burns-down { animation-name: kenBurnsDown; }

@keyframes kenBurnsLeft {
  0% { transform: scale(1) translate(2%, 0); }
  100% { transform: scale(1.1) translate(-2%, 0); }
}

@keyframes kenBurnsRight {
  0% { transform: scale(1) translate(-2%, 0); }
  100% { transform: scale(1.1) translate(2%, 0); }
}
```

---

## 4. 照片卡片3D倾斜效果

### 设计目标

鼠标移动时，卡片产生3D倾斜效果

**效果示意：**
```
鼠标在左侧：              鼠标在右侧：
    ╱                    ╲
   ╱                      ╲
  ╱    卡片                ╲  卡片
 ╱                          ╲
                                
```

### 实现方案

**修改 `PhotoCard.vue`：**

```vue
<script setup>
import { ref } from 'vue';

const cardRef = ref(null);
const transform = ref('');

function handleMouseMove(e) {
  if (!cardRef.value) return;
  
  const rect = cardRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 20;
  const rotateY = (centerX - x) / 20;
  
  transform.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
}

function handleMouseLeave() {
  transform.value = '';
}
</script>

<template>
  <div 
    ref="cardRef"
    class="photo-card-3d"
    :style="{ transform: transform }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 卡片内容 -->
  </div>
</template>

<style scoped>
.photo-card-3d {
  transition: transform 0.1s ease-out;
  transform-style: preserve-3d;
}
</style>
```

---

## 5. 页面切换动画优化

### 当前状态
```
页面A 淡出 → 页面B 淡入
（简单的透明度过渡）
```

### 设计目标
```
页面A 向左滑出 → 页面B 从右侧滑入
（类似原生APP的页面切换）
```

### 实现方案

**修改 `App.vue`：**

```css
/* 页面切换动画 */
.page-enter-active {
  animation: pageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  animation: pageSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pageSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

/* 返回时的反向动画 */
.page-back-enter-active {
  animation: pageSlideBackIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-back-leave-active {
  animation: pageSlideBackOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageSlideBackIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pageSlideBackOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}
```

---

## 6. Lightbox改进

### 当前状态
```
┌───────────────────────────────┐
│                               │
│         [图片居中]            │
│                               │
│     ← → 切换 · 滚轮缩放       │
│                               │
│      标题                     │
│      日期                     │
└───────────────────────────────┘
```

### 设计目标
```
┌───────────────────────────────┐
│ 📷 图片信息    [♡ 收藏] [×关闭]│  ← 顶部工具栏
├───────────────────────────────┤
│                               │
│    [图片带缩放动画]           │
│                               │
├───────────────────────────────┤
│ ◀ 1/7 ▶                      │  ← 底部导航
│ ━━━━━━━━━━━━━━━              │  ← 进度条
│ 汝南の雪 · 2026年2月16日      │
│ 📍 China · 🏷️ 户外            │
└───────────────────────────────┘
```

### 新增功能

1. **顶部工具栏** - 图片计数、收藏按钮、关闭按钮
2. **缩放动画** - 打开/关闭时有平滑的缩放过渡
3. **底部导航** - 进度条、左右切换
4. **信息展示** - 地点、标签更醒目

### 实现方案

**修改 `GalleryView.vue`：**

```vue
<!-- Lightbox顶部工具栏 -->
<div class="lightbox-toolbar">
  <span class="photo-counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
  <button class="favorite-btn" @click="toggleFavorite">
    <Heart :class="{ 'is-favorite': isFavorite }" />
  </button>
  <button class="close-btn" @click="closeLightbox">
    <X />
  </button>
</div>

<!-- Lightbox底部信息 -->
<div class="lightbox-info-bar">
  <div class="progress-bar">
    <div class="progress" :style="{ width: ((currentIndex + 1) / photos.length * 100) + '%' }"></div>
  </div>
  <div class="info-content">
    <h3>{{ selectedPhoto.title }}</h3>
    <p>{{ formatDate(selectedPhoto.date) }}</p>
    <div class="tags">
      <span v-for="tag in selectedPhoto.tags">🏷️ {{ tag }}</span>
    </div>
  </div>
</div>
```

---

## 7. 时光轴连线动画

### 当前状态
```
静态垂直线，无动画
```

### 设计目标
```
滚动时，连线动态绘制
     │
     │  ← 从上往下逐渐出现
     │
     ●
     │
     │
     ●
```

### 实现方案

**使用SVG stroke-dashoffset动画：**

```css
.timeline-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
```

---

## 8. 留言入场动画增强

### 当前动画
```
从上方滑入，简单缩放
```

### 设计目标
```
1. 从随机方向飞入（左/右/上）
2. 带有轻微的弹性效果
3. 背景产生涟漪扩散
```

### 实现方案

```css
.message-enter-active {
  animation: messageFlyIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes messageFlyIn {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8);
  }
  60% {
    transform: translateY(10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 涟漪效果 */
.message-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(212, 165, 116, 0);
  }
}
```

---

## 9. 底部信息栏

### 设计目标
```
┌─────────────────────────────────────┐
│                                     │
│         [页面内容区域]              │
│                                     │
├─────────────────────────────────────┤
│  💕 zhuzhu © 2024-2026              │
│  Made with ❤️ by 大萝卜 & 猪猪      │
│  备案号: 京ICP备XXXXXXXX号          │
└─────────────────────────────────────┘
```

### 实现方案

**新建组件：`SiteFooter.vue`**

```vue
<template>
  <footer class="site-footer">
    <div class="footer-content">
      <p class="footer-brand">
        <span class="heart">💕</span>
        zhuzhu © {{ startYear }}-{{ currentYear }}
      </p>
      <p class="footer-made">
        Made with <span class="heart">❤️</span> by 大萝卜 & 猪猪
      </p>
      <p class="footer-icp" v-if="icp">
        <a href="https://beian.miit.gov.cn/" target="_blank">
          {{ icp }}
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const startYear = 2024;
const currentYear = new Date().getFullYear();
const icp = ''; // 填写实际备案号
</script>

<style scoped>
.site-footer {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.footer-brand {
  font-family: var(--font-display);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.footer-made {
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.heart {
  display: inline-block;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
```

---

## 实现优先级

| 优先级 | 任务 | 预计时间 |
|--------|------|----------|
| P0 | 首页大数字动画增强 | 20min |
| P0 | 背景装饰元素 | 15min |
| P1 | 照片轮播Ken Burns效果 | 10min |
| P1 | 照片卡片3D倾斜效果 | 15min |
| P1 | Lightbox改进 | 25min |
| P2 | 页面切换动画优化 | 10min |
| P2 | 时光轴连线动画 | 15min |
| P3 | 留言入场动画增强 | 10min |
| P3 | 底部信息栏 | 10min |

**总预计时间: ~2小时**

---

## 文件改动清单

| 文件 | 改动类型 |
|------|----------|
| `src/views/HomeView.vue` | 修改 |
| `src/components/FloatingDecorations.vue` | 新建 |
| `src/components/PhotoCarousel.vue` | 修改 |
| `src/components/PhotoCard.vue` | 修改 |
| `src/views/GalleryView.vue` | 修改 |
| `src/views/TimelineView.vue` | 修改 |
| `src/views/GuestbookView.vue` | 修改 |
| `src/components/SiteFooter.vue` | 新建 |
| `src/App.vue` | 修改 |

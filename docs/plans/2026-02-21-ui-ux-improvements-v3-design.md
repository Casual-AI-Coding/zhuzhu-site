# UI/UX 优化设计方案 v3.0

> 版本: 3.0  
> 日期: 2026-02-21  
> 状态: 待实现

---

## 目录

1. [空状态设计增强](#1-空状态设计增强)
2. [Toast通知组件](#2-toast通知组件)
3. [移动端底部导航](#3-移动端底部导航)
4. [下拉刷新全局化](#4-下拉刷新全局化)
5. [分享海报生成功能](#5-分享海报生成功能)
6. [加载状态优化](#6-加载状态优化)

---

## 1. 空状态设计增强

### 当前状态

```
┌─────────────────────────┐
│                         │
│                         │
│       暂无照片          │  ← 简单文字，无插画
│                         │
│                         │
└─────────────────────────┘
```

### 设计目标

```
┌─────────────────────────┐
│                         │
│      ╭──────────╮      │
│      │  💑      │      │  ← SVG 插画：拥抱的情侣
│      │  👫→👩‍❤️‍💋‍👨    │      │
│      ╰──────────╯      │
│                         │
│   还没有照片哦~          │  ← 主标题
│  快上传你们的美好瞬间吧   │  ← 副标题
│                         │
│  ┌─────────────────┐   │
│  │   📷 上传照片    │   │  ← 引导按钮
│  └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### 各页面空状态设计

#### 相册页面 (GalleryView)
```
┌─────────────────────────┐
│      ╭──────────╮      │
│      │  💑      │      │
│      │  👫→👩‍❤️‍💋‍👨    │      │
│      ╰──────────╯      │
│                         │
│   还没有照片哦~          │
│  快上传你们的美好瞬间吧   │
│                         │
│  ┌─────────────────┐   │
│  │   📷 上传照片    │   │
│  └─────────────────┘   │
└─────────────────────────┘
```

#### 时光轴页面 (TimelineView)
```
┌─────────────────────────┐
│      ╭──────────╮      │
│      │  ⏰      │      │
│      │  心形    │      │
│      ╰──────────╯      │
│                         │
│   还没有记录哦~          │
│  一起回忆美好的时光吧     │
│                         │
│  ┌─────────────────┐   │
│  │   ➕ 添加回忆    │   │
│  └─────────────────┘   │
└─────────────────────────┘
```

#### 纪念日页面 (AnniversaryView)
```
┌─────────────────────────┐
│      ╭──────────╮      │
│      │  📅      │      │
│      │  💕      │      │
│      ╰──────────╯      │
│                         │
│   还没有纪念日哦~        │
│  记录属于你们的特别日子   │
│                         │
│  ┌─────────────────┐   │
│  │  💝 添加纪念日   │   │
│  └─────────────────┘   │
└─────────────────────────┘
```

### SVG 插画资源

使用内联 SVG 实现，无需外部图片资源：

```vue
<!-- 拥抱情侣 SVG -->
<svg viewBox="0 0 200 200" class="empty-illustration">
  <!-- 男生剪影 -->
  <circle cx="70" cy="120" r="25" fill="#D4A574"/>
  <rect x="55" y="145" width="30" height="60" rx="5" fill="#D4A574"/>
  <!-- 女生剪影 -->
  <circle cx="130" cy="120" r="22" fill="#E8C9A8"/>
  <rect x="115" y="148" width="30" height="55" rx="5" fill="#E8C9A8"/>
  <!-- 心形 -->
  <path d="M100 80 C90 60, 70 60, 70 80 C70 100, 100 130, 100 130 C100 130, 130 100, 130 80 C130 60, 110 60, 100 80" fill="#FF6B6B"/>
</svg>
```

### 实现方案

**新建组件：`src/components/EmptyState.vue`**

```vue
<template>
  <div class="empty-state text-center py-16">
    <!-- 插画区域 -->
    <div class="illustration mb-6">
      <slot name="illustration">
        <svg viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
          <!-- 默认插画 -->
        </svg>
      </slot>
    </div>
    
    <!-- 标题 -->
    <h3 class="text-lg font-display text-text-main mb-2">
      {{ title }}
    </h3>
    
    <!-- 副标题 -->
    <p class="text-text-secondary text-sm mb-6">
      {{ subtitle }}
    </p>
    
    <!-- 引导按钮 -->
    <button
      v-if="actionText"
      @click="$emit('action')"
      class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  actionText: { type: String, default: '' },
});

defineEmits(['action']);
</script>
```

---

## 2. Toast 通知组件

### 设计目标

```
┌────────────────────────────────────┐
│                                    │
│   ✓ 加载成功                        │  ← 成功状态：绿色 (#6BCB77)
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│                                    │
│   ✗ 网络请求失败                    │  ← 错误状态：红色 (#FF6B6B)
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│                                    │
│   ℹ 正在加载中...                   │  ← 信息状态：蓝色 (#4D96FF)
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│                                    │
│   💕 收藏成功                       │  ← 特殊状态：粉色 (#FF6BD3)
│                                    │
└────────────────────────────────────┘
```

### Toast 类型

| 类型 | 颜色 | 图标 | 用途 |
|------|------|------|------|
| success | #6BCB77 | ✓ | 操作成功 |
| error | #FF6B6B | ✗ | 错误提示 |
| info | #4D96FF | ℹ | 加载中 |
| warning | #FFD93D | ⚠ | 警告信息 |

### 实现方案

**新建组合式函数：`src/composables/useToast.js`**

```javascript
import { ref, readonly } from 'vue';

const toasts = ref([]);
let id = 0;

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const toast = {
      id: ++id,
      message,
      type,
    };
    
    toasts.value.push(toast);
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        remove(toast.id);
      }, duration);
    }
    
    return toast.id;
  }
  
  function success(message, duration) {
    return show(message, 'success', duration);
  }
  
  function error(message, duration) {
    return show(message, 'error', duration);
  }
  
  function info(message, duration) {
    return show(message, 'info', duration);
  }
  
  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }
  
  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    remove,
  };
}
```

**新建组件：`src/components/ToastContainer.vue`**

```vue
<template>
  <Teleport to="body">
    <div class="toast-container fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[200px]"
          :class="toastClass(toast.type)"
        >
          <span class="toast-icon">{{ toastIcon(toast.type) }}</span>
          <span class="toast-message text-sm font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();

function toastClass(type) {
  const classes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };
  return classes[type] || classes.info;
}

function toastIcon(type) {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };
  return icons[type] || 'ℹ';
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

**使用示例：**

```javascript
import { useToast } from '@/composables/useToast';

const toast = useToast();

// 成功
toast.success('保存成功！');

// 错误
toast.error('网络请求失败，请稍后重试');

// 信息
toast.info('正在加载...');
```

---

## 3. 移动端底部导航

### 设计目标

```
┌────────────────────────────────────┐
│                                    │
│           页面内容                  │
│                                    │
│                                    │
│                                    │
│                                    │
├────────────────────────────────────┤
│  🏠    📅    🖼️    ⏰    💬    │
│ 首页  纪念日  相册  时光轴  留言  │
│                                    │
│   ↑ 仅移动端 (max-width: 639px)   │
└────────────────────────────────────┘
```

### 视觉设计

```
┌────────────────────────────────────┐
│                                    │
│         激活状态                    │
│  ╭──────────────────────╮         │
│  │  💖                  │         │
│  │  首页                 │         │
│  │  (底部高亮条)         │         │
│  ╰──────────────────────╯         │
│                                    │
│         未激活状态                  │
│  ┌────────────────────┐           │
│  │  🏠               │           │
│  │  首页              │           │
│  └────────────────────┘           │
└────────────────────────────────────┘
```

### 组件结构

**配置项：**

```javascript
const navItems = [
  { name: 'home', path: '/', label: '首页', icon: '🏠' },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: '📅' },
  { name: 'gallery', path: '/gallery', label: '相册', icon: '🖼️' },
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: '⏰' },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: '💬' },
];
```

### 实现方案

**新建组件：`src/components/BottomNav.vue`**

```vue
<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-40 md:hidden">
    <div class="glass-nav rounded-t-2xl px-2 py-1 flex items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="bottom-nav-item flex flex-col items-center py-2 px-3 rounded-xl transition-colors"
        :class="{ 'is-active': isActive(item.path) }"
      >
        <span class="bottom-nav-icon text-xl mb-0.5">{{ item.icon }}</span>
        <span class="bottom-nav-label text-[10px]">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: '🏠' },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: '📅' },
  { name: 'gallery', path: '/gallery', label: '相册', icon: '🖼️' },
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: '⏰' },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: '💬' },
];

function isActive(path) {
  return route.path === path;
}
</script>

<style scoped>
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav-item {
  color: var(--color-text-secondary);
}

.bottom-nav-item.is-active {
  color: var(--color-primary);
}

.bottom-nav-item.is-active .bottom-nav-icon {
  transform: scale(1.1);
}
</style>
```

**在 App.vue 中引入：**

```vue
<!-- App.vue -->
<template>
  <div class="min-h-screen relative flex flex-col pb-16">
    <!-- ... 其他内容 ... -->
    
    <!-- 移动端底部导航 -->
    <BottomNav />
  </div>
</template>
```

### 样式细节

```css
.bottom-nav {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.85);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

:global(.dark) .bottom-nav {
  background: rgba(30, 30, 30, 0.85);
  border-top: 1px solid rgba(255, 255 0.05, 255,);
}

/* 点击反馈 */
.bottom-nav-item:active {
  transform: scale(0.95);
}

/* 激活状态指示器 */
.bottom-nav-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 3px;
}
```

---

## 4. 下拉刷新全局化

### 设计目标

```
┌────────────────────────────────────┐
│          ↓ 松开刷新                 │  ← 触发状态
├────────────────────────────────────┤
│                                    │
│         页面内容                    │
│                                    │
└────────────────────────────────────┘
```

### 实现方案

**新建组合式函数：`src/composables/usePullToRefresh.js`**

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,       // 触发刷新的下拉距离
    resistance = 2.5,    // 下拉阻力系数
  } = options;
  
  const isRefreshing = ref(false);
  const pullDistance = ref(0);
  const isPulling = ref(false);
  
  let startY = 0;
  let currentY = 0;
  
  function handleTouchStart(e) {
    // 只有在页面顶部才能下拉刷新
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      isPulling.value = true;
    }
  }
  
  function handleTouchMove(e) {
    if (!isPulling.value || isRefreshing.value) return;
    
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // 下拉且未超出阈值
    if (diff > 0) {
      // 应用阻力
      pullDistance.value = Math.min(diff / resistance, threshold * 1.5);
      
      // 阻止默认滚动（当超过阈值时）
      if (pullDistance.value > threshold) {
        e.preventDefault();
      }
    }
  }
  
  function handleTouchEnd() {
    if (!isPulling.value) return;
    
    isPulling.value = false;
    
    // 超过阈值，触发刷新
    if (pullDistance.value > threshold) {
      isRefreshing.value = true;
      pullDistance.value = 0;
      
      Promise.resolve(onRefresh?.()).finally(() => {
        isRefreshing.value = false;
      });
    } else {
      pullDistance.value = 0;
    }
  }
  
  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  });
  
  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  });
  
  return {
    isRefreshing,
    pullDistance,
  };
}
```

**使用示例：**

```vue
<script setup>
import { usePullToRefresh } from '@/composables/usePullToRefresh';

async function handleRefresh() {
  // 刷新数据
  await fetchPhotos();
}

const { isRefreshing, pullDistance } = usePullToRefresh(handleRefresh);
</script>

<template>
  <div :style="{ transform: `translateY(${pullDistance}px)` }">
    <!-- 下拉提示 -->
    <div v-if="pullDistance > 0" class="text-center py-2 text-primary">
      {{ pullDistance > threshold ? '松开刷新' : '下拉刷新' }}
    </div>
    
    <!-- 刷新中 -->
    <div v-if="isRefreshing" class="text-center py-2">
      <span class="animate-spin">⟳</span> 刷新中...
    </div>
    
    <!-- 页面内容 -->
    <!-- ... -->
  </div>
</template>
```

---

## 5. 分享海报生成功能

### 设计目标

```
┌────────────────────────────────────┐
│         ✨ zhuzhu ✨               │  ← 网站名称
├────────────────────────────────────┤
│                                    │
│       💑  👫→👩‍❤️‍💋‍👨    │            │  ← 插画/情侣头像
│                                    │
│      我们在一起                    │  ← 主标题
│                                    │
│         5 1 9                     │  ← 天数（大字）
│          天                        │
│                                    │
│    从 2024年9月1日 开始            │  ← 起始日期
│                                    │
│   ┌─────────────────────────┐     │
│   │     [情侣照片]          │     │  ← 照片区域
│   │                         │     │
│   └─────────────────────────┘     │
│                                    │
│   💕 大萝卜 ❤️ 猪猪               │  ← 署名
│                                    │
└────────────────────────────────────┘
           ↓ 导出为图片
        ┌──────────┐
        │ zhuzhu.png │
        │ (保存)    │
        └──────────┘
```

### 实现方案

**新建组件：`src/components/SharePoster.vue`**

```vue
<template>
  <div class="share-poster">
    <!-- 预览画布 -->
    <div ref="posterRef" class="poster-canvas">
      <!-- 背景 -->
      <div class="poster-bg">
        <!-- 装饰元素 -->
        <div class="poster-decorations">
          <span class="deco-heart deco-1">💕</span>
          <span class="deco-heart deco-2">💗</span>
          <span class="deco-heart deco-3">💖</span>
          <span class="deco-star deco-4">✨</span>
        </div>
        
        <!-- 内容 -->
        <div class="poster-content">
          <h1 class="poster-title">✨ zhuzhu ✨</h1>
          
          <div class="poster-main">
            <p class="poster-subtitle">我们在一起</p>
            <p class="poster-days">{{ totalDays }}</p>
            <p class="poster-days-label">天</p>
          </div>
          
          <p class="poster-date">从 {{ startDate }} 开始</p>
          
          <!-- 照片占位 -->
          <div class="poster-photo" v-if="photoUrl">
            <img :src="photoUrl" alt="情侣照片" />
          </div>
          
          <p class="poster-signature">💕 大萝卜 ❤️ 猪猪</p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="poster-actions">
      <button @click="downloadPoster" class="btn-download">
        📥 保存海报
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDaysCount } from '@/composables/useDaysCount';

const { totalDays, formattedStartDate } = useDaysCount();
const posterRef = ref(null);

const props = defineProps({
  photoUrl: { type: String, default: '' },
});

const startDate = computed(() => formattedStartDate.value);

async function downloadPoster() {
  if (!posterRef.value) return;
  
  // 使用 html2canvas 或手动绘制 canvas
  // 这里简化实现，实际可用 html2canvas 库
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置画布大小
  canvas.width = 600;
  canvas.height = 900;
  
  // 绘制背景
  ctx.fillStyle = '#FFF5F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制装饰
  // ... (绘制心形、星形等)
  
  // 绘制文字
  ctx.fillStyle = '#D4A574';
  ctx.font = 'bold 36px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ zhuzhu ✨', 300, 80);
  
  // 导出图片
  const link = document.createElement('a');
  link.download = 'zhuzhu-poster.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
</script>

<style scoped>
.poster-canvas {
  width: 300px;
  height: 450px;
  background: linear-gradient(135deg, #FFF5F0 0%, #FFE4D6 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.poster-content {
  padding: 24px;
  text-align: center;
}

.poster-title {
  font-family: serif;
  font-size: 24px;
  color: #D4A574;
  margin-bottom: 20px;
}

.poster-main {
  margin: 30px 0;
}

.poster-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

.poster-days {
  font-size: 72px;
  font-weight: bold;
  color: #D4A574;
  line-height: 1;
}

.poster-days-label {
  font-size: 24px;
  color: #999;
}

.poster-date {
  font-size: 14px;
  color: #999;
}

.poster-photo {
  margin: 20px auto;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
}

.poster-signature {
  margin-top: 30px;
  font-size: 16px;
  color: #D4A574;
}

/* 装饰动画 */
.deco-heart {
  position: absolute;
  animation: float 3s ease-in-out infinite;
}

.deco-1 { top: 20px; left: 20px; animation-delay: 0s; }
.deco-2 { top: 40px; right: 30px; animation-delay: 0.5s; }
.deco-3 { bottom: 100px; left: 15px; animation-delay: 1s; }
.deco-4 { top: 60px; right: 15px; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
```

### 集成到首页

在 HomeView 中添加分享按钮：

```vue
<!-- HomeView.vue -->
<template>
  <!-- 分享按钮 -->
  <button @click="showSharePoster = true" class="share-btn">
    📤 分享
  </button>
  
  <!-- 海报弹窗 -->
  <div v-if="showSharePoster" class="share-modal" @click="showSharePoster = false">
    <SharePoster @close="showSharePoster = false" />
  </div>
</template>
```

---

## 6. 加载状态优化

### 当前状态

```
┌─────────────────────────┐
│  ████████               │  ← 简单骨架屏
│  ████████               │
│  ████████               │
└─────────────────────────┘
```

### 设计目标

```
┌────────────────────────────────────┐
│  🏠  Loading...                    │  ← 品牌元素加载动画
├────────────────────────────────────┤
│  ┌────────┐  ┌────────┐          │
│  │ ██████ │  │ ██████ │          │  ← 卡片骨架屏
│  │ ██████ │  │ ██████ │          │     带微光脉动
│  │ ██████ │  │ ██████ │          │
│  └────────┘  └────────┘          │
│                                    │
│  ┌──────────────────────────┐      │
│  │ ██████████████████████  │      │
│  └──────────────────────────┘      │
│                                    │
└────────────────────────────────────┘
```

### 实现方案

**增强骨架屏组件：**

```vue
<!-- 新的骨架屏样式 -->
<style scoped>
.skeleton-pulse {
  animation: skeletonPulse 1.5s ease-in-out infinite;
}

@keyframes skeletonPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 品牌颜色骨架 */
.skeleton-brand {
  background: linear-gradient(
    90deg,
    rgba(212, 165, 116, 0.1) 0%,
    rgba(212, 165, 116, 0.2) 50%,
    rgba(212, 165, 116, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
```

**添加加载占位符动画：**

```vue
<!-- SkeletonGrid.vue 增强 -->
<template>
  <div class="grid gap-4" :class="gridColsClass">
    <div v-for="i in count" :key="i" class="skeleton-item skeleton-brand rounded-xl overflow-hidden">
      <!-- 图片占位 -->
      <div :class="aspectClass" class="skeleton-pulse"></div>
      <!-- 文字占位 -->
      <div class="p-4 space-y-2">
        <div class="h-4 skeleton-pulse rounded w-3/4"></div>
        <div class="h-3 skeleton-pulse rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>
```

---

## 实现优先级

| 优先级 | 任务 | 预计时间 |
|--------|------|----------|
| P0 | Toast 通知组件 | 20min |
| P0 | 空状态设计 | 30min |
| P1 | 移动端底部导航 | 30min |
| P1 | 分享海报功能 | 45min |
| P2 | 下拉刷新全局化 | 30min |
| P2 | 加载状态优化 | 20min |

---

## 验收标准

### Toast 通知组件
- [ ] 支持 success/error/info/warning 四种类型
- [ ] 自动 3 秒后消失
- [ ] 支持手动关闭
- [ ] 动画流畅

### 空状态设计
- [ ] 相册页面有拥抱情侣插画
- [ ] 时光轴页面有时钟插画
- [ ] 纪念日页面有日历插画
- [ ] 有点击引导按钮

### 移动端底部导航
- [ ] 仅移动端显示
- [ ] 5 个导航项完整
- [ ] 点击有反馈动画
- [ ] 激活状态正确

### 分享海报
- [ ] 生成精美海报图片
- [ ] 包含天数、日期
- [ ] 可保存到本地

### 下拉刷新
- [ ] 所有页面支持
- [ ] 有视觉反馈
- [ ] 不影响页面滚动

### 加载状态
- [ ] 骨架屏有微光动画
- [ ] 品牌颜色一致

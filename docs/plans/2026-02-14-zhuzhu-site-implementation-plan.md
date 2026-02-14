# zhuzhu Site - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个复古胶片风格的情侣记录网站，包含首页、纪念日、相册墙、时光轴、留言板五个核心页面，通过 Notion API 获取数据，最终部署到 Netlify。

**Architecture:** 
- 单页 SPA 架构，使用 Vue Router 进行页面路由
- 组件化开发，组合式函数封装复用逻辑
- Notion 作为后端数据存储，通过 API 获取数据
- GSAP + @vueuse/motion 实现流畅动画效果
- 响应式设计支持移动端/平板/桌面端

**Tech Stack:** 
- Vue 3 (Composition API)
- Vite 5
- Tailwind CSS 3
- Vue Router 4
- GSAP + @vueuse/motion
- @notionhq/client
- Netlify

**恋爱起始日:** 2024年9月19日

---

## 阶段一：项目初始化

### Task 1: 创建项目基础结构

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `.env.example`
- Create: `.gitignore`

**Step 1: 创建 package.json**

```json
{
  "name": "zhuzhu-site",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "@notionhq/client": "^2.2.0",
    "gsap": "^3.12.0",
    "@vueuse/motion": "^2.2.0",
    "@vueuse/core": "^10.7.0",
    "lucide-vue-next": "^0.300.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

**Step 3: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4A574',
        background: '#F5EDE4',
        card: '#FFF8F0',
        text: {
          main: '#3D3D3D',
          secondary: '#8B7355',
        },
        border: '#E8DDD0',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
```

**Step 4: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>zhuzhu Site - 我们的恋爱记录</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-background text-text-main font-body">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Step 6: 创建 .env.example**

```bash
VITE_NOTION_TOKEN=secret_xxxxxxxxxxxxxxxx
VITE_NOTION_DATABASE_ANNIVERSARY=xxxxxxxxxxxxxxxx
VITE_NOTION_DATABASE_PHOTOS=xxxxxxxxxxxxxxxx
VITE_NOTION_DATABASE_TIMELINE=xxxxxxxxxxxxxxxx
VITE_NOTION_DATABASE_MESSAGES=xxxxxxxxxxxxxxxx
```

**Step 7: 创建 .gitignore**

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.local
```

---

### Task 2: 安装项目依赖

**Step 1: 运行依赖安装**

Run: `npm install`
Expected: 成功安装所有依赖，显示 added X packages

**Step 2: 验证安装**

Run: `npm list vue vue-router gsap tailwindcss`
Expected: 显示各依赖版本

---

### Task 3: 创建项目目录结构

**Step 1: 创建目录结构**

Run: `mkdir -p src/components src/views src/composables src/styles src/lib public/assets src/router src/types`

**Step 2: 验证目录创建**

Run: `ls -la src/`
Expected: 显示 components, views, composables, styles, lib, router, types 目录

---

## 阶段二：核心配置

### Task 4: 创建全局样式和入口文件

**Files:**
- Create: `src/styles/index.css`
- Create: `src/main.js`
- Create: `src/App.vue`

**Step 1: 创建 src/styles/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-background text-text-main font-body antialiased;
  }
}

@layer components {
  .glass-nav {
    @apply bg-card/80 backdrop-blur-md border border-border/50;
  }
  
  .film-grain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
  
  .card-hover {
    @apply transition-all duration-300 ease-out;
  }
  
  .card-hover:hover {
    @apply -translate-y-1 shadow-lg;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70;
  }
}
```

**Step 2: 创建 src/main.js**

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/index.css';

const app = createApp(App);

app.use(router);
app.mount('#app');
```

**Step 3: 创建 src/App.vue**

```vue
<template>
  <div class="min-h-screen relative">
    <!-- Film grain overlay -->
    <div class="film-grain"></div>
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main content -->
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue';
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

---

### Task 5: 创建路由配置

**Files:**
- Create: `src/router/index.js`
- Create: `src/views/HomeView.vue` (placeholder)

**Step 1: 创建 src/router/index.js**

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/anniversary',
    name: 'anniversary',
    component: () => import('@/views/AnniversaryView.vue'),
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue'),
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: () => import('@/views/TimelineView.vue'),
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('@/views/GuestbookView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
```

**Step 2: 创建占位视图组件**

为每个视图创建基础占位文件（HomeView, AnniversaryView, GalleryView, TimelineView, GuestbookView）:

```vue
<!-- src/views/HomeView.vue -->
<template>
  <div class="pt-20">
    <h1 class="font-display text-4xl text-center">首页</h1>
  </div>
</template>
```

其他视图类似创建，仅包含基础 template。

---

## 阶段三：核心组件开发

### Task 6: 开发导航栏组件

**Files:**
- Create: `src/components/Navigation.vue`

**Step 1: 创建导航栏组件**

```vue
<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 glass-nav"
    :class="{ 'translate-y-0': visible, '-translate-y-full': !visible }"
  >
    <div class="max-w-6xl mx-auto px-4 py-3">
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center justify-center gap-8">
        <RouterLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link font-handwriting text-lg"
          :class="{ 'text-primary': $route.path === item.path }"
        >
          {{ item.label }}
        </RouterLink>
      </div>
      
      <!-- Mobile Navigation -->
      <div class="md:hidden flex items-center justify-around py-2">
        <RouterLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center gap-1 nav-link"
          :class="{ 'text-primary': $route.path === item.path }"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Home, Heart, Image, Clock, MessageCircle } from 'lucide-vue-next';

const visible = ref(true);
const lastScrollY = ref(0);

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/anniversary', label: '纪念日', icon: Heart },
  { path: '/gallery', label: '相册', icon: Image },
  { path: '/timeline', label: '时光轴', icon: Clock },
  { path: '/guestbook', label: '留言', icon: MessageCircle },
];

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  visible.value = currentScrollY < lastScrollY.value || currentScrollY < 50;
  lastScrollY.value = currentScrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.nav-link {
  @apply text-text-secondary hover:text-primary transition-colors duration-200;
}
</style>
```

---

### Task 7: 开发天数计算组合式函数

**Files:**
- Create: `src/composables/useDaysCount.js`

**Step 1: 创建 useDaysCount.js**

```javascript
import { ref, computed, onMounted, onUnmounted } from 'vue';

const START_DATE = new Date('2024-09-19');

export function useDaysCount() {
  const now = ref(new Date());
  let timer = null;

  const daysCount = computed(() => {
    const diff = now.value.getTime() - START_DATE.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  });

  const formattedDate = computed(() => {
    const year = START_DATE.getFullYear();
    const month = String(START_DATE.getMonth() + 1).padStart(2, '0');
    const day = String(START_DATE.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  });

  const updateTime = () => {
    now.value = new Date();
  };

  onMounted(() => {
    timer = setInterval(updateTime, 1000 * 60); // 每分钟更新
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return {
    daysCount,
    formattedDate,
  };
}
```

---

### Task 8: 开发首页视图

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: 实现首页完整代码**

```vue
<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Background Image with Ken Burns Effect -->
    <div class="absolute inset-0 z-0">
      <img 
        v-if="heroImage"
        :src="heroImage"
        alt="Hero"
        class="w-full h-full object-cover ken-burns"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background"></div>
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      <!-- Title -->
      <h1 
        class="font-display text-5xl md:text-7xl text-text-main mb-4 opacity-0"
        ref="titleRef"
      >
        我们在一起
      </h1>

      <!-- Days Counter -->
      <div class="text-center mb-8">
        <p class="font-handwriting text-2xl text-text-secondary mb-2">
          {{ formattedDate }} 开始
        </p>
        <div class="flex items-center justify-center gap-2">
          <span 
            v-for="(digit, index) in digits" 
            :key="index"
            class="inline-block w-12 h-16 md:w-16 md:h-20 bg-card rounded-lg shadow-lg flex items-center justify-center font-display text-4xl md:text-5xl text-primary digit"
          >
            {{ digit }}
          </span>
          <span class="font-handwriting text-2xl text-text-secondary ml-2">天</span>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 animate-bounce">
        <div class="w-6 h-10 border-2 border-text-secondary/50 rounded-full flex justify-center pt-2">
          <div class="w-1 h-2 bg-text-secondary/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDaysCount } from '@/composables/useDaysCount';
import gsap from 'gsap';

const { daysCount, formattedDate } = useDaysCount();

const titleRef = ref(null);
const heroImage = ref(null);

// 将天数转换为各位数字
const digits = computed(() => {
  const days = daysCount.value.toString().padStart(3, '0');
  return days.split('');
});

// 动画效果
onMounted(() => {
  // 标题淡入
  gsap.to(titleRef.value, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
  });

  // 数字依次出现
  gsap.from('.digit', {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    delay: 0.5,
    ease: 'back.out(1.7)',
  });

  // 模拟获取精选照片
  heroImage.value = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920';
});
</script>

<style scoped>
.ken-burns {
  animation: kenBurns 20s ease-in-out infinite alternate;
}

@keyframes kenBurns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}
</style>
```

---

### Task 9: 开发纪念日视图

**Files:**
- Modify: `src/views/AnniversaryView.vue`
- Create: `src/components/AnniversaryCard.vue`

**Step 1: 创建 AnniversaryCard.vue**

```vue
<template>
  <div 
    class="bg-card rounded-2xl p-6 shadow-md border border-border/30 card-hover"
    :class="{ 'border-primary': isUrgent }"
  >
    <div class="flex items-center gap-3 mb-3">
      <span class="text-3xl">{{ icon }}</span>
      <h3 class="font-display text-xl text-text-main">{{ title }}</h3>
    </div>
    <p class="font-handwriting text-2xl text-primary mb-2">{{ daysUntil }} 天</p>
    <p class="text-text-secondary text-sm">{{ date }}</p>
    <p v-if="description" class="text-text-secondary/70 text-sm mt-2">{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  date: String,
  icon: String,
  description: String,
});

const targetDate = computed(() => new Date(props.date));
const today = computed(() => new Date());

const daysUntil = computed(() => {
  const diff = targetDate.value.getTime() - today.value.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const isUrgent = computed(() => daysUntil.value <= 7 && daysUntil.value >= 0);
</script>
```

**Step 2: 实现 AnniversaryView.vue**

```vue
<template>
  <div class="pt-24 pb-12 px-4 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl md:text-5xl text-text-main mb-4">纪念日</h1>
        <p class="font-handwriting text-2xl text-primary">
          我们已经在一起 {{ daysCount }} 天
        </p>
      </div>

      <!-- Total Days Counter -->
      <div class="flex justify-center mb-12">
        <div class="bg-card rounded-2xl p-8 shadow-lg border border-primary/30 text-center">
          <p class="font-handwriting text-xl text-text-secondary mb-2">在一起的每一天</p>
          <p class="font-display text-6xl md:text-8xl text-primary">{{ daysCount }}</p>
          <p class="font-handwriting text-xl text-text-secondary mt-2">天</p>
        </div>
      </div>

      <!-- Anniversary Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnniversaryCard
          v-for="(item, index) in anniversaries"
          :key="index"
          v-bind="item"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDaysCount } from '@/composables/useDaysCount';
import AnniversaryCard from '@/components/AnniversaryCard.vue';

const { daysCount } = useDaysCount();

// 模拟数据，实际从 Notion 获取
const anniversaries = ref([
  { title: '100天', date: '2024-12-27', icon: '🎉', description: '第一个100天' },
  { title: '200天', date: '2025-04-06', icon: '💕', description: '200天啦' },
  { title: '1周年', date: '2025-09-19', icon: '🎂', description: '在一起一周年' },
  { title: '300天', date: '2025-07-15', icon: '❤️', description: '300天纪念' },
  { title: '2周年', date: '2026-09-19', icon: '💍', description: '两周年啦' },
]);
</script>
```

---

### Task 10: 开发相册墙视图

**Files:**
- Modify: `src/views/GalleryView.vue`
- Create: `src/components/PhotoCard.vue`
- Create: `src/components/Lightbox.vue`

**Step 1: 创建 PhotoCard.vue**

```vue
<template>
  <div 
    class="photo-card break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
    @click="$emit('click', photo)"
  >
    <img 
      :src="photo.url" 
      :alt="photo.title"
      class="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
      loading="lazy"
    />
    <div class="p-3 bg-card">
      <h3 class="font-display text-sm text-text-main">{{ photo.title }}</h3>
      <p class="font-handwriting text-xs text-text-secondary">{{ photo.date }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  photo: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);
</script>
```

**Step 2: 创建 Lightbox.vue**

```vue
<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        @click.self="close"
      >
        <!-- Close button -->
        <button 
          class="absolute top-4 right-4 text-white/70 hover:text-white"
          @click="close"
        >
          <X class="w-8 h-8" />
        </button>

        <!-- Image -->
        <img 
          :src="imageUrl" 
          :alt="imageAlt"
          class="max-w-[90vw] max-h-[90vh] object-contain"
        />

        <!-- Navigation -->
        <button 
          v-if="hasPrev"
          class="absolute left-4 text-white/70 hover:text-white"
          @click="$emit('prev')"
        >
          <ChevronLeft class="w-10 h-10" />
        </button>
        <button 
          v-if="hasNext"
          class="absolute right-4 text-white/70 hover:text-white"
          @click="$emit('next')"
        >
          <ChevronRight class="w-10 h-10" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  imageUrl: String,
  imageAlt: String,
  hasPrev: Boolean,
  hasNext: Boolean,
});

const emit = defineEmits(['close', 'prev', 'next']);

const close = () => emit('close');
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
```

**Step 3: 实现 GalleryView.vue**

```vue
<template>
  <div class="pt-24 pb-12 px-4 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl md:text-5xl text-text-main mb-4">相册</h1>
        <p class="font-handwriting text-2xl text-text-secondary">我们的点点滴滴</p>
      </div>

      <!-- Masonry Grid -->
      <div class="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        <PhotoCard
          v-for="(photo, index) in photos"
          :key="index"
          :photo="photo"
          @click="openLightbox(index)"
        />
      </div>

      <!-- Lightbox -->
      <Lightbox
        :is-open="lightboxOpen"
        :image-url="currentPhoto?.url"
        :image-alt="currentPhoto?.title"
        :has-prev="currentIndex > 0"
        :has-next="currentIndex < photos.length - 1"
        @close="lightboxOpen = false"
        @prev="prevPhoto"
        @next="nextPhoto"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PhotoCard from '@/components/PhotoCard.vue';
import Lightbox from '@/components/Lightbox.vue';

// 模拟数据
const photos = ref([
  { title: '第一次约会', date: '2024-09-19', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600' },
  { title: '海边日落', date: '2024-10-05', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  { title: '美食时光', date: '2024-10-20', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { title: '圣诞快乐', date: '2024-12-25', url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600' },
  { title: '日常甜蜜', date: '2025-01-01', url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600' },
  { title: '春游', date: '2025-03-15', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600' },
]);

const lightboxOpen = ref(false);
const currentIndex = ref(0);

const currentPhoto = computed(() => photos.value[currentIndex.value]);

const openLightbox = (index) => {
  currentIndex.value = index;
  lightboxOpen.value = true;
};

const prevPhoto = () => {
  if (currentIndex.value > 0) currentIndex.value--;
};

const nextPhoto = () => {
  if (currentIndex.value < photos.value.length - 1) currentIndex.value++;
};
</script>
```

---

### Task 11: 开发时光轴视图

**Files:**
- Modify: `src/views/TimelineView.vue`
- Create: `src/components/TimelineItem.vue`

**Step 1: 创建 TimelineItem.vue**

```vue
<template>
  <div 
    class="timeline-item flex gap-4 md:gap-8"
    :class="isLeft ? 'md:flex-row' : 'md:flex-row-reverse'"
  >
    <!-- Date Badge -->
    <div class="flex-shrink-0 w-24 text-right hidden md:block">
      <span class="font-handwriting text-xl text-primary">{{ item.date }}</span>
    </div>

    <!-- Connector -->
    <div class="relative flex flex-col items-center">
      <div class="w-4 h-4 rounded-full bg-primary border-4 border-background z-10"></div>
      <div class="w-0.5 h-full bg-border absolute top-4"></div>
    </div>

    <!-- Content Card -->
    <div class="flex-grow pb-8 md:w-5/12">
      <div 
        class="bg-card rounded-xl p-5 shadow-md border border-border/30 card-hover"
        :class="{ 'md:text-right': !isLeft }"
      >
        <span class="inline-block md:hidden font-handwriting text-sm text-primary mb-2">
          {{ item.date }}
        </span>
        <div class="text-2xl mb-2">{{ item.icon }}</div>
        <h3 class="font-display text-lg text-text-main mb-1">{{ item.title }}</h3>
        <p class="text-text-secondary text-sm">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  isLeft: {
    type: Boolean,
    default: true,
  },
});
</script>
```

**Step 2: 实现 TimelineView.vue**

```vue
<template>
  <div class="pt-24 pb-12 px-4 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl md:text-5xl text-text-main mb-4">时光轴</h1>
        <p class="font-handwriting text-2xl text-text-secondary">我们的点点滴滴</p>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <TimelineItem
          v-for="(item, index) in timeline"
          :key="index"
          :item="item"
          :is-left="index % 2 === 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TimelineItem from '@/components/TimelineItem.vue';

// 模拟数据
const timeline = ref([
  { 
    date: '2024.09.19', 
    title: '在一起的第一天', 
    description: '我们正式在一起了！',
    icon: '💕'
  },
  { 
    date: '2024.10.01', 
    title: '第一次旅行', 
    description: '去了海边，看最美的日落',
    icon: '🌅'
  },
  { 
    date: '2024.12.25', 
    title: '第一个圣诞节', 
    description: '一起度过的温馨节日',
    icon: '🎄'
  },
  { 
    date: '2024.12.27', 
    title: '100天纪念', 
    description: '在一起100天啦！',
    icon: '🎉'
  },
  { 
    date: '2025.01.01', 
    title: '一起跨年', 
    description: '迎接新的一年',
    icon: '🎆'
  },
]);
</script>
```

---

### Task 12: 开发留言板视图

**Files:**
- Modify: `src/views/GuestbookView.vue`
- Create: `src/components/MessageCard.vue`

**Step 1: 创建 MessageCard.vue**

```vue
<template>
  <div class="bg-card rounded-xl p-5 shadow-md border border-border/30 card-hover">
    <div class="flex items-center gap-3 mb-3">
      <span 
        class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
        :class="senderClass"
      >
        {{ senderIcon }}
      </span>
      <div>
        <span class="font-display text-sm text-text-main">{{ sender }}</span>
        <span class="text-text-secondary/50 text-xs ml-2">{{ timeAgo }}</span>
      </div>
      <span class="ml-auto text-lg">{{ moodIcon }}</span>
    </div>
    <p class="text-text-main">{{ content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: String,
  sender: String,
  mood: String,
  createdAt: String,
});

const senderIcon = computed(() => props.sender === 'zhuzhu' ? '🐷' : '🐰');

const senderClass = computed(() => 
  props.sender === 'zhuzhu' ? 'bg-primary/20 text-primary' : 'bg-pink-200 text-pink-600'
);

const moodIcon = computed(() => {
  const moods = {
    '开心': '😊',
    '感动': '🥰',
    '想念': '😢',
    '甜蜜': '💕',
    '生气': '😠',
  };
  return moods[props.mood] || '💖';
});

const timeAgo = computed(() => {
  // 简单的时间显示
  return props.createdAt;
});
</script>
```

**Step 2: 实现 GuestbookView.vue**

```vue
<template>
  <div class="pt-24 pb-12 px-4 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl md:text-5xl text-text-main mb-4">留言板</h1>
        <p class="font-handwriting text-2xl text-text-secondary">留下想说的话</p>
      </div>

      <!-- Write Message Form -->
      <div class="bg-card rounded-xl p-6 shadow-md border border-border/30 mb-8">
        <textarea
          v-model="newMessage"
          placeholder="写下想说的话..."
          class="w-full bg-background rounded-lg p-4 text-text-main placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          rows="3"
        ></textarea>
        
        <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div class="flex gap-2">
            <button
              v-for="mood in moods"
              :key="mood"
              class="px-3 py-1 rounded-full text-sm transition-all"
              :class="selectedMood === mood ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-primary/10'"
              @click="selectedMood = mood"
            >
              {{ mood }}
            </button>
          </div>
          
          <button
            class="px-6 py-2 bg-primary text-white rounded-lg font-body hover:bg-primary/90 transition-colors disabled:opacity-50"
            :disabled="!newMessage.trim()"
            @click="submitMessage"
          >
            发送 💌
          </button>
        </div>
      </div>

      <!-- Messages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MessageCard
          v, index) in messages"
          :key="index"
-for="(msg          v-bind="msg"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MessageCard from '@/components/MessageCard.vue';

const moods = ['开心', '感动', '想念', '甜蜜'];
const newMessage = ref('');
const selectedMood = ref('开心');

const messages = ref([
  { content: '今天是我们在一起的第100天，好开心！', sender: 'zhuzhu', mood: '开心', createdAt: '2024-12-27' },
  { content: '想念我们一起看日落的那天', sender: '对方', mood: '想念', createdAt: '2024-12-26' },
  { content: '圣诞快乐！爱你哟～', sender: 'zhuzhu', mood: '甜蜜', createdAt: '2024-12-25' },
  { content: '今天一起吃了超好吃的火锅！', sender: '对方', mood: '开心', createdAt: '2024-12-20' },
]);

const submitMessage = () => {
  if (!newMessage.value.trim()) return;
  
  messages.value.unshift({
    content: newMessage.value,
    sender: 'zhuzhu',
    mood: selectedMood.value,
    createdAt: new Date().toLocaleDateString('zh-CN'),
  });
  
  newMessage.value = '';
};
</script>
```

---

## 阶段四：Notion API 集成

### Task 13: 创建 Notion API 封装

**Files:**
- Create: `src/lib/notion.js`
- Create: `src/composables/useNotion.js`

**Step 1: 创建 src/lib/notion.js**

```javascript
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: import.meta.env.VITE_NOTION_TOKEN,
});

const databaseIds = {
  anniversary: import.meta.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: import.meta.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: import.meta.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: import.meta.env.VITE_NOTION_DATABASE_MESSAGES,
};

// 通用查询函数
async function queryDatabase(databaseId, options = {}) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...options,
    });
    return response.results;
  } catch (error) {
    console.error('Notion query error:', error);
    return [];
  }
}

// 格式化日期
function formatDate(dateObj) {
  if (!dateObj) return '';
  const date = new Date(dateObj.start || dateObj);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 解析页面属性
function parseProperties(page) {
  const props = page.properties;
  const result = { id: page.id };
  
  for (const [key, value] of Object.entries(props)) {
    switch (value.type) {
      case 'title':
        result[key] = value.title[0]?.plain_text || '';
        break;
      case 'rich_text':
        result[key] = value.rich_text[0]?.plain_text || '';
        break;
      case 'date':
        result[key] = formatDate(value.date);
        break;
      case 'select':
        result[key] = value.select?.name || '';
        break;
      case 'multi_select':
        result[key] = value.multi_select.map(s => s.name);
        break;
      case 'files':
        result[key] = value.files[0]?.file?.url || value.files[0]?.external?.url || '';
        break;
      case 'created_time':
        result[key] = formatDate({ start: value.created_time });
        break;
    }
  }
  
  return result;
}

// 获取纪念日
export async function getAnniversaries() {
  const results = await queryDatabase(databaseIds.anniversary, {
    sorts: [{ property: '日期', direction: 'ascending' }],
  });
  return results.map(parseProperties);
}

// 获取相册照片
export async function getPhotos() {
  const results = await queryDatabase(databaseIds.photos, {
    sorts: [{ property: '日期', direction: 'descending' }],
  });
  return results.map(parseProperties);
}

// 获取时光轴
export async function getTimeline() {
  const results = await queryDatabase(databaseIds.timeline, {
    sorts: [{ property: '日期', direction: 'ascending' }],
  });
  return results.map(parseProperties);
}

// 获取留言
export async function getMessages() {
  const results = await queryDatabase(databaseIds.messages, {
    sorts: [{ property: '时间', direction: 'descending' }],
  });
  return results.map(parseProperties);
}

// 添加留言
export async function addMessage(content, sender, mood) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseIds.messages },
      properties: {
        内容: {
          title: [{ text: { content } }],
        },
        发送者: {
          select: { name: sender },
        },
        心情: {
          select: { name: mood },
        },
      },
    });
    return true;
  } catch (error) {
    console.error('Add message error:', error);
    return false;
  }
}

export default notion;
```

**Step 2: 创建 useNotion.js 组合式函数**

```javascript
import { ref } from 'vue';
import { 
  getAnniversaries, 
  getPhotos, 
  getTimeline, 
  getMessages,
  addMessage 
} from '@/lib/notion';

export function useNotion() {
  const loading = ref(false);
  const error = ref(null);

  const fetchAnniversaries = async () => {
    loading.value = true;
    error.value = null;
    try {
      return await getAnniversaries();
    } catch (e) {
      error.value = e.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPhotos = async () => {
    loading.value = true;
    error.value = null;
    try {
      return await getPhotos();
    } catch (e) {
      error.value = e.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchTimeline = async () => {
    loading.value = true;
    error.value = null;
    try {
      return await getTimeline();
    } catch (e) {
      error.value = e.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchMessages = async () => {
    loading.value = true;
    error.value = null;
    try {
      return await getMessages();
    } catch (e) {
      error.value = e.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const submitMessage = async (content, sender, mood) => {
    loading.value = true;
    error.value = null;
    try {
      return await addMessage(content, sender, mood);
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchAnniversaries,
    fetchPhotos,
    fetchTimeline,
    fetchMessages,
    submitMessage,
  };
}
```

---

## 阶段五：动画和交互增强

### Task 14: 添加滚动动画

**Files:**
- Create: `src/composables/useScrollAnimation.js`

**Step 1: 创建 useScrollAnimation.js**

```javascript
import { onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation() {
  const initFadeInUp = (selector = '.fade-in-up') => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { 
          opacity: 0, 
          y: 30 
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  };

  const initStagger = (selector = '.stagger-item', stagger = 0.1) => {
    const elements = document.querySelectorAll(selector);
    
    gsap.fromTo(
      elements,
      { 
        opacity: 0, 
        y: 20 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elements[0],
          start: 'top 85%',
        },
      }
    );
  };

  const initTimelineDraw = (selector = '.timeline-line') => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { height: 0 },
        {
          height: '100%',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 1,
          },
        }
      );
    });
  };

  const killScrollTriggers = () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };

  onUnmounted(() => {
    killScrollTriggers();
  });

  return {
    initFadeInUp,
    initStagger,
    initTimelineDraw,
  };
}
```

---

### Task 15: 添加数字滚动动画组件

**Files:**
- Modify: `src/views/HomeView.vue` (更新 digits 逻辑)
- Create: `src/components/CountUp.vue`

**Step 1: 创建 CountUp.vue**

```vue
<template>
  <span ref="numberRef">{{ displayNumber }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  target: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 2,
  },
});

const displayNumber = ref(0);
const numberRef = ref(null);

onMounted(() => {
  animateNumber();
});

watch(() => props.target, () => {
  animateNumber();
});

const animateNumber = () => {
  gsap.to(displayNumber, {
    value: props.target,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: () => {
      displayNumber.value = Math.round(displayNumber.value);
    },
  });
};
</script>
```

---

## 阶段六：响应式优化

### Task 16: 添加移动端优化

**Files:**
- Modify: `src/components/Navigation.vue` (确保移动端导航正确)
- Modify: `src/styles/index.css` (添加移动端优化样式)

**Step 1: 添加移动端优化样式到 index.css**

```css
@layer utilities {
  /* 移动端安全区域 */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* 触摸友好 */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 移动端优化文字 */
  @media (max-width: 640px) {
    .font-display {
      font-size: 1.5rem;
    }
  }
}
```

---

## 阶段七：部署配置

### Task 17: 配置 Netlify 部署

**Files:**
- Create: `netlify.toml`

**Step 1: 创建 netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[template]
  engine = "vite"
```

**Step 2: 更新 package.json 添加预览脚本**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "netlify deploy --prod"
  }
}
```

---

## 阶段八：测试和验证

### Task 18: 运行开发服务器验证

**Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器在 http://localhost:3000 启动

**Step 2: 验证各页面可访问**

打开浏览器访问:
- http://localhost:3000 - 首页
- http://localhost:3000/anniversary - 纪念日
- http://localhost:3000/gallery - 相册
- http://localhost:3000/timeline - 时光轴
- http://localhost:3000/guestbook - 留言板

**Step 3: 运行构建测试**

Run: `npm run build`
Expected: 构建成功，生成 dist 目录

---

## 执行顺序总结

```
阶段一：项目初始化
├── Task 1: 创建项目基础结构
├── Task 2: 安装项目依赖
└── Task 3: 创建项目目录结构

阶段二：核心配置
├── Task 4: 创建全局样式和入口文件
└── Task 5: 创建路由配置

阶段三：核心组件开发
├── Task 6: 开发导航栏组件
├── Task 7: 开发天数计算组合式函数
├── Task 8: 开发首页视图
├── Task 9: 开发纪念日视图
├── Task 10: 开发相册墙视图
├── Task 11: 开发时光轴视图
└── Task 12: 开发留言板视图

阶段四：Notion API 集成
└── Task 13: 创建 Notion API 封装

阶段五：动画和交互增强
├── Task 14: 添加滚动动画
└── Task 15: 添加数字滚动动画组件

阶段六：响应式优化
└── Task 16: 添加移动端优化

阶段七：部署配置
└── Task 17: 配置 Netlify 部署

阶段八：测试和验证
└── Task 18: 运行开发服务器验证
```

---

## 注意事项

1. **环境变量**: 开发前需要在 `.env.local` 中配置 Notion API Token 和数据库 ID
2. **Notion 数据库**: 确保已在 Notion 中创建对应的数据库并授权 Integration 访问
3. **图片加载**: 生产环境中图片通过 Notion API 获取，本地开发可使用模拟数据
4. **移动端测试**: 建议使用 Chrome DevTools 移动端模拟进行测试
5. **动画性能**: 移动端动画可能会影响性能，可考虑使用 `prefers-reduced-motion` 媒体查询降级

---

**实现计划完成！** 🎉

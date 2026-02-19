# 相册时间线视图实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为相册页面新增时间线视图，支持按日/月/年聚合展示照片，与现有瀑布流视图可切换。

**Architecture:** 创建工具栏组件控制视图切换，创建时间线视图组件展示聚合后的照片，使用 composable 管理视图状态并持久化到 localStorage。

**Tech Stack:** Vue 3 Composition API, Tailwind CSS, localStorage

---

## Task 1: 创建视图状态管理 Composable

**Files:**
- Create: `src/composables/useGalleryView.js`

**Step 1: 创建 composable 文件**

```javascript
import { ref, watch } from 'vue';

const VIEW_MODE_KEY = 'gallery-view-mode';
const GROUP_BY_KEY = 'gallery-group-by';

// 从 localStorage 读取保存的偏好
function getStoredPreference(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useGalleryView() {
  // 视图模式: 'masonry' | 'timeline'
  const viewMode = ref(getStoredPreference(VIEW_MODE_KEY, 'masonry'));
  
  // 聚合级别: 'day' | 'month' | 'year'
  const groupBy = ref(getStoredPreference(GROUP_BY_KEY, 'day'));
  
  // 持久化到 localStorage
  watch(viewMode, (newVal) => {
    localStorage.setItem(VIEW_MODE_KEY, JSON.stringify(newVal));
  });
  
  watch(groupBy, (newVal) => {
    localStorage.setItem(GROUP_BY_KEY, JSON.stringify(newVal));
  });
  
  // 切换视图模式
  function setViewMode(mode) {
    viewMode.value = mode;
  }
  
  // 切换聚合级别
  function setGroupBy(level) {
    groupBy.value = level;
  }
  
  return {
    viewMode,
    groupBy,
    setViewMode,
    setGroupBy,
  };
}
```

**Step 2: 验证文件创建成功**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add src/composables/useGalleryView.js
git commit -m "feat: add useGalleryView composable for view state management"
```

---

## Task 2: 创建工具栏组件

**Files:**
- Create: `src/components/GalleryToolbar.vue`

**Step 1: 创建工具栏组件**

```vue
<template>
  <div class="flex items-center justify-between mb-6">
    <!-- 左侧：视图切换 -->
    <div class="flex items-center gap-2">
      <button
        @click="$emit('update:viewMode', 'masonry')"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="viewMode === 'masonry' 
          ? 'bg-primary text-white' 
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        <Grid3X3 class="w-4 h-4 inline-block mr-1" />
        瀑布流
      </button>
      <button
        @click="$emit('update:viewMode', 'timeline')"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="viewMode === 'timeline' 
          ? 'bg-primary text-white' 
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        <List class="w-4 h-4 inline-block mr-1" />
        时间线
      </button>
    </div>
    
    <!-- 右侧：聚合级别切换（仅时间线视图显示） -->
    <div v-if="viewMode === 'timeline'" class="flex items-center gap-2">
      <button
        v-for="level in groupLevels"
        :key="level.value"
        @click="$emit('update:groupBy', level.value)"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="groupBy === level.value 
          ? 'bg-primary text-white' 
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        {{ level.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { Grid3X3, List } from 'lucide-vue-next';

defineProps({
  viewMode: { type: String, default: 'masonry' },
  groupBy: { type: String, default: 'day' },
});

defineEmits(['update:viewMode', 'update:groupBy']);

const groupLevels = [
  { value: 'day', label: '日' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];
</script>
```

**Step 2: 验证组件创建成功**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add src/components/GalleryToolbar.vue
git commit -m "feat: add GalleryToolbar component for view switching"
```

---

## Task 3: 创建时间线视图组件

**Files:**
- Create: `src/components/TimelineGallery.vue`

**Step 1: 创建时间线视图组件**

```vue
<template>
  <div class="timeline-gallery space-y-6">
    <div
      v-for="[dateKey, datePhotos] in groupedPhotos"
      :key="dateKey"
      class="timeline-group"
    >
      <!-- 日期标签 -->
      <div class="flex items-center gap-4 mb-3">
        <div class="text-text-main font-display text-lg min-w-[120px]">
          {{ dateKey }}
        </div>
        <div class="flex-1 h-px bg-border/50 dark:bg-border-dark/50"></div>
        <div class="text-text-secondary text-sm">
          {{ datePhotos.length }} 张
        </div>
      </div>
      
      <!-- 照片网格 -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 pl-4">
        <div
          v-for="photo in datePhotos"
          :key="photo.id"
          class="aspect-square rounded-lg overflow-hidden cursor-pointer group"
          @click="$emit('select', photo)"
        >
          <img
            :src="photo.thumbnailUrl || photo.url"
            :alt="photo.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  photos: { type: Array, default: () => [] },
  groupBy: { type: String, default: 'day' },
});

defineEmits(['select']);

// 按日期分组照片
const groupedPhotos = computed(() => {
  const groups = {};
  
  props.photos.forEach(photo => {
    if (!photo.date) return;
    
    const date = new Date(photo.date);
    let key;
    
    switch (props.groupBy) {
      case 'day':
        key = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        break;
      case 'month':
        key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        break;
      case 'year':
        key = `${date.getFullYear()}年`;
        break;
      default:
        key = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(photo);
  });
  
  // 按日期倒序排列
  return Object.entries(groups).sort((a, b) => {
    const dateA = parseDateKey(a[0]);
    const dateB = parseDateKey(b[0]);
    return dateB - dateA;
  });
});

// 解析日期键用于排序
function parseDateKey(key) {
  const match = key.match(/(\d+)年(?:(\d+)月)?(?:(\d+)日)?/);
  if (!match) return 0;
  
  const year = parseInt(match[1]) || 0;
  const month = parseInt(match[2]) || 1;
  const day = parseInt(match[3]) || 1;
  
  return new Date(year, month - 1, day).getTime();
}
</script>
```

**Step 2: 验证组件创建成功**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add src/components/TimelineGallery.vue
git commit -m "feat: add TimelineGallery component with date grouping"
```

---

## Task 4: 修改 GalleryView 集成新组件

**Files:**
- Modify: `src/views/GalleryView.vue`

**Step 1: 更新 GalleryView.vue 模板部分**

找到 `<div class="max-w-6xl mx-auto">` 后面，在 Header 之后添加工具栏：

```vue
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          相册墙
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          记录我们的每一个美好瞬间
        </p>
      </div>
      
      <!-- Toolbar -->
      <GalleryToolbar
        v-model:viewMode="viewMode"
        v-model:groupBy="groupBy"
      />
```

**Step 2: 更新 script 部分，添加新导入和状态**

在 `<script setup>` 中修改：

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { Image as ImageIcon, MapPin } from 'lucide-vue-next';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { useGalleryView } from '@/composables/useGalleryView.js';
import PhotoCard from '@/components/PhotoCard.vue';
import GalleryToolbar from '@/components/GalleryToolbar.vue';
import TimelineGallery from '@/components/TimelineGallery.vue';

const { formatDate } = useDaysCount();
const { viewMode, groupBy } = useGalleryView();

// ... 其余代码保持不变
```

**Step 3: 更新模板中的照片展示部分**

将原来的瀑布流部分用条件渲染包裹：

```vue
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- ... skeleton 保持不变 -->
      </div>
      
      <!-- Empty State -->
      <div v-else-if="photos.length === 0" class="text-center text-text-secondary">
        暂无照片
      </div>
      
      <!-- Masonry Grid -->
      <div v-else-if="viewMode === 'masonry'" class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        <!-- ... 原有瀑布流代码保持不变 -->
      </div>
      
      <!-- Timeline View -->
      <TimelineGallery
        v-else
        :photos="photos"
        :group-by="groupBy"
        @select="openLightbox"
      />
```

**Step 4: 验证修改成功**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 5: Commit**

```bash
git add src/views/GalleryView.vue
git commit -m "feat: integrate GalleryToolbar and TimelineGallery into GalleryView"
```

---

## Task 5: 测试功能

**Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: Server starts on http://localhost:3001

**Step 2: 手动测试**

1. 访问相册页面
2. 验证默认显示瀑布流视图
3. 点击"时间线"按钮，验证切换成功
4. 在时间线视图下，切换"日/月/年"聚合级别
5. 刷新页面，验证偏好设置持久化
6. 点击照片，验证 Lightbox 正常打开
7. 切换回瀑布流视图，验证正常工作

**Step 3: 测试移动端响应式**

1. 调整浏览器窗口大小
2. 验证工具栏在移动端正常显示
3. 验证时间线视图照片网格响应式调整

---

## Task 6: 最终提交

**Step 1: 确认所有改动**

Run: `git status`
Expected: 所有文件已提交

**Step 2: 推送到远程**

Run: `git push`

---

## 验收检查清单

- [ ] 瀑布流视图正常显示
- [ ] 时间线视图正常显示
- [ ] 视图切换按钮工作正常
- [ ] 日/月/年聚合级别切换工作正常
- [ ] 用户偏好持久化（刷新后保持）
- [ ] 点击照片打开 Lightbox
- [ ] 移动端响应式布局正常
- [ ] 无控制台错误

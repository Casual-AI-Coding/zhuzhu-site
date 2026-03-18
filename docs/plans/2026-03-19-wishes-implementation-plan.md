# 愿望清单功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现愿望清单功能，支持进行中/已完成 Tab 切换、筛选、年日历视图

**Architecture:** 基于现有 Vue 3 + Vite + TailwindCSS + Notion API 架构，新增 WishesView 页面及配套组件，复用现有 glass-nav 样式和动画模式

**Tech Stack:** Vue 3 Composition API, Tailwind CSS, Notion API, CSS Animations

---

## 文件结构

```
src/
├── views/
│   └── WishesView.vue          # 愿望清单主页面
├── components/
│   ├── WishCard.vue             # 愿望卡片组件
│   ├── WishModal.vue            # 添加/编辑弹窗
│   ├── WishCalendar.vue         # 年日历视图
│   ├── WishFilters.vue          # 筛选栏组件
│   └── WishEmptyState.vue       # 空状态组件
├── composables/
│   └── useWishes.js            # 愿望状态管理
└── lib/
    └── notion.js               # 新增愿望 API
```

---

## Chunk 1: 基础设施 - 环境变量 & Notion API

**Files:**
- Modify: `src/lib/notion.js:44-50` - 添加 WISHES database ID
- Modify: `src/lib/notion.js` - 新增愿望 CRUD API
- Modify: `.env.example` - 添加 WISHES_DATABASE_ID 示例
- Modify: `.env.local` - （用户本地配置，无需提交）

- [ ] **Step 1: 添加 WISHES database ID 配置**

修改 `src/lib/notion.js` 第 44-50 行:
```javascript
const DATABASES = {
  anniversary: import.meta.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: import.meta.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: import.meta.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: import.meta.env.VITE_NOTION_DATABASE_MESSAGES,
  wishes: import.meta.env.VITE_NOTION_DATABASE_WISHES,  // 新增
};
```

- [ ] **Step 2: 新增愿望 API 函数**

在 `src/lib/notion.js` 末尾添加:
```javascript
// 获取愿望列表
export async function fetchWishes() {
  try {
    const response = await notionRequest(`/databases/${DATABASES.wishes}/query`, {
      method: 'POST',
      body: JSON.stringify({
        sorts: [{ property: '优先级', direction: 'ascending' }],
      }),
    });

    return response.results.map(page => ({
      id: page.id,
      title: page.properties['标题']?.title[0]?.plain_text || '',
      description: page.properties['描述']?.rich_text[0]?.plain_text || '',
      category: page.properties['分类']?.select?.name || '',
      targetDate: page.properties['目标日期']?.date?.start || '',
      priority: page.properties['优先级']?.select?.name || '中',
      status: page.properties['状态']?.select?.name || '进行中',
      completedDate: page.properties['完成日期']?.date?.start || '',
    }));
  } catch {
    return [];
  }
}

// 添加愿望
export async function addWish(title, description, category, targetDate, priority = '中') {
  try {
    const response = await notionRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: DATABASES.wishes },
        properties: {
          '标题': {
            title: [{ text: { content: title } }],
          },
          '描述': {
            rich_text: [{ text: { content: description } }],
          },
          '分类': {
            select: { name: category },
          },
          '优先级': {
            select: { name: priority },
          },
          '状态': {
            select: { name: '进行中' },
          },
          ...(targetDate && {
            '目标日期': {
              date: { start: targetDate + '-01' },
            },
          }),
        },
      }),
    });

    return {
      id: response.id,
      title,
      description,
      category,
      targetDate,
      priority,
      status: '进行中',
      completedDate: '',
    };
  } catch {
    throw new Error('Failed to add wish');
  }
}

// 更新愿望状态为已完成
export async function completeWish(wishId, completedDate) {
  try {
    await notionRequest(`/pages/${wishId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          '状态': {
            select: { name: '已完成' },
          },
          '完成日期': {
            date: { start: completedDate },
          },
        },
      }),
    });
  } catch {
    throw new Error('Failed to complete wish');
  }
}

// 更新愿望
export async function updateWish(wishId, { title, description, category, targetDate, priority }) {
  try {
    await notionRequest(`/pages/${wishId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          '标题': {
            title: [{ text: { content: title } }],
          },
          '描述': {
            rich_text: [{ text: { content: description } }],
          },
          '分类': {
            select: { name: category },
          },
          '优先级': {
            select: { name: priority },
          },
          ...(targetDate && {
            '目标日期': {
              date: { start: targetDate + '-01' },
            },
          }),
        },
      }),
    });
  } catch {
    throw new Error('Failed to update wish');
  }
}

// 删除愿望
export async function deleteWish(wishId) {
  try {
    await notionRequest(`/pages/${wishId}`, {
      method: 'DELETE',
    });
  } catch {
    throw new Error('Failed to delete wish');
  }
}
```

- [ ] **Step 3: 更新 .env.example**

在 `.env.example` 添加:
```
VITE_NOTION_DATABASE_WISHES=your_wishes_database_id
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/notion.js .env.example
git commit -m "feat(wishes): 添加愿望清单 Notion API 支持"
```

---

## Chunk 2: 路由 & 导航配置

**Files:**
- Modify: `src/router/index.js:1-39` - 添加 /wishes 路由
- Modify: `src/components/BottomNav.vue:24-30` - 底部导航添加愿望入口
- Modify: `src/components/Navigation.vue` - 顶部导航添加愿望入口（如有）

- [ ] **Step 1: 添加路由**

修改 `src/router/index.js`:
```javascript
const routes = [
  // ... 现有路由 ...
  {
    path: '/wishes',
    name: 'wishes',
    component: () => import('@/views/WishesView.vue'),
  },
];
```

- [ ] **Step 2: 更新底部导航**

修改 `src/components/BottomNav.vue` 第 24-30 行:
```javascript
const navItems = [
  { name: 'home', path: '/', label: '首页', icon: Home },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: Calendar },
  { name: 'gallery', path: '/gallery', label: '相册', icon: Image },
  { name: 'wishes', path: '/wishes', label: '愿望', icon: Sparkles },  // 新增
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: Clock },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: MessageCircle },
];
```

导入 Sparkles 图标:
```javascript
import { Home, Calendar, Image, Clock, MessageCircle, Sparkles } from 'lucide-vue-next';
```

- [ ] **Step 3: 检查顶部导航**

查看 `src/components/Navigation.vue`，如有导航栏同样添加愿望入口

- [ ] **Step 4: 提交**

```bash
git add src/router/index.js src/components/BottomNav.vue
git commit -m "feat(wishes): 添加路由和底部导航入口"
```

---

## Chunk 3: 核心 Composable - useWishes.js

**Files:**
- Create: `src/composables/useWishes.js`
- Test: （无测试文件，跳过）

- [ ] **Step 1: 创建 useWishes.js**

```javascript
import { ref, computed, onMounted } from 'vue';
import { fetchWishes, addWish, completeWish, updateWish, deleteWish } from '@/lib/notion.js';

const WISH_CATEGORIES = ['旅行', '美食', '体验', '家居', '其他'];
const PRIORITIES = ['高', '中', '低'];

export function useWishes() {
  const wishes = ref([]);
  const loading = ref(true);
  const activeTab = ref('active'); // 'active' | 'completed'
  const viewMode = ref('list'); // 'list' | 'calendar'
  const filters = ref({
    category: '',
    priority: '',
  });

  // 计算属性：进行中的愿望
  const activeWishes = computed(() => {
    return wishes.value
      .filter(w => w.status === '进行中')
      .filter(w => {
        if (filters.value.category && w.category !== filters.value.category) return false;
        if (filters.value.priority && w.priority !== filters.value.priority) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = { '高': 0, '中': 1, '低': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  });

  // 计算属性：已完成的愿望
  const completedWishes = computed(() => {
    return wishes.value
      .filter(w => w.status === '已完成')
      .filter(w => {
        if (filters.value.category && w.category !== w.category) return false;
        if (filters.value.priority && w.priority !== filters.value.priority) return false;
        return true;
      })
      .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  });

  // 按年月分组的已完成愿望（用于日历视图）
  const completedWishesByMonth = computed(() => {
    const grouped = {};
    completedWishes.value.forEach(wish => {
      if (wish.completedDate) {
        const [year, month] = wish.completedDate.split('-');
        const key = `${year}-${month}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(wish);
      }
    });
    return grouped;
  });

  // 加载愿望
  async function loadWishes() {
    loading.value = true;
    try {
      wishes.value = await fetchWishes();
    } catch {
      wishes.value = [];
    } finally {
      loading.value = false;
    }
  }

  // 添加愿望
  async function createWish({ title, description, category, targetDate, priority }) {
    const newWish = await addWish(title, description, category, targetDate, priority);
    wishes.value.push(newWish);
    return newWish;
  }

  // 标记愿望完成
  async function markComplete(wishId, completedDate) {
    await completeWish(wishId, completedDate);
    const wish = wishes.value.find(w => w.id === wishId);
    if (wish) {
      wish.status = '已完成';
      wish.completedDate = completedDate;
    }
  }

  // 更新愿望
  async function editWish(wishId, data) {
    await updateWish(wishId, data);
    const index = wishes.value.findIndex(w => w.id === wishId);
    if (index !== -1) {
      wishes.value[index] = { ...wishes.value[index], ...data };
    }
  }

  // 删除愿望
  async function removeWish(wishId) {
    await deleteWish(wishId);
    wishes.value = wishes.value.filter(w => w.id !== wishId);
  }

  // 清除筛选
  function clearFilters() {
    filters.value = { category: '', priority: '' };
  }

  onMounted(() => {
    loadWishes();
  });

  return {
    wishes,
    loading,
    activeTab,
    viewMode,
    filters,
    activeWishes,
    completedWishes,
    completedWishesByMonth,
    categories: WISH_CATEGORIES,
    priorities: PRIORITIES,
    loadWishes,
    createWish,
    markComplete,
    editWish,
    removeWish,
    clearFilters,
  };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/composables/useWishes.js
git commit -m "feat(wishes): 创建 useWishes composable"
```

---

## Chunk 4: WishCard 组件

**Files:**
- Create: `src/components/WishCard.vue`

- [ ] **Step 1: 创建 WishCard.vue**

```vue
<template>
  <div 
    class="wish-card glass-nav rounded-2xl p-4 cursor-pointer transition-all duration-300"
    :class="[
      isActive ? 'hover:-translate-y-1 hover:shadow-xl' : '',
      { 'is-completing': isCompleting }
    ]"
    @click="$emit('click', wish)"
  >
    <!-- 优先级色条 -->
    <div 
      class="priority-bar absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
      :class="priorityColorClass"
    ></div>
    
    <div class="pl-3">
      <!-- 标题 -->
      <h3 class="font-display text-lg text-text-main mb-1 line-clamp-2">
        {{ wish.title }}
      </h3>
      
      <!-- 分类标签 -->
      <div class="flex items-center gap-2 mb-2">
        <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
          {{ wish.category }}
        </span>
        <span v-if="wish.targetDate" class="text-text-secondary text-xs flex items-center gap-1">
          📅 {{ formatTargetDate(wish.targetDate) }}
        </span>
      </div>
      
      <!-- 描述 -->
      <p v-if="wish.description" class="text-text-secondary text-sm line-clamp-2 mb-3">
        {{ wish.description }}
      </p>
      
      <!-- 完成日期（已完成卡片） -->
      <p v-if="wish.completedDate" class="text-primary text-sm font-medium">
        ✨ {{ formatCompletedDate(wish.completedDate) }}
      </p>
    </div>
    
    <!-- 成真按钮（进行中） -->
    <button
      v-if="isActive && showCompleteBtn"
      @click.stop="handleComplete"
      class="absolute bottom-3 right-3 px-3 py-1 bg-gradient-to-r from-primary to-pink-400 text-white text-sm rounded-full hover:opacity-90 active:scale-95 transition-all"
    >
      ✨ 成真了！
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  wish: { type: Object, required: true },
  isActive: { type: Boolean, default: true },
  showCompleteBtn: { type: Boolean, default: true },
});

const emit = defineEmits(['click', 'complete']);

const isCompleting = ref(false);

const priorityColorClass = computed(() => ({
  'bg-red-400': props.wish.priority === '高',
  'bg-orange-400': props.wish.priority === '中',
  'bg-green-400': props.wish.priority === '低',
}));

function formatTargetDate(date) {
  const [year, month] = date.split('-');
  return `${year}年${parseInt(month)}月`;
}

function formatCompletedDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function handleComplete() {
  isCompleting.value = true;
  // 动画结束后触发完成
  setTimeout(() => {
    emit('complete', props.wish.id);
  }, 600);
}
</script>

<style scoped>
.wish-card {
  position: relative;
  overflow: hidden;
}

.wish-card.is-completing {
  animation: completeWish 0.6s ease-out forwards;
}

@keyframes completeWish {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.8); opacity: 0; }
}

.priority-bar {
  transition: width 0.3s ease;
}

.wish-card:hover .priority-bar {
  width: 4px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/WishCard.vue
git commit -m "feat(wishes): 创建 WishCard 组件"
```

---

## Chunk 5: WishFilters 组件

**Files:**
- Create: `src/components/WishFilters.vue`

- [ ] **Step 1: 创建 WishFilters.vue**

```vue
<template>
  <div class="wish-filters mb-4">
    <!-- 移动端折叠触发器 -->
    <button 
      @click="isExpanded = !isExpanded"
      class="md:hidden w-full flex items-center justify-between px-4 py-2 bg-card rounded-xl mb-2"
    >
      <span class="text-text-secondary text-sm">筛选</span>
      <span class="text-primary">{{ activeFilterCount > 0 ? `已选 ${activeFilterCount}` : '' }}</span>
      <ChevronDown class="w-4 h-4" :class="{ 'rotate-180': isExpanded }" />
    </button>
    
    <!-- 筛选内容 -->
    <div 
      class="flex flex-wrap gap-3 p-4 bg-card rounded-xl"
      :class="{ 'hidden md:flex': !isExpanded }"
    >
      <!-- 分类筛选 -->
      <select
        v-model="localFilters.category"
        @change="emit('update:category', localFilters.category)"
        class="px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg text-sm border border-border focus:outline-none focus:border-primary"
      >
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      
      <!-- 优先级筛选 -->
      <select
        v-model="localFilters.priority"
        @change="emit('update:priority', localFilters.priority)"
        class="px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg text-sm border border-border focus:outline-none focus:border-primary"
      >
        <option value="">全部优先级</option>
        <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
      </select>
      
      <!-- 清除按钮 -->
      <button
        v-if="activeFilterCount > 0"
        @click="clearFilters"
        class="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
      >
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  priorities: { type: Array, default: () => [] },
  category: { type: String, default: '' },
  priority: { type: String, default: '' },
});

const emit = defineEmits(['update:category', 'update:priority', 'clear']);

const isExpanded = ref(false);

const localFilters = ref({
  category: props.category,
  priority: props.priority,
});

const activeFilterCount = computed(() => {
  return (localFilters.value.category ? 1 : 0) + (localFilters.value.priority ? 1 : 0);
});

function clearFilters() {
  localFilters.value = { category: '', priority: '' };
  emit('clear');
}

watch(() => props.category, v => localFilters.value.category = v);
watch(() => props.priority, v => localFilters.value.priority = v);
</script>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/WishFilters.vue
git commit -m "feat(wishes): 创建 WishFilters 筛选组件"
```

---

## Chunk 6: WishModal 组件

**Files:**
- Create: `src/components/WishModal.vue`

- [ ] **Step 1: 创建 WishModal.vue**

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h2 class="font-display text-xl text-text-main">
              {{ isEditing ? '编辑愿望' : '添加愿望' }}
            </h2>
            <button @click="close" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X class="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          
          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
            <!-- 标题 -->
            <div>
              <label class="block text-sm font-medium text-text-main mb-1">
                标题 <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                maxlength="50"
                required
                placeholder="如：一起去日本"
                class="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <!-- 描述 -->
            <div>
              <label class="block text-sm font-medium text-text-main mb-1">描述</label>
              <textarea
                v-model="form.description"
                maxlength="500"
                rows="3"
                placeholder="详细描述一下这个愿望..."
                class="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:border-primary transition-colors resize-none"
              ></textarea>
            </div>
            
            <!-- 分类 -->
            <div>
              <label class="block text-sm font-medium text-text-main mb-1">
                分类 <span class="text-red-400">*</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  type="button"
                  @click="form.category = cat"
                  class="px-3 py-1.5 rounded-full text-sm transition-all"
                  :class="form.category === cat 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-text-secondary hover:bg-primary/10'"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            
            <!-- 目标日期 -->
            <div>
              <label class="block text-sm font-medium text-text-main mb-1">目标日期</label>
              <input
                v-model="form.targetDate"
                type="month"
                class="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <!-- 优先级 -->
            <div>
              <label class="block text-sm font-medium text-text-main mb-1">优先级</label>
              <div class="flex gap-4">
                <label v-for="p in priorities" :key="p" class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="form.priority"
                    type="radio"
                    :value="p"
                    class="accent-primary"
                  />
                  <span :class="{
                    'text-red-400': p === '高',
                    'text-orange-400': p === '中',
                    'text-green-400': p === '低',
                  }">{{ p }}</span>
                </label>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex gap-3 pt-2">
              <button
                v-if="isEditing"
                type="button"
                @click="handleDelete"
                class="px-4 py-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                删除
              </button>
              <div class="flex-1"></div>
              <button
                type="button"
                @click="close"
                class="px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="!isValid"
                class="px-6 py-2 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  wish: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  priorities: { type: Array, default: () => ['高', '中', '低'] },
});

const emit = defineEmits(['close', 'save', 'delete']);

const isEditing = computed(() => !!props.wish);

const form = ref({
  title: '',
  description: '',
  category: '',
  targetDate: '',
  priority: '中',
});

const isValid = computed(() => {
  return form.value.title.trim() && form.value.category;
});

// 填充表单（编辑时）
watch(() => props.show, (val) => {
  if (val) {
    if (props.wish) {
      form.value = {
        title: props.wish.title,
        description: props.wish.description || '',
        category: props.wish.category,
        targetDate: props.wish.targetDate || '',
        priority: props.wish.priority || '中',
      };
    } else {
      form.value = { title: '', description: '', category: '', targetDate: '', priority: '中' };
    }
  }
});

function close() {
  emit('close');
}

function handleSubmit() {
  if (!isValid.value) return;
  emit('save', { ...form.value });
  close();
}

function handleDelete() {
  if (confirm('确定要删除这个愿望吗？')) {
    emit('delete', props.wish.id);
    close();
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(20px);
  opacity: 0;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/WishModal.vue
git commit -m "feat(wishes): 创建 WishModal 添加/编辑组件"
```

---

## Chunk 7: WishCalendar 年日历视图组件

**Files:**
- Create: `src/components/WishCalendar.vue`

- [ ] **Step 1: 创建 WishCalendar.vue**

```vue
<template>
  <div class="wish-calendar">
    <!-- 年份切换器 -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <button
        @click="prevYear"
        class="p-2 hover:bg-primary/10 rounded-full transition-colors"
      >
        <ChevronLeft class="w-5 h-5 text-text-secondary" />
      </button>
      <span class="font-display text-2xl text-text-main">{{ year }}</span>
      <button
        @click="nextYear"
        class="p-2 hover:bg-primary/10 rounded-full transition-colors"
      >
        <ChevronRight class="w-5 h-5 text-text-secondary" />
      </button>
    </div>
    
    <!-- 月份格子 -->
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div
        v-for="(month, index) in 12"
        :key="month"
        class="month-cell aspect-square rounded-xl p-3 transition-all duration-300 cursor-pointer"
        :class="getMonthClass(index + 1)"
        @click="openMonthModal(index + 1)"
      >
        <div class="text-sm text-text-secondary mb-1">{{ month }}月</div>
        <div v-if="getMonthCount(index + 1) > 0" class="flex items-center gap-1">
          <span class="text-lg">{{ getMonthEmoji(index + 1) }}</span>
          <span class="text-xs font-medium text-primary">{{ getMonthCount(index + 1) }}</span>
        </div>
        <div v-else class="text-xs text-text-secondary/50">-</div>
      </div>
    </div>
    
    <!-- 月份详情 Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="selectedMonth"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="selectedMonth = null"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[70vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white/90 backdrop-blur-sm">
              <h3 class="font-display text-lg text-text-main">{{ year }}年{{ selectedMonth }}月完成的愿望</h3>
              <button @click="selectedMonth = null" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X class="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div class="p-4 space-y-3">
              <div
                v-for="wish in getMonthWishes(selectedMonth)"
                :key="wish.id"
                class="glass-nav rounded-xl p-3"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {{ wish.category }}
                  </span>
                </div>
                <h4 class="font-medium text-text-main">{{ wish.title }}</h4>
                <p v-if="wish.description" class="text-text-secondary text-sm mt-1">{{ wish.description }}</p>
              </div>
              <div v-if="getMonthWishes(selectedMonth).length === 0" class="text-center py-8 text-text-secondary">
                暂无完成的愿望
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next';

const props = defineProps({
  wishesByMonth: { type: Object, default: () => ({}) },
  currentYear: { type: Number, default: () => new Date().getFullYear() },
});

const emit = defineEmits();

const year = ref(props.currentYear);
const selectedMonth = ref(null);

function prevYear() {
  year.value--;
}

function nextYear() {
  year.value++;
}

function getMonthKey(month) {
  return `${year.value}-${String(month).padStart(2, '0')}`;
}

function getMonthCount(month) {
  const key = getMonthKey(month);
  return props.wishesByMonth[key]?.length || 0;
}

function getMonthWishes(month) {
  const key = getMonthKey(month);
  return props.wishesByMonth[key] || [];
}

function getMonthClass(month) {
  const count = getMonthCount(month);
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800 opacity-50';
  return 'bg-primary/5 hover:bg-primary/10 hover:scale-105 ring-2 ring-primary/20';
}

function getMonthEmoji(month) {
  // 不同月份不同emoji
  const emojis = ['🌸', '🌷', '🌱', '☀️', '🌿', '🌻', '🍃', '🌺', '🍂', '🌰', '❄️', '🎄'];
  return emojis[month - 1];
}

function openMonthModal(month) {
  if (getMonthCount(month) > 0) {
    selectedMonth.value = month;
  }
}
</script>

<style scoped>
.month-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.month-cell:not(.opacity-50):hover {
  animation: pulse-glow 1s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0); }
  50% { box-shadow: 0 0 12px 2px rgba(212, 165, 116, 0.3); }
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/WishCalendar.vue
git commit -m "feat(wishes): 创建 WishCalendar 年日历组件"
```

---

## Chunk 8: WishEmptyState 空状态组件

**Files:**
- Create: `src/components/WishEmptyState.vue`

- [ ] **Step 1: 创建 WishEmptyState.vue**

```vue
<template>
  <div class="wish-empty-state text-center py-16">
    <div class="relative inline-block mb-6">
      <!-- 漂浮动画 -->
      <span class="absolute -top-4 -left-2 text-2xl animate-bounce" style="animation-delay: 0s">✨</span>
      <span class="absolute -top-2 -right-4 text-xl animate-bounce" style="animation-delay: 0.2s">💫</span>
      <span class="absolute -bottom-2 -left-4 text-xl animate-bounce" style="animation-delay: 0.4s">🌟</span>
      <span class="absolute -bottom-4 -right-2 text-2xl animate-bounce" style="animation-delay: 0.6s">✨</span>
      
      <!-- 主图标 -->
      <div class="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <component :is="icon" class="w-12 h-12 text-primary" />
      </div>
    </div>
    
    <h3 class="font-display text-xl text-text-main mb-2">{{ title }}</h3>
    <p class="text-text-secondary mb-6">{{ subtitle }}</p>
    
    <button
      v-if="showAddBtn"
      @click="$emit('add')"
      class="px-6 py-3 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
    >
      {{ addBtnText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Heart, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  type: { 
    type: String, 
    default: 'active',
    validator: v => ['active', 'completed'].includes(v)
  },
  showAddBtn: { type: Boolean, default: true },
  addBtnText: { type: String, default: '添加愿望' },
});

defineEmits(['add']);

const config = computed(() => {
  if (props.type === 'active') {
    return {
      icon: Sparkles,
      title: '还没有愿望呢',
      subtitle: '写下你们的第一个愿望吧~',
    };
  }
  return {
    icon: Heart,
    title: '还没有完成的愿望',
    subtitle: '愿望成真时，点击 ✨ 来记录~',
  };
});

const icon = computed(() => config.value.icon);
const title = computed(() => config.value.title);
const subtitle = computed(() => config.value.subtitle);
</script>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/WishEmptyState.vue
git commit -m "feat(wishes): 创建 WishEmptyState 空状态组件"
```

---

## Chunk 9: WishesView 主页面

**Files:**
- Create: `src/views/WishesView.vue`

- [ ] **Step 1: 创建 WishesView.vue**

```vue
<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-2">
          ✨ 愿望清单
        </h1>
        <p class="text-text-secondary">一起完成的愿望</p>
      </div>
      
      <!-- 添加按钮 -->
      <div class="flex justify-end mb-6">
        <button
          @click="openAddModal"
          class="px-4 py-2 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          添加愿望
        </button>
      </div>
      
      <!-- Tab 切换 -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 py-2 px-4 rounded-xl font-medium transition-all"
          :class="activeTab === tab.value 
            ? 'bg-primary text-white shadow-lg' 
            : 'bg-card text-text-secondary hover:bg-primary/10'"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <!-- 筛选栏 -->
      <WishFilters
        v-if="activeTab === 'completed'"
        :categories="categories"
        :priorities="priorities"
        v-model:category="filters.category"
        v-model:priority="filters.priority"
        @clear="clearFilters"
      />
      
      <!-- 加载状态 -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 bg-card rounded-2xl animate-pulse"></div>
      </div>
      
      <!-- 进行中视图 -->
      <div v-else-if="activeTab === 'active'">
        <WishEmptyState
          v-if="activeWishes.length === 0"
          type="active"
          @add="openAddModal"
        />
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WishCard
            v-for="(wish, index) in activeWishes"
            :key="wish.id"
            :wish="wish"
            :is-active="true"
            :style="{ animationDelay: `${index * 50}ms` }"
            class="animate-fade-in-up"
            @click="openEditModal(wish)"
            @complete="handleComplete"
          />
        </div>
      </div>
      
      <!-- 已完成视图 -->
      <div v-else>
        <!-- 视图切换 -->
        <div class="flex items-center justify-end gap-2 mb-4">
          <button
            v-for="mode in viewModes"
            :key="mode.value"
            @click="viewMode = mode.value"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === mode.value ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100'"
          >
            <component :is="mode.icon" class="w-5 h-5" />
          </button>
        </div>
        
        <WishEmptyState
          v-if="completedWishes.length === 0"
          type="completed"
          :show-add-btn="false"
        />
        
        <!-- 列表视图 -->
        <div v-else-if="viewMode === 'list'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WishCard
            v-for="(wish, index) in completedWishes"
            :key="wish.id"
            :wish="wish"
            :is-active="false"
            :show-complete-btn="false"
            :style="{ animationDelay: `${index * 50}ms` }"
            class="animate-fade-in-up"
            @click="openEditModal(wish)"
          />
        </div>
        
        <!-- 日历视图 -->
        <WishCalendar
          v-else
          :wishes-by-month="completedWishesByMonth"
          :current-year="currentYear"
        />
      </div>
    </div>
    
    <!-- 添加/编辑 Modal -->
    <WishModal
      :show="showModal"
      :wish="selectedWish"
      :categories="categories"
      :priorities="priorities"
      @close="closeModal"
      @save="handleSave"
      @delete="handleDelete"
    />
    
    <!-- 完成日期选择 Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="completingWishId"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="completingWishId = null"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 class="font-display text-lg text-text-main mb-4 text-center">✨ 记录这个愿望成真了！</h3>
            <p class="text-text-secondary text-sm mb-4 text-center">选择完成的日期</p>
            <input
              v-model="completedDate"
              type="date"
              class="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:border-primary mb-4"
            />
            <div class="flex gap-3">
              <button
                @click="completingWishId = null"
                class="flex-1 px-4 py-2 text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmComplete"
                class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl hover:opacity-90 transition-all"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, List, Calendar } from 'lucide-vue-next';
import { useWishes } from '@/composables/useWishes.js';
import WishCard from '@/components/WishCard.vue';
import WishFilters from '@/components/WishFilters.vue';
import WishModal from '@/components/WishModal.vue';
import WishCalendar from '@/components/WishCalendar.vue';
import WishEmptyState from '@/components/WishEmptyState.vue';

const {
  loading,
  activeTab,
  viewMode,
  filters,
  activeWishes,
  completedWishes,
  completedWishesByMonth,
  categories,
  priorities,
  createWish,
  markComplete,
  editWish,
  removeWish,
  clearFilters,
} = useWishes();

const tabs = [
  { label: '🔥 进行中', value: 'active' },
  { label: '✨ 已完成', value: 'completed' },
];

const viewModes = [
  { label: '列表', value: 'list', icon: List },
  { label: '日历', value: 'calendar', icon: Calendar },
];

const currentYear = new Date().getFullYear();

const showModal = ref(false);
const selectedWish = ref(null);
const completingWishId = ref(null);
const completedDate = ref('');

function openAddModal() {
  selectedWish.value = null;
  showModal.value = true;
}

function openEditModal(wish) {
  selectedWish.value = wish;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedWish.value = null;
}

async function handleSave(data) {
  if (selectedWish.value) {
    await editWish(selectedWish.value.id, data);
  } else {
    await createWish(data);
  }
}

async function handleDelete(wishId) {
  await removeWish(wishId);
}

function handleComplete(wishId) {
  completingWishId.value = wishId;
  completedDate.value = new Date().toISOString().split('T')[0];
}

async function confirmComplete() {
  if (completingWishId.value && completedDate.value) {
    await markComplete(completingWishId.value, completedDate.value);
    completingWishId.value = null;
    completedDate.value = '';
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/views/WishesView.vue
git commit -m "feat(wishes): 创建 WishesView 愿望清单主页面"
```

---

## Chunk 10: 全局动画 & 收尾

**Files:**
- Modify: `src/views/WishesView.vue` - 添加全局动画样式
- Modify: `vite.config.js` - （如需要 PWA 配置）

- [ ] **Step 1: 添加完成粒子效果（可选）**

在 `WishesView.vue` 的 style 中已包含基础动画，无需额外修改

- [ ] **Step 2: 最终验证**

```bash
# 运行开发服务器测试
npm run dev

# 生产构建测试
npm run build
```

- [ ] **Step 3: 提交收尾**

```bash
git add -A
git commit -m "feat(wishes): 完成愿望清单功能开发"
```

---

## 预期文件变更总结

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/lib/notion.js` | 修改 | 添加愿望 CRUD API |
| `src/router/index.js` | 修改 | 添加 /wishes 路由 |
| `src/components/BottomNav.vue` | 修改 | 添加愿望导航入口 |
| `src/composables/useWishes.js` | 创建 | 状态管理 |
| `src/components/WishCard.vue` | 创建 | 愿望卡片组件 |
| `src/components/WishFilters.vue` | 创建 | 筛选栏组件 |
| `src/components/WishModal.vue` | 创建 | 添加/编辑弹窗 |
| `src/components/WishCalendar.vue` | 创建 | 年日历视图 |
| `src/components/WishEmptyState.vue` | 创建 | 空状态组件 |
| `src/views/WishesView.vue` | 创建 | 主页面 |
| `.env.example` | 修改 | 添加 WISHES_DATABASE_ID |
| `docs/plans/2026-03-19-wishes-feature-design.md` | 已提交 | 设计文档 |

import { ref, computed, readonly } from 'vue';
import {
  fetchWishes as fetchWishesFromNotion,
  addWish as addWishToNotion,
  updateWish as updateWishInNotion,
  completeWish as completeWishInNotion,
  deleteWish as deleteWishFromNotion,
} from '@/lib/notion.js';

// Shared state
const wishes = ref([]);
const loading = ref(false);
const error = ref(null);

// Filters
const selectedCategory = ref('全部');
const selectedPriority = ref('全部');
const selectedStatus = ref('全部');
const viewMode = ref('list'); // 'list' | 'calendar'

// Categories and priorities
const categories = ['全部', '旅行', '美食', '体验', '家居', '其他'];
const priorities = ['全部', '高', '中', '低'];
const statuses = ['全部', '进行中', '已完成'];

// 优先级排序权重: 高 > 中 > 低, 未知视为中
const PRIORITY_RANK = { 高: 0, 中: 1, 低: 2 };

function byPriority(a, b) {
  const rank = (w) => PRIORITY_RANK[w.priority] ?? 1;
  if (rank(a) !== rank(b)) return rank(a) - rank(b);
  // 同优先级按目标日期升序（无日期排最后）
  if (!a.targetDate) return 1;
  if (!b.targetDate) return -1;
  return a.targetDate < b.targetDate ? -1 : 1;
}

// Filtered wishes（优先级排序后的过滤结果）
const filteredWishes = computed(() => {
  return wishes.value.filter(wish => {
    // Category filter
    if (selectedCategory.value !== '全部' && wish.category !== selectedCategory.value) return false;

    // Priority filter
    if (selectedPriority.value !== '全部' && wish.priority !== selectedPriority.value) return false;

    // Status filter
    if (selectedStatus.value !== '全部' && wish.status !== selectedStatus.value) return false;

    return true;
  }).slice().sort(byPriority);
});

// In-progress wishes（高 > 中 > 低）
const inProgressWishes = computed(() => {
  return wishes.value.filter(w => w.status === '进行中').slice().sort(byPriority);
});

// Completed wishes
const completedWishes = computed(() => {
  return wishes.value.filter(w => w.status === '已完成');
});

// Wishes grouped by year (for calendar view)
const wishesByYear = computed(() => {
  const grouped = {};
  completedWishes.value.forEach(wish => {
    if (wish.completedDate) {
      // 'YYYY-MM-DD' 直接取年份, 避免 new Date() 的 UTC 解析偏移
      const year = Number(wish.completedDate.slice(0, 4));
      if (Number.isFinite(year)) {
        if (!grouped[year]) {
          grouped[year] = [];
        }
        grouped[year].push(wish);
      }
    }
  });
  return grouped;
});

// Stats
const stats = computed(() => ({
  total: wishes.value.length,
  inProgress: wishes.value.filter(w => w.status === '进行中').length,
  completed: wishes.value.filter(w => w.status === '已完成').length,
}));

export function useWishes() {
  // Fetch all wishes
  async function loadWishes() {
    loading.value = true;
    error.value = null;
    try {
      wishes.value = await fetchWishesFromNotion();
    } catch (e) {
      // 保留已有数据, 仅当列表为空时由视图展示错误态
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  // Add a new wish
  async function addWish(wishData) {
    try {
      const newWish = await addWishToNotion(wishData);
      if (newWish) {
        wishes.value.unshift(newWish);
        return newWish;
      }
      return null;
    } catch {
      // Silent failure
      return null;
    }
  }

  // Update a wish
  async function updateWish(wishId, updates) {
    try {
      const success = await updateWishInNotion(wishId, updates);
      if (success) {
        const index = wishes.value.findIndex(w => w.id === wishId);
        if (index !== -1) {
          wishes.value[index] = { ...wishes.value[index], ...updates };
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Complete a wish
  async function completeWish(wishId) {
    const completedDate = new Date().toISOString().split('T')[0];
    try {
      const success = await completeWishInNotion(wishId, completedDate);
      if (success) {
        const index = wishes.value.findIndex(w => w.id === wishId);
        if (index !== -1) {
          wishes.value[index] = {
            ...wishes.value[index],
            status: '已完成',
            completedDate,
          };
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Delete a wish
  async function deleteWish(wishId) {
    try {
      const success = await deleteWishFromNotion(wishId);
      if (success) {
        wishes.value = wishes.value.filter(w => w.id !== wishId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Set filters
  function setCategory(category) {
    selectedCategory.value = category;
  }

  function setPriority(priority) {
    selectedPriority.value = priority;
  }

  function setStatus(status) {
    selectedStatus.value = status;
  }

  function setViewMode(mode) {
    viewMode.value = mode;
  }

  function resetFilters() {
    selectedCategory.value = '全部';
    selectedPriority.value = '全部';
    selectedStatus.value = '全部';
  }

  return {
    // State
    wishes: readonly(wishes),
    loading: readonly(loading),
    error: readonly(error),

    // Filters
    selectedCategory,
    selectedPriority,
    selectedStatus,
    viewMode,
    categories,
    priorities,
    statuses,

    // Computed
    filteredWishes,
    inProgressWishes,
    completedWishes,
    wishesByYear,
    stats,

    // Actions
    loadWishes,
    addWish,
    updateWish,
    completeWish,
    deleteWish,
    setCategory,
    setPriority,
    setViewMode,
    resetFilters,
  };
}
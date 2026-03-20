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

// Filtered wishes
const filteredWishes = computed(() => {
  return wishes.value.filter(wish => {
    // Category filter
    if (selectedCategory.value !== '全部' && wish.category !== selectedCategory.value) return false;

    // Priority filter
    if (selectedPriority.value !== '全部' && wish.priority !== selectedPriority.value) return false;

    // Status filter
    if (selectedStatus.value !== '全部' && wish.status !== selectedStatus.value) return false;

    return true;
  });
});

// In-progress wishes
const inProgressWishes = computed(() => {
  return wishes.value.filter(w => w.status === '进行中');
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
      const year = new Date(wish.completedDate).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(wish);
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
      error.value = e;
      // Silent failure for display site
      wishes.value = [];
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
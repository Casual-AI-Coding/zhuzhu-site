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

import { ref } from 'vue';

// 全局下拉刷新 composable
// 用法:
//   const { refreshing, handlers } = usePullToRefresh(doRefresh)
//   <div v-on="handlers"> ... </div>
// 仅在页面滚动到顶部时生效, 下拉超过阈值(阻尼后)触发一次 onRefresh,
// refreshing 期间显示指示器并阻止重复触发。
export function usePullToRefresh(onRefresh, { threshold = 80 } = {}) {
  const refreshing = ref(false);
  let startY = 0;
  let pulling = false;

  function onTouchStart(e) {
    if (window.scrollY === 0 && !refreshing.value) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }

  function onTouchMove(e) {
    if (!pulling || refreshing.value) return;
    if (window.scrollY > 0) {
      pulling = false;
      return;
    }
    // 1.5 倍阻尼: 手指移动 distance, 计为 distance/1.5
    const delta = (e.touches[0].clientY - startY) / 1.5;
    if (delta > threshold) {
      pulling = false;
      startY = 0;
      refreshing.value = true;
      Promise.resolve(onRefresh()).finally(() => {
        refreshing.value = false;
      });
    }
  }

  function onTouchEnd() {
    pulling = false;
    startY = 0;
  }

  const handlers = {
    touchstart: onTouchStart,
    touchmove: onTouchMove,
    touchend: onTouchEnd,
  };

  return { refreshing, handlers };
}

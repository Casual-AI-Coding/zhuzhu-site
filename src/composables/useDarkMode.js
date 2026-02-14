import { ref, watch, onMounted } from 'vue';

const isDark = ref(false);

export function useDarkMode() {
  const init = () => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      isDark.value = saved === 'true';
    } else {
      // 默认跟随系统
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyDarkMode();
  };

  const applyDarkMode = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggle = () => {
    isDark.value = !isDark.value;
  };

  watch(isDark, (newValue) => {
    localStorage.setItem('darkMode', String(newValue));
    applyDarkMode();
  });

  onMounted(() => {
    init();
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        isDark.value = e.matches;
      }
    });
  });

  return {
    isDark,
    toggle,
    init,
  };
}

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
    // 添加过渡类
    document.documentElement.classList.add('theme-transition');
    
    isDark.value = !isDark.value;
    
    // 过渡完成后移除过渡类
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
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
        // 系统主题变化时也添加过渡
        document.documentElement.classList.add('theme-transition');
        isDark.value = e.matches;
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);
      }
    });
  });

  return {
    isDark,
    toggle,
    init,
  };
}

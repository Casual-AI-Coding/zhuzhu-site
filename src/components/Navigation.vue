<template>
  <nav class="fixed top-4 left-4 right-4 z-50" :class="{ 'nav-scrolled': isScrolled }">
    <div class="glass-nav rounded-2xl px-4 py-3 max-w-6xl mx-auto transition-all duration-300" :class="{ 'py-2 shadow-lg': isScrolled }">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 group">
          <Heart class="w-6 h-6 text-primary group-hover:scale-110 transition-transform" :class="{ 'w-5 h-5': isScrolled }" />
          <span class="font-display text-xl text-text-main hidden sm:block transition-all duration-300" :class="{ 'text-lg': isScrolled }">zhuzhu</span>
        </RouterLink>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <NavLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            :label="item.label"
            :icon="item.icon"
          />
          
          <!-- Refresh Data Button -->
          <RippleButton
            @click="refreshData"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors ml-2"
            title="刷新数据"
          >
            <RotateCcw class="w-5 h-5 text-text-main" />
          </RippleButton>

          <!-- Dark Mode Toggle -->
          <RippleButton
            @click="toggleDark"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors theme-toggle"
          >
            <Transition name="theme-icon" mode="out-in">
              <Sun v-if="isDark" key="sun" class="w-5 h-5 text-primary" />
              <Moon v-else key="moon" class="w-5 h-5 text-text-main" />
            </Transition>
          </RippleButton>
        </div>

        <!-- Mobile Right Buttons -->
        <div class="flex items-center gap-1 md:hidden">
          <!-- Refresh Data Button -->
          <RippleButton
            @click="refreshData"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors"
            title="刷新数据"
          >
            <RotateCcw class="w-5 h-5 text-text-main" />
          </RippleButton>

          <!-- Dark Mode Toggle -->
          <RippleButton
            @click="toggleDark"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors theme-toggle"
          >
            <Transition name="theme-icon" mode="out-in">
              <Sun v-if="isDark" key="sun" class="w-5 h-5 text-primary" />
              <Moon v-else key="moon" class="w-5 h-5 text-text-main" />
            </Transition>
          </RippleButton>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Heart, Menu, X, Home, Calendar, Image, Clock, MessageCircle, Sun, Moon, RotateCcw } from 'lucide-vue-next';
import NavLink from './NavLink.vue';
import MobileNavLink from './MobileNavLink.vue';
import RippleButton from './RippleButton.vue';
import { useDarkMode } from '@/composables/useDarkMode.js';

const { isDark, toggle: toggleDark } = useDarkMode();

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

function handleScroll() {
  isScrolled.value = window.scrollY > 50;
}

function refreshData() {
  window.dispatchEvent(new CustomEvent('refresh-data'));
}

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: Home },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: Calendar },
  { name: 'gallery', path: '/gallery', label: '相册', icon: Image },
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: Clock },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: MessageCircle },
];

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.nav-scrolled .glass-nav {
  backdrop-filter: blur(16px);
  background-color: rgba(255, 255, 255, 0.85);
}

:global(.dark) .nav-scrolled .glass-nav {
  background-color: rgba(30, 30, 30, 0.85);
}

/* 主题切换图标动画 */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.theme-toggle {
  overflow: hidden;
}
</style>

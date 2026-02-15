<template>
  <nav class="fixed top-4 left-4 right-4 z-50">
    <div class="glass-nav rounded-2xl px-4 py-3 max-w-6xl mx-auto">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 group">
          <Heart class="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span class="font-display text-xl text-text-main hidden sm:block">zhuzhu</span>
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
          <button
            @click="refreshData"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors ml-2"
            title="刷新数据"
          >
            <RotateCcw class="w-5 h-5 text-text-main" />
          </button>
          
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDark"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-primary" />
            <Moon v-else class="w-5 h-5 text-text-main" />
          </button>
        </div>
        
        <!-- Mobile Right Buttons -->
        <div class="flex items-center gap-1 md:hidden">
          <!-- Refresh Data Button -->
          <button
            @click="refreshData"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors"
            title="刷新数据"
          >
            <RotateCcw class="w-5 h-5 text-text-main" />
          </button>
          
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDark"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-primary" />
            <Moon v-else class="w-5 h-5 text-text-main" />
          </button>
          
          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-6 h-6 text-text-main dark:text-text-main-dark" />
            <X v-else class="w-6 h-6 text-text-main dark:text-text-main-dark" />
          </button>
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
        <div v-if="isMobileMenuOpen" class="md:hidden mt-3 pt-3 border-t border-border/50 dark:border-border-dark/50">
          <div class="flex flex-col gap-1">
            <MobileNavLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.path"
              :label="item.label"
              :icon="item.icon"
              @click="isMobileMenuOpen = false"
            />
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { Heart, Menu, X, Home, Calendar, Image, Clock, MessageCircle, Sun, Moon, RotateCcw } from 'lucide-vue-next';
import NavLink from './NavLink.vue';
import MobileNavLink from './MobileNavLink.vue';
import { useDarkMode } from '@/composables/useDarkMode.js';

const { isDark, toggle: toggleDark } = useDarkMode();

const isMobileMenuOpen = ref(false);

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
</script>

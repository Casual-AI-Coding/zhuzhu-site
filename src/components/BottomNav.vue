<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-40 md:hidden">
    <div class="glass-nav rounded-t-2xl px-2 py-2 flex items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="bottom-nav-item relative flex flex-col items-center py-1.5 px-3 rounded-xl transition-colors"
        :class="{ 'is-active': isActive(item.path) }"
      >
        <span class="bottom-nav-icon text-xl mb-0.5 transition-transform">{{ item.icon }}</span>
        <span class="bottom-nav-label text-[10px]">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: '🏠' },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: '📅' },
  { name: 'gallery', path: '/gallery', label: '相册', icon: '🖼️' },
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: '⏰' },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: '💬' },
];

function isActive(path) {
  return route.path === path;
}
</script>

<style scoped>
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav-item {
  color: var(--color-text-secondary);
}

.bottom-nav-item.is-active {
  color: var(--color-primary);
}

.bottom-nav-item.is-active .bottom-nav-icon {
  transform: scale(1.15);
}

.bottom-nav-item:active {
  transform: scale(0.95);
}
</style>

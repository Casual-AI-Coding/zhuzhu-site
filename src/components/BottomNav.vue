<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-40 md:hidden">
    <div class="glass-nav rounded-t-2xl px-2 py-1.5 flex items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="bottom-nav-item relative flex flex-col items-center py-1.5 px-3 rounded-xl transition-colors"
        :class="{ 'is-active': isActive(item.path) }"
      >
        <component :is="item.icon" class="bottom-nav-icon w-5 h-5 mb-0.5 transition-transform" />
        <span class="bottom-nav-label text-[10px]">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Home, Calendar, Image, Clock, MessageCircle } from 'lucide-vue-next';

const route = useRoute();

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: Home },
  { name: 'anniversary', path: '/anniversary', label: '纪念日', icon: Calendar },
  { name: 'gallery', path: '/gallery', label: '相册', icon: Image },
  { name: 'timeline', path: '/timeline', label: '时光轴', icon: Clock },
  { name: 'guestbook', path: '/guestbook', label: '留言', icon: MessageCircle },
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

.bottom-nav-item:hover {
  color: var(--color-primary);
}
</style>

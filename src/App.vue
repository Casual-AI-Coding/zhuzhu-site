<template>
  <div class="min-h-screen relative flex flex-col">
    <!-- Film grain overlay -->
    <div class="film-grain"></div>
    
    <!-- Background Decorations - Disabled for performance -->
    <!-- <FloatingDecorations /> -->
    
    <!-- 特效组件 -->
    <FallingHearts />
    <ClickHearts />
    <Fireworks />
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main content -->
    <main class="flex-1 pb-16 md:pb-0">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <!-- Footer -->
    <SiteFooter class="hidden md:block" />

    <!-- Mobile Bottom Navigation -->
    <BottomNav />

    <!-- Back to Top Button -->
    <Transition name="slide-up">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group"
        aria-label="返回顶部"
      >
        <div class="relative">
          <!-- Button -->
          <div class="relative w-12 h-12 glass-nav rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95">
            <ArrowUp class="w-5 h-5 text-primary group-hover:animate-bounce" />
          </div>
        </div>
      </button>
    </Transition>

    <!-- Music Player -->
    <MusicPlayer />
    
    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Navigation from '@/components/Navigation.vue';
import FloatingDecorations from '@/components/FloatingDecorations.vue';
import FallingHearts from '@/components/FallingHearts.vue';
import ClickHearts from '@/components/ClickHearts.vue';
import Fireworks from '@/components/Fireworks.vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import BottomNav from '@/components/BottomNav.vue';
import { ArrowUp } from 'lucide-vue-next';

const showBackToTop = ref(false);

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
/* 页面切换动画 - 向前导航 */
.page-enter-active {
  animation: pageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  animation: pageSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pageSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

/* Slide up animation for back to top button */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

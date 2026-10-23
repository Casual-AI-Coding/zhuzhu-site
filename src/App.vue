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
        <Transition :name="pageTransition" mode="out-in">
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
        class="fixed bottom-24 md:bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group"
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
import { useRouter } from 'vue-router';
import Navigation from '@/components/Navigation.vue';
import FallingHearts from '@/components/FallingHearts.vue';
import ClickHearts from '@/components/ClickHearts.vue';
import Fireworks from '@/components/Fireworks.vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import BottomNav from '@/components/BottomNav.vue';
import { ArrowUp } from 'lucide-vue-next';

// APP 式方向感知页面切换: 沿导航顺序前进→左滑, 后退→右滑
const NAV_ORDER = ['home', 'anniversary', 'gallery', 'map', 'timeline', 'wishes', 'stats', 'guestbook'];
const pageTransition = ref('page-forward');
const router = useRouter();

router.afterEach((to, from) => {
  const toIdx = NAV_ORDER.indexOf(to.name);
  const fromIdx = NAV_ORDER.indexOf(from.name);
  if (toIdx === -1 || fromIdx === -1 || toIdx >= fromIdx) {
    pageTransition.value = 'page-forward';
  } else {
    pageTransition.value = 'page-back';
  }
});

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
/* 页面切换动画 - APP 式方向感知: 前进左滑入, 后退右滑入 */
.page-forward-enter-active,
.page-back-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-forward-leave-active,
.page-back-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateX(32px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}

.page-back-enter-from {
  opacity: 0;
  transform: translateX(-32px);
}

.page-back-leave-to {
  opacity: 0;
  transform: translateX(32px);
}

/* 弱动画偏好: 退化为纯淡入淡出 */
@media (prefers-reduced-motion: reduce) {
  .page-forward-enter-active,
  .page-back-enter-active,
  .page-forward-leave-active,
  .page-back-leave-active {
    transition: opacity 0.2s ease;
  }
  .page-forward-enter-from,
  .page-forward-leave-to,
  .page-back-enter-from,
  .page-back-leave-to {
    transform: none;
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

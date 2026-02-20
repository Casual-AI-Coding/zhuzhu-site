<template>
  <div class="min-h-screen relative">
    <!-- Film grain overlay -->
    <div class="film-grain"></div>
    
    <!-- 特效组件 -->
    <FallingHearts />
    <ClickHearts />
    <Fireworks />
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main content -->
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Back to Top Button -->
    <Transition name="slide-up">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group"
        aria-label="返回顶部"
      >
        <div class="relative">
          <!-- Pulse ring -->
          <div class="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
          <!-- Button -->
          <div class="relative w-12 h-12 glass-nav rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95">
            <ArrowUp class="w-5 h-5 text-primary group-hover:animate-bounce" />
          </div>
        </div>
      </button>
    </Transition>

    <!-- Music Player -->
    <MusicPlayer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Navigation from '@/components/Navigation.vue';
import FallingHearts from '@/components/FallingHearts.vue';
import ClickHearts from '@/components/ClickHearts.vue';
import Fireworks from '@/components/Fireworks.vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
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
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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

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
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
      >
        <ArrowUp class="w-5 h-5" />
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
</style>

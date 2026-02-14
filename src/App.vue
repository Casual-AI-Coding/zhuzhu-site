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
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue';
import FallingHearts from '@/components/FallingHearts.vue';
import ClickHearts from '@/components/ClickHearts.vue';
import Fireworks from '@/components/Fireworks.vue';
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

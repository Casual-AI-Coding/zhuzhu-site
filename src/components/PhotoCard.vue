<template>
  <div ref="cardRef" class="relative rounded-2xl overflow-hidden bg-gray-100" :class="aspectClass">
    <!-- 加载占位符 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
      <ImageIcon class="w-8 h-8 text-gray-300" />
    </div>
    
    <!-- 图片：进入可视区域后加载 -->
    <img
      v-show="!loading && !error"
      :src="visible ? src : undefined"
      :alt="alt"
      class="w-full h-full object-cover transition-all duration-700 ease-out"
      :class="loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
      @load="onLoad"
      @error="onError"
    />
    
    <!-- 错误降级 -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <ImageIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-400 text-sm">图片加载失败</p>
      </div>
    </div>
    
    <!-- 悬停层 -->
    <div 
      v-if="!error && !loading"
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
    >
      <p class="text-white font-handwriting text-lg mb-1">{{ title }}</p>
      <p class="text-white/70 text-sm mb-2">{{ date }}</p>
      <!-- 地点 -->
      <div v-if="place" class="flex items-center gap-1 text-white/80 text-sm mb-2">
        <MapPin class="w-3.5 h-3.5" />
        <span>{{ place }}</span>
      </div>
      <!-- 标签 -->
      <div v-if="tags && tags.length" class="flex flex-wrap gap-1">
        <span 
          v-for="tag in tags" 
          :key="tag"
          class="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image as ImageIcon, MapPin } from 'lucide-vue-next';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  title: { type: String, default: '' },
  date: { type: String, default: '' },
  place: { type: String, default: '' },
  tags: { type: Array, default: () => [] },
  description: { type: String, default: '' },
  aspectClass: { type: String, default: 'aspect-square' },
});

const emit = defineEmits(['click']);

const loading = ref(true);
const loaded = ref(false);
const error = ref(false);
const visible = ref(false);
const cardRef = ref(null);

let observer = null;

function onLoad() {
  loading.value = false;
  // 延迟一帧触发动画
  requestAnimationFrame(() => {
    loaded.value = true;
  });
}

function onError() {
  loading.value = false;
  error.value = true;
}

onMounted(() => {
  // 使用 IntersectionObserver 实现预加载
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.value = true;
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '200px',
      threshold: 0.1,
    }
  );

  if (cardRef.value) {
    observer.observe(cardRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

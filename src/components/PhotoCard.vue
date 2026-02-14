<template>
  <div class="relative rounded-2xl overflow-hidden bg-gray-100" :class="aspectClass">
    <!-- 加载占位符 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-200">
      <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <!-- 加载完成显示图片 -->
    <img
      v-show="!loading && !error"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover transition-all duration-500"
      :class="{ 'opacity-0': loading }"
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
      class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <div class="absolute bottom-4 left-4 right-4">
        <p class="text-white font-handwriting text-lg mb-1">{{ title }}</p>
        <p class="text-white/70 text-sm">{{ date }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Image as ImageIcon } from 'lucide-vue-next';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  title: { type: String, default: '' },
  date: { type: String, default: '' },
  aspectClass: { type: String, default: 'aspect-square' },
});

const emit = defineEmits(['click']);

const loading = ref(true);
const error = ref(false);

function onLoad() {
  loading.value = false;
}

function onError() {
  loading.value = false;
  error.value = true;
}
</script>

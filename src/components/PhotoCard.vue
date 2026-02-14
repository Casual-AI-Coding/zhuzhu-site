<template>
  <div ref="cardRef" class="relative rounded-2xl overflow-hidden bg-gray-100" :class="aspectClass">
    <!-- 加载占位符 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-200">
      <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <!-- 图片：进入可视区域后加载 -->
    <img
      v-show="!loading && !error"
      :src="cachedUrl || (visible ? src : undefined)"
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
const error = ref(false);
const visible = ref(false);
const cardRef = ref(null);
const cachedUrl = ref(null);

let observer = null;

// 从 URL 中提取文件名作为缓存 key
const cacheKey = computed(() => {
  try {
    const url = new URL(props.src);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || 'image';
    return filename.split('?')[0]; // 去掉查询参数
  } catch {
    return 'image';
  }
});

// 检查缓存
async function checkCache() {
  try {
    const cache = await caches.open('custom-images');
    const cachedResponse = await cache.match(cacheKey.value);
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      cachedUrl.value = URL.createObjectURL(blob);
      loading.value = false;
      return true;
    }
  } catch (e) {
    console.warn('Cache check failed:', e);
  }
  return false;
}

// 存入缓存
async function saveToCache(blob) {
  try {
    const cache = await caches.open('custom-images');
    const response = new Response(blob, {
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
    });
    await cache.put(cacheKey.value, response);
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
}

function onLoad() {
  loading.value = false;
  // 获取图片 Blob 并缓存
  if (props.src) {
    fetch(props.src)
      .then(res => res.blob())
      .then(blob => saveToCache(blob))
      .catch(() => {});
  }
}

function onError() {
  loading.value = false;
  error.value = true;
}

// 加载图片
async function loadImage() {
  // 先检查缓存
  const cached = await checkCache();
  if (cached) return;
  
  // 缓存不存在，使用原始 URL
  cachedUrl.value = null;
}

onMounted(() => {
  // 使用 IntersectionObserver 实现预加载
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.value = true;
          loadImage();
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '200px', // 提前 200px 开始加载
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
  // 清理 Object URL
  if (cachedUrl.value) {
    URL.revokeObjectURL(cachedUrl.value);
  }
});
</script>

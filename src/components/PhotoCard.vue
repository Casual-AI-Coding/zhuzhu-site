<template>
  <div 
    ref="cardRef" 
    class="photo-card-3d relative rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer select-none"
    :class="[aspectClass, { 'is-pressed': isPressed }]"
    :style="{ transform: combinedTransform }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @mousedown="handlePressStart"

    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @contextmenu.prevent="handleLongPress"
  >
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

    <!-- 长按提示 -->
    <Transition name="fade">
      <div 
        v-if="showLongPressHint"
        class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl"
      >
        <div class="text-center text-white">
          <EyeIcon class="w-12 h-12 mx-auto mb-2" />
          <p class="text-sm">长按查看大图</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image as ImageIcon, MapPin, Eye as EyeIcon } from 'lucide-vue-next';

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

const emit = defineEmits(['click', 'longpress']);

const loading = ref(true);
const loaded = ref(false);
const error = ref(false);
const visible = ref(false);
const cardRef = ref(null);
const transform = ref({ rotateX: 0, rotateY: 0 });
const isPressed = ref(false);
const showLongPressHint = ref(false);

let observer = null;
let rafId = null;
let pendingUpdate = null;
let longPressTimer = null;
const LONG_PRESS_DURATION = 500;

// Combined transform: 3D tilt + press scale
const combinedTransform = computed(() => {
  const tilt = `perspective(1000px) rotateX(${transform.value.rotateX}deg) rotateY(${transform.value.rotateY}deg)`;
  const scale = isPressed.value ? 'scale(0.96)' : 'scale(1)';
  return `${tilt} ${scale}`;
});

function handleMouseMove(e) {
  if (!cardRef.value) return;
  
  pendingUpdate = { e };
  
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      if (pendingUpdate && cardRef.value) {
        const rect = cardRef.value.getBoundingClientRect();
        const x = pendingUpdate.e.clientX - rect.left;
        const y = pendingUpdate.e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        transform.value = { rotateX, rotateY };
      }
      rafId = null;
    });
  }
}

function handleMouseLeave() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  pendingUpdate = null;
  transform.value = { rotateX: 0, rotateY: 0 };
  handlePressEnd();
}

function handlePressStart() {
  isPressed.value = true;
}

function handlePressEnd() {
  isPressed.value = false;
}

function handleTouchStart(e) {
  // Start long press timer
  longPressTimer = setTimeout(() => {
    handleLongPress();
  }, LONG_PRESS_DURATION);
  
  isPressed.value = true;
}

function handleTouchEnd() {
  // Clear long press timer
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  isPressed.value = false;
}

function handleLongPress() {
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  // Show hint
  showLongPressHint.value = true;
  
  // Emit event
  emit('longpress', { title: props.title, src: props.src });
  
  // Hide hint after 1.5s
  setTimeout(() => {
    showLongPressHint.value = false;
  }, 1500);
}

function onLoad() {
  loading.value = false;
  requestAnimationFrame(() => {
    loaded.value = true;
  });
}

function onError() {
  loading.value = false;
  error.value = true;
}

onMounted(() => {
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
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }
});
</script>

<style scoped>
.photo-card-3d {
  transition: transform 0.15s ease-out, box-shadow 0.3s ease;
  transform-style: preserve-3d;
  will-change: transform;
  touch-action: manipulation;
}

.photo-card-3d:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.is-pressed {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

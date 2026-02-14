<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          相册墙
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          记录我们的每一个美好瞬间
        </p>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="bg-card rounded-2xl overflow-hidden">
            <div class="aspect-[4/3] bg-gray-200"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="photos.length === 0" class="text-center text-text-secondary">
        暂无照片
      </div>
      
      <!-- Masonry Grid -->
      <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="break-inside-avoid card-hover cursor-pointer group"
          @click="openLightbox(photo)"
        >
          <PhotoCard
            :src="photo.thumbnailUrl || photo.url"
            :alt="photo.title"
            :title="photo.title"
            :date="formatDate(photo.date)"
            :place="photo.place"
            :tags="photo.tags"
            :description="photo.description"
          />
        </div>
      </div>
    </div>
    
    <!-- Lightbox -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedPhoto"
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        @click="closeLightbox"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="max-w-4xl max-h-full" @click.stop>
          <!-- 错误降级 -->
          <div v-if="lightboxError" class="w-full h-[60vh] flex items-center justify-center bg-gray-800 rounded-lg">
            <div class="text-center">
              <ImageIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p class="text-gray-400">图片加载失败</p>
            </div>
          </div>
          <!-- 正常图片 - 支持缩放 -->
          <div 
            v-show="!lightboxError"
            class="overflow-hidden"
            :style="{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }"
            style="transition: transform 0.1s ease-out"
          >
            <img
              :src="selectedPhoto.url"
              :alt="selectedPhoto.title"
              class="max-w-full max-h-[70vh] object-contain rounded-lg"
              @error="lightboxError = true"
            />
          </div>
          <!-- 缩放提示 -->
          <div class="text-center mt-2 text-white/50 text-xs">
            滚轮/双指缩放 · ESC 关闭
          </div>
          <!-- 详情信息 -->
          <div class="text-center mt-4 space-y-2">
            <p class="text-white font-handwriting text-xl">{{ selectedPhoto.title }}</p>
            <p class="text-white/60 text-sm">{{ formatDate(selectedPhoto.date) }}</p>
            <div v-if="selectedPhoto.place" class="flex items-center justify-center gap-1 text-white/80 text-sm">
              <MapPin class="w-4 h-4" />
              <span>{{ selectedPhoto.place }}</span>
            </div>
            <div v-if="selectedPhoto.tags && selectedPhoto.tags.length" class="flex justify-center gap-2 mt-2">
              <span 
                v-for="tag in selectedPhoto.tags" 
                :key="tag"
                class="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs"
              >
                {{ tag }}
              </span>
            </div>
            <p v-if="selectedPhoto.description" class="text-white/60 text-sm mt-3 max-w-md mx-auto">
              {{ selectedPhoto.description }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Image as ImageIcon, MapPin } from 'lucide-vue-next';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';
import PhotoCard from '@/components/PhotoCard.vue';

const { formatDate } = useDaysCount();

const photos = ref([]);
const loading = ref(true);
const selectedPhoto = ref(null);
const lightboxError = ref(false);

// 图片缩放
const scale = ref(1);
const isDragging = ref(false);
const position = ref({ x: 0, y: 0 });
const startPos = ref({ x: 0, y: 0 });

function openLightbox(photo) {
  lightboxError.value = false;
  selectedPhoto.value = photo;
  scale.value = 1;
  position.value = { x: 0, y: 0 };
}

function closeLightbox() {
  selectedPhoto.value = null;
  scale.value = 1;
  position.value = { x: 0, y: 0 };
}

// ESC 关闭
function handleKeydown(e) {
  if (e.key === 'Escape' && selectedPhoto.value) {
    closeLightbox();
  }
}

// 滚轮缩放
function handleWheel(e) {
  if (!selectedPhoto.value) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.min(Math.max(0.5, scale.value + delta), 4);
}

// 触摸缩放
let initialDistance = 0;
function handleTouchStart(e) {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2 && initialDistance) {
    e.preventDefault();
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const scaleDelta = currentDistance / initialDistance;
    scale.value = Math.min(Math.max(0.5, scale.value * scaleDelta), 4);
    initialDistance = currentDistance;
  }
}

function handleTouchEnd() {
  initialDistance = 0;
}

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

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
      
      <!-- Toolbar -->
      <GalleryToolbar
        v-model:viewMode="viewMode"
        v-model:groupBy="groupBy"
      />
      
      <!-- Loading -->
      <SkeletonGrid v-if="loading" :count="6" aspect-class="aspect-[4/3]" />
      
      <!-- Empty State -->
      <div v-else-if="photos.length === 0" class="text-center text-text-secondary">
        暂无照片
      </div>
      
      <!-- View Container with Transition -->
      <Transition name="view-fade" mode="out-in">
        <!-- Masonry Grid -->
        <div v-if="viewMode === 'masonry'" key="masonry" class="columns-1 sm:columns-2 lg:columns-3 landscape:columns-2 gap-4 space-y-4">
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
        
        <!-- Timeline View -->
        <TimelineGallery
          v-else
          key="timeline"
          :photos="photos"
          :group-by="groupBy"
          @select="openLightbox"
        />
      </Transition>
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
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 landscape:p-2"
        @click="closeLightbox"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 上一张按钮 -->
        <button
          v-if="currentIndex > 0"
          @click.stop="prevPhoto"
          class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronLeft class="w-6 h-6 text-white" />
        </button>
        
        <div class="max-w-4xl max-h-full landscape:max-w-none landscape:w-full landscape:h-full" @click.stop>
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
            ← → 切换 · 滚轮/双指缩放 · ESC 关闭
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
        
        <!-- 下一张按钮 -->
        <button
          v-if="currentIndex < photos.length - 1"
          @click.stop="nextPhoto"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight class="w-6 h-6 text-white" />
        </button>
        
        <!-- 照片计数 -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image as ImageIcon, MapPin, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { useGalleryView } from '@/composables/useGalleryView.js';
import PhotoCard from '@/components/PhotoCard.vue';
import SkeletonGrid from '@/components/SkeletonGrid.vue';
import GalleryToolbar from '@/components/GalleryToolbar.vue';
import TimelineGallery from '@/components/TimelineGallery.vue';

const { formatDate } = useDaysCount();
const { viewMode, groupBy } = useGalleryView();

const photos = ref([]);
const loading = ref(true);
const selectedPhoto = ref(null);
const lightboxError = ref(false);
const currentIndex = ref(0);

// 图片缩放
const scale = ref(1);
const isDragging = ref(false);
const position = ref({ x: 0, y: 0 });
const startPos = ref({ x: 0, y: 0 });

function openLightbox(photo) {
  lightboxError.value = false;
  selectedPhoto.value = photo;
  currentIndex.value = photos.value.findIndex(p => p.id === photo.id);
  scale.value = 1;
  position.value = { x: 0, y: 0 };
}

function prevPhoto() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    selectedPhoto.value = photos.value[currentIndex.value];
    lightboxError.value = false;
    scale.value = 1;
    position.value = { x: 0, y: 0 };
  }
}

function nextPhoto() {
  if (currentIndex.value < photos.value.length - 1) {
    currentIndex.value++;
    selectedPhoto.value = photos.value[currentIndex.value];
    lightboxError.value = false;
    scale.value = 1;
    position.value = { x: 0, y: 0 };
  }
}

function closeLightbox() {
  selectedPhoto.value = null;
  scale.value = 1;
  position.value = { x: 0, y: 0 };
}

// 键盘操作
function handleKeydown(e) {
  if (!selectedPhoto.value) return;
  
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      prevPhoto();
      break;
    case 'ArrowRight':
      nextPhoto();
      break;
  }
}

// 滚轮缩放
function handleWheel(e) {
  if (!selectedPhoto.value) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.min(Math.max(0.5, scale.value + delta), 4);
}

// 触摸缩放和滑动切换
let initialDistance = 0;
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  // 双指缩放
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
  // 单指滑动
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}

function handleTouchMove(e) {
  // 双指缩放
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

function handleTouchEnd(e) {
  initialDistance = 0;
  
  // 单指滑动切换照片
  if (touchStartX && e.changedTouches.length === 1) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // 水平滑动距离大于50px且垂直滑动小于30px时切换照片
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
      if (deltaX > 0) {
        prevPhoto();
      } else {
        nextPhoto();
      }
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
}

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('refresh-data', handleRefresh);
});

function handleRefresh() {
  loading.value = true;
  fetchPhotos().then(data => {
    photos.value = data;
    loading.value = false;
  });
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
/* 视图切换动画 */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease;
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}
</style>

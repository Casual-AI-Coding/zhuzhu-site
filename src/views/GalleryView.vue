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
      <EmptyState
        v-else-if="photos.length === 0"
        type="gallery"
        title="还没有照片哦~"
        subtitle="快上传你们的美好瞬间吧"
        actionText="📷 上传照片"
        @action="$router.push('/gallery')"
      />
      
      <!-- View Container with Transition -->
      <Transition name="view-fade" mode="out-in">
        <!-- Masonry Grid - 均匀分布 -->
        <div v-if="viewMode === 'masonry'" key="masonry" class="grid gap-4" :class="gridColsClass">
          <div 
            v-for="(column, colIndex) in masonryColumns" 
            :key="colIndex" 
            class="flex flex-col gap-4"
          >
            <div
              v-for="photo in column"
              :key="photo.id"
              class="card-hover cursor-pointer group"
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
        class="fixed inset-0 z-50 bg-black/95 flex flex-col"
        @click="closeLightbox"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 顶部工具栏 -->
        <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent" @click.stop>
          <div class="flex items-center gap-2">
            <span class="text-white/80 text-sm font-medium">
              📷 {{ currentIndex + 1 }} / {{ photos.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleFavorite"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
              :title="isFavorite ? '取消收藏' : '收藏'"
            >
              <Heart 
                class="w-5 h-5 transition-colors" 
                :class="isFavorite ? 'text-red-500 fill-red-500' : 'text-white/80'" 
              />
            </button>
            <button
              @click="closeLightbox"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="关闭 (ESC)"
            >
              <X class="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>
        
        <!-- 主内容区域 -->
        <div class="flex-1 flex items-center justify-center relative overflow-hidden">
          <!-- 上一张按钮 -->
          <button
            v-if="currentIndex > 0"
            @click.stop="prevPhoto"
            class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronLeft class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          
          <div class="max-w-4xl max-h-full w-full h-full flex items-center justify-center p-2" @click.stop>
            <!-- 错误降级 -->
            <div v-if="lightboxError" class="w-full h-[60vh] flex items-center justify-center bg-gray-800 rounded-lg">
              <div class="text-center">
                <ImageIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p class="text-gray-400">图片加载失败</p>
              </div>
            </div>
            <!-- 正常图片 - 支持缩放 -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div 
                v-show="!lightboxError"
                class="overflow-hidden flex items-center justify-center lightbox-image-container"
                :style="{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }"
              >
                <img
                  :src="selectedPhoto.url"
                  :alt="selectedPhoto.title"
                  class="max-w-full max-h-[65vh] sm:max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  @error="lightboxError = true"
                />
              </div>
            </Transition>
          </div>
          
          <!-- 下一张按钮 -->
          <button
            v-if="currentIndex < photos.length - 1"
            @click.stop="nextPhoto"
            class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronRight class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
        
        <!-- 底部信息栏 -->
        <div class="px-4 py-4 bg-gradient-to-t from-black/50 to-transparent" @click.stop>
          <!-- 进度条 -->
          <div class="w-full max-w-md mx-auto h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <div 
              class="h-full bg-primary rounded-full transition-all duration-300"
              :style="{ width: ((currentIndex + 1) / photos.length * 100) + '%' }"
            ></div>
          </div>
          
          <!-- 图片信息 -->
          <div class="text-center space-y-2 max-w-lg mx-auto">
            <h3 class="text-white font-handwriting text-xl sm:text-2xl">{{ selectedPhoto.title }}</h3>
            <p class="text-white/60 text-sm">{{ formatDate(selectedPhoto.date) }}</p>
            
            <div class="flex items-center justify-center gap-4 flex-wrap">
              <div v-if="selectedPhoto.place" class="flex items-center gap-1 text-white/80 text-sm">
                <MapPin class="w-4 h-4" />
                <span>{{ selectedPhoto.place }}</span>
              </div>
              <div v-if="selectedPhoto.tags && selectedPhoto.tags.length" class="flex gap-1 flex-wrap justify-center">
                <span 
                  v-for="tag in selectedPhoto.tags.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-0.5 bg-white/10 rounded-full text-white/70 text-xs"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <p v-if="selectedPhoto.description" class="text-white/50 text-xs sm:text-sm mt-2 line-clamp-2">
              {{ selectedPhoto.description }}
            </p>
          </div>
          
          <!-- 缩放提示 -->
          <div class="text-center mt-3 text-white/40 text-xs">
            ← → 切换 · 滚轮/双指缩放 · ESC 关闭
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image as ImageIcon, MapPin, ChevronLeft, ChevronRight, Heart, X } from 'lucide-vue-next';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { useGalleryView } from '@/composables/useGalleryView.js';
import PhotoCard from '@/components/PhotoCard.vue';
import SkeletonGrid from '@/components/SkeletonGrid.vue';
import GalleryToolbar from '@/components/GalleryToolbar.vue';
import TimelineGallery from '@/components/TimelineGallery.vue';
import EmptyState from '@/components/EmptyState.vue';

const { formatDate } = useDaysCount();
const { viewMode, groupBy } = useGalleryView();

const photos = ref([]);
const loading = ref(true);
const selectedPhoto = ref(null);
const lightboxError = ref(false);
const currentIndex = ref(0);
const favorites = ref(new Set());

// 响应式窗口宽度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

function updateWindowWidth() {
  windowWidth.value = window.innerWidth;
}

// 根据屏幕宽度计算列数
const columnCount = computed(() => {
  const width = windowWidth.value;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
});

// Grid 列样式
const gridColsClass = computed(() => {
  const cols = columnCount.value;
  return `grid-cols-${cols}`;
});

// 将照片均匀分配到各列（从上到下填充，而非从左到右）
const masonryColumns = computed(() => {
  const cols = columnCount.value;
  const result = Array.from({ length: cols }, () => []);
  
  photos.value.forEach((photo, index) => {
    // 计算当前应该放入哪一列
    const colIndex = index % cols;
    result[colIndex].push(photo);
  });
  
  return result;
});

// 收藏功能
const isFavorite = computed(() => {
  return selectedPhoto.value ? favorites.value.has(selectedPhoto.value.id) : false;
});

function toggleFavorite() {
  if (!selectedPhoto.value) return;
  if (favorites.value.has(selectedPhoto.value.id)) {
    favorites.value.delete(selectedPhoto.value.id);
  } else {
    favorites.value.add(selectedPhoto.value.id);
  }
}

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
  window.addEventListener('resize', updateWindowWidth);
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
  window.removeEventListener('resize', updateWindowWidth);
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

/* Lightbox 图片容器 */
.lightbox-image-container {
  transition: transform 0.15s ease-out;
}

/* 限制文本行数 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

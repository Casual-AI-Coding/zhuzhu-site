<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl sm:text-5xl text-text-main mb-4">
          相册墙
        </h1>
        <p class="text-text-secondary text-lg">
          记录我们的每一个美好瞬间
        </p>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="text-center text-text-secondary">
        加载中...
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
            :src="photo.url"
            :alt="photo.title"
            :title="photo.title"
            :date="formatDate(photo.date)"
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
        @click="selectedPhoto = null"
      >
        <div class="max-w-4xl max-h-full">
          <!-- 错误降级 -->
          <div v-if="lightboxError" class="w-full h-[60vh] flex items-center justify-center bg-gray-800 rounded-lg">
            <div class="text-center">
              <ImageIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p class="text-gray-400">图片加载失败</p>
            </div>
          </div>
          <!-- 正常图片 -->
          <img
            v-show="!lightboxError"
            :src="selectedPhoto.url"
            :alt="selectedPhoto.title"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
            @error="lightboxError = true"
          />
          <p class="text-white text-center mt-4 font-handwriting text-xl">{{ selectedPhoto.title }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Image as ImageIcon } from 'lucide-vue-next';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';
import PhotoCard from '@/components/PhotoCard.vue';

const { formatDate } = useDaysCount();

const photos = ref([]);
const loading = ref(true);
const selectedPhoto = ref(null);
const lightboxError = ref(false);

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
});

function openLightbox(photo) {
  lightboxError.value = false;
  selectedPhoto.value = photo;
}
</script>

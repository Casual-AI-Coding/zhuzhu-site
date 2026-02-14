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
          class="break-inside-avoid rounded-2xl overflow-hidden card-hover cursor-pointer group"
          @click="openLightbox(photo)"
        >
          <div class="relative">
            <img
              :src="photo.url"
              :alt="photo.title"
              class="w-full h-auto object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-4 left-4 right-4">
                <p class="text-white font-handwriting text-lg mb-1">{{ photo.title }}</p>
                <p class="text-white/70 text-sm">{{ formatDate(photo.date) }}</p>
              </div>
            </div>
          </div>
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
          <img
            :src="selectedPhoto.url"
            :alt="selectedPhoto.title"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <p class="text-white text-center mt-4 font-handwriting text-xl">{{ selectedPhoto.title }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchPhotos } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { formatDate } = useDaysCount();

const photos = ref([]);
const loading = ref(true);
const selectedPhoto = ref(null);

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
});

function openLightbox(photo) {
  selectedPhoto.value = photo;
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <p class="text-text-secondary text-lg mb-4 font-handwriting">
          从 {{ formattedStartDate }} 开始
        </p>
        
        <h1 class="font-display text-5xl sm:text-7xl text-text-main mb-6">
          我们在一起
        </h1>
        
        <!-- Days Counter -->
        <div class="relative inline-block">
          <div class="text-8xl sm:text-9xl font-display text-primary font-bold tracking-tight">
            {{ totalDays }}
          </div>
          <div class="text-xl sm:text-2xl text-text-secondary mt-2">
            天
          </div>
        </div>
        
        <!-- Next Milestone -->
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <div class="glass-nav rounded-2xl px-6 py-4">
            <p class="text-text-secondary text-sm mb-1">距离 {{ nextMilestone.days }} 天还有</p>
            <p class="text-2xl font-display text-primary">{{ nextMilestone.until }} 天</p>
          </div>
          
          <div class="glass-nav rounded-2xl px-6 py-4">
            <p class="text-text-secondary text-sm mb-1">距离 {{ nextAnniversary.year }} 周年还有</p>
            <p class="text-2xl font-display text-primary">{{ nextAnniversary.daysUntil }} 天</p>
          </div>
        </div>
      </div>
      
      <!-- Featured Photos Preview -->
      <div class="mt-16">
        <h2 class="font-display text-2xl text-text-main text-center mb-8">精选瞬间</h2>
        
        <div v-if="loading" class="text-center text-text-secondary">
          加载中...
        </div>
        
        <div v-else-if="photos.length === 0" class="text-center text-text-secondary">
          暂无照片
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="photo in photos.slice(0, 3)"
            :key="photo.id"
            class="relative aspect-square rounded-2xl overflow-hidden card-hover cursor-pointer group"
          >
            <img
              :src="photo.url"
              :alt="photo.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p class="absolute bottom-4 left-4 text-white font-handwriting text-lg">
                {{ photo.title }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <RouterLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Image class="w-5 h-5" />
            查看更多照片
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Image } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchPhotos } from '@/lib/notion.js';

const { totalDays, nextMilestone, nextAnniversary, formattedStartDate } = useDaysCount();

const photos = ref([]);
const loading = ref(true);

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
});
</script>

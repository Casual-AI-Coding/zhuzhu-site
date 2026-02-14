<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <p class="text-text-secondary text-lg mb-4 font-handwriting">
          从 {{ formattedStartDate }} 开始
        </p>
        
        <h1 class="font-display text-3xl sm:text-5xl lg:text-7xl text-text-main mb-4 sm:mb-6">
          我们在一起
        </h1>
        
        <!-- Days Counter -->
        <div class="relative inline-block">
          <div class="text-5xl sm:text-7xl lg:text-9xl font-display text-primary font-bold tracking-tight">
            {{ totalDays }}
          </div>
          <div class="text-base sm:text-xl lg:text-2xl text-text-secondary mt-1 sm:mt-2">
            天
          </div>
        </div>
        
        <!-- Next Milestone -->
        <div class="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
            <p class="text-text-secondary text-xs sm:text-sm mb-1">距离 {{ nextMilestone.days }} 天还有</p>
            <p class="text-xl sm:text-2xl font-display text-primary">{{ nextMilestone.until }} 天</p>
          </div>
          
          <div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
            <p class="text-text-secondary text-xs sm:text-sm mb-1">距离 {{ nextAnniversary.year }} 周年还有</p>
            <p class="text-xl sm:text-2xl font-display text-primary">{{ nextAnniversary.daysUntil }} 天</p>
          </div>
        </div>
      </div>
      
      <!-- Featured Photos Preview -->
      <div class="mt-12 sm:mt-16">
        <h2 class="font-display text-xl sm:text-2xl text-text-main text-center mb-6 sm:mb-8">精选瞬间</h2>
        
        <!-- Skeleton Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in featuredCount" :key="i" class="animate-pulse">
            <div class="bg-card rounded-2xl overflow-hidden">
              <div class="aspect-[4/3] bg-gray-200"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="photos.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📷</div>
          <p class="text-text-secondary">暂无照片</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="photo in photos.slice(0, featuredCount)"
            :key="photo.id"
            class="card-hover cursor-pointer"
            @click="$router.push('/gallery')"
          >
            <PhotoCard
              :src="photo.url"
              :alt="photo.title"
              :title="photo.title"
              :date="formatDate(photo.date)"
            />
          </div>
        </div>
        
        <div class="text-center mt-8">
          <RouterLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors"
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
import { ref, onMounted, computed } from 'vue';
import { Image } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchPhotos } from '@/lib/notion.js';
import PhotoCard from '@/components/PhotoCard.vue';

const { totalDays, nextMilestone, nextAnniversary, formattedStartDate, formatDate } = useDaysCount();

const photos = ref([]);
const loading = ref(true);

// 根据屏幕宽度动态显示照片数量
const featuredCount = computed(() => {
  const width = window.innerWidth;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
});

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
});
</script>

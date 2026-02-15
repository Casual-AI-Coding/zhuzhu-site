<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          时光轴
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          我们的恋爱历程
        </p>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="text-center text-text-secondary">
        加载中...
      </div>
      
      <!-- Empty State -->
      <div v-else-if="events.length === 0" class="text-center text-text-secondary">
        暂无时光轴数据
      </div>
      
      <!-- Timeline -->
      <div v-else class="relative">
        <!-- Timeline Line -->
        <div class="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-border sm:-translate-x-1/2"></div>
        
        <!-- Timeline Items -->
        <div class="space-y-8">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="relative flex items-start gap-4 sm:gap-8"
            :class="index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'"
          >
            <!-- Icon -->
            <div class="absolute left-4 sm:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary flex items-center justify-center z-10 text-lg">
              {{ event.icon || '💕' }}
            </div>
            
            <!-- Content Card -->
            <div class="ml-12 sm:ml-0 sm:w-1/2" :class="index % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'">
              <div class="glass-nav rounded-2xl p-6 card-hover">
                <div class="flex items-center gap-2 mb-2" :class="index % 2 === 0 ? 'sm:justify-end' : ''">
                  <span :class="importanceClasses[event.importance]">{{ importanceLabels[event.importance] }}</span>
                </div>
                <p class="text-primary font-handwriting text-lg mb-1">{{ formatDate(event.date) }}</p>
                <h3 class="font-display text-xl text-text-main mb-2">{{ event.title }}</h3>
                <p class="text-text-secondary text-sm">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchTimeline } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { formatDate } = useDaysCount();

const events = ref([]);
const loading = ref(true);

const importanceLabels = {
  '高': '❤️ 重要',
  '中': '💫 纪念',
};

const importanceClasses = {
  '高': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-600',
  '中': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600',
};

onMounted(async () => {
  events.value = await fetchTimeline();
  loading.value = false;
  window.addEventListener('refresh-data', handleRefresh);
});

function handleRefresh() {
  loading.value = true;
  fetchTimeline().then(data => {
    events.value = data;
    loading.value = false;
  });
}

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl sm:text-5xl text-text-main mb-4">
          纪念日
        </h1>
        <p class="text-text-secondary text-lg">
          记录我们共同的每一个重要时刻
        </p>
      </div>
      
      <!-- Days Counter Card -->
      <div class="glass-nav rounded-3xl p-8 mb-12 text-center">
        <p class="text-text-secondary mb-2">我们在一起已经</p>
        <div class="text-6xl sm:text-7xl font-display text-primary font-bold mb-2">
          {{ totalDays }}
        </div>
        <p class="text-text-secondary">天</p>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="text-center text-text-secondary">
        加载中...
      </div>
      
      <!-- Empty State -->
      <div v-else-if="anniversaries.length === 0" class="text-center text-text-secondary">
        暂无纪念日数据
      </div>
      
      <!-- Anniversaries List -->
      <div v-else class="space-y-4">
        <div
          v-for="anniversary in anniversaries"
          :key="anniversary.id"
          class="glass-nav rounded-2xl p-6 card-hover"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="font-display text-xl text-text-main">{{ anniversary.title }}</h3>
                <p class="text-text-secondary text-sm">{{ formatDate(anniversary.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-display text-primary">{{ getDaysUntil(anniversary.date) }}</p>
              <p class="text-text-secondary text-sm">天后</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Heart } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchAnniversaries } from '@/lib/notion.js';

const { totalDays, formatDate, getDaysUntil } = useDaysCount();

const anniversaries = ref([]);
const loading = ref(true);

onMounted(async () => {
  anniversaries.value = await fetchAnniversaries();
  loading.value = false;
});
</script>

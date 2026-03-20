<template>
  <div class="month-detail">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h4 class="font-medium text-text-main">
        {{ year }}年{{ month }}月
        <span class="text-text-secondary text-sm">({{ wishes.length }}个愿望)</span>
      </h4>
      <button
        @click="$emit('close')"
        class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Wishes List -->
    <div v-if="wishes.length > 0" class="space-y-3 max-h-[400px] overflow-y-auto">
      <div
        v-for="wish in sortedWishes"
        :key="wish.id"
        class="p-3 bg-background rounded-xl hover:bg-primary/5 transition-colors"
      >
        <div class="flex items-start gap-2">
          <span class="text-lg">{{ categoryEmoji(wish.category) }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-text-main text-sm">{{ wish.title }}</p>
            <p v-if="wish.description" class="text-xs text-text-secondary mt-0.5 line-clamp-2">
              {{ wish.description }}
            </p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" />
                {{ formatDate(wish.completedDate) }}
              </span>
              <span 
                v-if="wish.priority !== '中'"
                class="text-[10px] px-1.5 py-0.5 rounded-full"
                :class="priorityClass(wish.priority)"
              >
                {{ wish.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-text-secondary">
      <p>该月没有完成的愿望</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X, CheckCircle2 } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';

const props = defineProps({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  wishes: {
    type: Array,
    required: true,
  },
});

defineEmits(['close']);

const { formatDate } = useDaysCount();

// Sort wishes by completed date
const sortedWishes = computed(() => {
  return [...props.wishes].sort((a, b) => {
    return new Date(b.completedDate) - new Date(a.completedDate);
  });
});

function categoryEmoji(category) {
  const emojis = {
    '旅行': '✈️',
    '美食': '🍽️',
    '体验': '🎯',
    '家居': '🏠',
    '其他': '✨',
  };
  return emojis[category] || '✨';
}

function priorityClass(priority) {
  const classes = {
    '高': 'bg-red-100 text-red-600',
    '中': 'bg-yellow-100 text-yellow-600',
    '低': 'bg-gray-100 text-gray-600',
  };
  return classes[priority] || 'bg-gray-100 text-gray-600';
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
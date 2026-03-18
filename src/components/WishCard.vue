<template>
  <div
    class="wish-card glass-nav rounded-2xl p-4 sm:p-5 transition-all duration-300"
    :class="{
      'wish-card--completed': wish.status === '已完成',
      'wish-card--high-priority': wish.priority === '高' && wish.status === '进行中',
    }"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-text-main text-base sm:text-lg truncate">
          {{ wish.title }}
        </h3>
        <p v-if="wish.targetDate" class="text-text-secondary text-xs sm:text-sm mt-0.5">
          目标: {{ formatTargetDate(wish.targetDate) }}
        </p>
      </div>
      
      <!-- Priority Badge -->
      <span
        v-if="wish.priority"
        class="priority-badge px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
        :class="priorityClass"
      >
        {{ wish.priority }}
      </span>
    </div>

    <!-- Description -->
    <p
      v-if="wish.description"
      class="text-text-secondary text-sm mb-3 line-clamp-2"
    >
      {{ wish.description }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <!-- Category -->
      <span
        class="category-badge px-2.5 py-1 rounded-full text-xs"
        :class="categoryClass"
      >
        {{ categoryEmoji }} {{ wish.category }}
      </span>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Complete Button -->
        <button
          v-if="wish.status === '进行中'"
          @click.stop="handleComplete"
          class="action-btn w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-green-500/20 text-text-secondary hover:text-green-500"
          title="标记完成"
        >
          <Check class="w-4 h-4" />
        </button>

        <!-- Edit Button -->
        <button
          @click.stop="handleEdit"
          class="action-btn w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-primary/20 text-text-secondary hover:text-primary"
          title="编辑"
        >
          <Pencil class="w-4 h-4" />
        </button>

        <!-- Delete Button -->
        <button
          @click.stop="handleDelete"
          class="action-btn w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20 text-text-secondary hover:text-red-500"
          title="删除"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Completed Date -->
    <div
      v-if="wish.status === '已完成' && wish.completedDate"
      class="completed-badge mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-green-500"
    >
      <CheckCircle2 class="w-4 h-4" />
      <span class="text-xs">完成于 {{ formatDate(wish.completedDate) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Check, Pencil, Trash2, CheckCircle2 } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';

const props = defineProps({
  wish: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['complete', 'edit', 'delete']);

const { formatDate } = useDaysCount();

// Category styling
const categoryEmoji = computed(() => {
  const emojis = {
    '旅行': '✈️',
    '美食': '🍽️',
    '体验': '🎯',
    '家居': '🏠',
    '其他': '✨',
  };
  return emojis[props.wish.category] || '✨';
});

const categoryClass = computed(() => {
  const classes = {
    '旅行': 'bg-blue-500/10 text-blue-500',
    '美食': 'bg-orange-500/10 text-orange-500',
    '体验': 'bg-purple-500/10 text-purple-500',
    '家居': 'bg-green-500/10 text-green-500',
    '其他': 'bg-gray-500/10 text-gray-500',
  };
  return classes[props.wish.category] || 'bg-gray-500/10 text-gray-500';
});

// Priority styling
const priorityClass = computed(() => {
  const classes = {
    '高': 'bg-red-500/20 text-red-500',
    '中': 'bg-yellow-500/20 text-yellow-600',
    '低': 'bg-gray-500/20 text-gray-500',
  };
  return classes[props.wish.priority] || 'bg-gray-500/20 text-gray-500';
});

// Format target date
function formatTargetDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

// Handlers
function handleComplete() {
  emit('complete', props.wish.id);
}

function handleEdit() {
  emit('edit', props.wish);
}

function handleDelete() {
  emit('delete', props.wish.id);
}
</script>

<style scoped>
.wish-card {
  position: relative;
  overflow: hidden;
}

.wish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.wish-card--completed {
  opacity: 0.8;
}

.wish-card--high-priority {
  border-left: 3px solid #ef4444;
}

.action-btn {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.wish-card:hover .action-btn {
  opacity: 1;
  transform: scale(1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Completed animation */
@keyframes completeFlash {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.wish-card--completed {
  animation: completeFlash 0.6s ease-out;
}
</style>
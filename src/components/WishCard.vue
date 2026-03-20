<template>
  <div
    class="wish-card relative rounded-2xl overflow-hidden transition-all duration-300"
    :class="{
      'wish-card--completed': wish.status === '已完成',
      'wish-card--in-progress': wish.status === '进行中',
      'wish-card--high-priority': wish.priority === '高',
    }"
  >
    <!-- 背景装饰 -->
    <div class="wish-bg absolute inset-0 opacity-50" :class="bgGradientClass" />
    
    <!-- 完成后的庆祝装饰 -->
    <div v-if="wish.status === '已完成'" class="celebration-decoration absolute top-2 right-2">
      <span class="text-2xl">✨</span>
    </div>

    <!-- 内容 -->
    <div class="relative z-10 p-5">
      <!-- 顶部：分类和优先级 -->
      <div class="flex items-center gap-2 mb-3">
        <span class="category-tag px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
          {{ categoryEmoji }} {{ wish.category }}
        </span>
        <span 
          v-if="wish.priority !== '中'"
          class="priority-tag px-2 py-0.5 rounded-full text-xs font-medium"
          :class="priorityClass"
        >
          {{ wish.priority }}
        </span>
        <span v-if="wish.targetDate" class="target-date text-xs text-white/80 flex items-center gap-1">
          <Calendar class="w-3 h-3" />
          {{ formatTargetDate(wish.targetDate) }}
        </span>
      </div>

      <!-- 标题 -->
      <h3 class="wish-title font-display text-xl sm:text-2xl text-white mb-2 leading-tight">
        {{ wish.title }}
      </h3>

      <!-- 描述 -->
      <p
        v-if="wish.description"
        class="wish-description text-sm text-white/80 mb-4 line-clamp-2"
      >
        {{ wish.description }}
      </p>

      <!-- 底部：状态和操作 -->
      <div class="flex items-center justify-between mt-4">
        <!-- 状态徽章 -->
        <div class="flex items-center gap-2">
          <span
            class="status-badge px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
            :class="statusClass"
          >
            <span v-if="wish.status === '进行中'">💫</span>
            <span v-else>🎉</span>
            {{ wish.status }}
          </span>
          
          <!-- 完成日期 -->
          <span v-if="wish.status === '已完成' && wish.completedDate" class="text-xs text-white/70">
            {{ formatDate(wish.completedDate) }}
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-1">
          <!-- 完成按钮 -->
          <button
            v-if="wish.status === '进行中'"
            @click.stop="handleComplete"
            class="complete-btn w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white shadow-lg shadow-green-500/40 hover:bg-green-400 hover:scale-110 transition-all"
            title="标记完成"
          >
            <Check class="w-5 h-5" />
          </button>

          <!-- 编辑 -->
          <button
            @click.stop="handleEdit"
            class="action-btn w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/30 text-white/80 hover:text-white transition-all"
            title="编辑"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>

          <!-- 删除 -->
          <button
            @click.stop="handleDelete"
            class="action-btn w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-500/60 text-white/80 hover:text-white transition-all"
            title="删除"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 完成后的印章效果 -->
    <div
      v-if="wish.status === '已完成'"
      class="completed-stamp absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center rotate-[-15deg]"
    >
      <span class="text-white/30 font-bold text-lg">已完成</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Check, Pencil, Trash2, Calendar } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';

const props = defineProps({
  wish: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['complete', 'edit', 'delete']);

const { formatDate } = useDaysCount();

// 背景渐变
const bgGradientClass = computed(() => {
  const gradients = {
    '旅行': 'bg-gradient-to-br from-blue-500 to-cyan-400',
    '美食': 'bg-gradient-to-br from-orange-500 to-amber-400',
    '体验': 'bg-gradient-to-br from-purple-500 to-pink-400',
    '家居': 'bg-gradient-to-br from-green-500 to-emerald-400',
    '其他': 'bg-gradient-to-br from-primary to-pink-400',
  };
  return gradients[props.wish.category] || 'bg-gradient-to-br from-primary to-pink-400';
});

// 分类表情
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

// 优先级样式
const priorityClass = computed(() => {
  const classes = {
    '高': 'bg-red-500/80 text-white',
    '中': 'bg-yellow-500/80 text-white',
    '低': 'bg-gray-500/60 text-white',
  };
  return classes[props.wish.priority] || 'bg-gray-500/60 text-white';
});

// 状态样式
const statusClass = computed(() => {
  return props.wish.status === '已完成'
    ? 'bg-green-500/80 text-white'
    : 'bg-white/20 text-white/90';
});

// 格式化目标日期
function formatTargetDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// 事件处理
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.wish-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.wish-bg {
  transition: opacity 0.3s ease;
}

.wish-card:hover .wish-bg {
  opacity: 0.6;
}

.wish-card--completed .wish-bg {
  opacity: 0.4;
}

.wish-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wish-card--completed {
  opacity: 0.9;
}

.wish-card--completed .wish-title {
  text-decoration: line-through;
  text-decoration-color: rgba(255, 255, 255, 0.4);
  text-decoration-thickness: 2px;
}

.wish-card--high-priority {
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2), 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.wish-card--high-priority:hover {
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.25), 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.action-btn {
  opacity: 0.7;
  transform: scale(0.9);
  transition: all 0.2s ease;
}

.complete-btn {
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
}

.wish-card:hover .action-btn,
.wish-card:hover .complete-btn {
  opacity: 1;
  transform: scale(1);
}

.action-btn:hover {
  transform: scale(1.1) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.completed-stamp {
  pointer-events: none;
}

/* 庆祝动画 */
@keyframes sparkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.celebration-decoration {
  animation: sparkle 2s ease-in-out infinite;
}
</style>
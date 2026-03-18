<template>
  <div class="wish-empty-state text-center py-12 px-4">
    <div class="empty-icon text-6xl mb-4">
      {{ icon }}
    </div>
    <h3 class="text-text-main text-lg font-medium mb-2">
      {{ title }}
    </h3>
    <p class="text-text-secondary text-sm mb-6 max-w-xs mx-auto">
      {{ description }}
    </p>
    <button
      v-if="showAddButton"
      @click="$emit('add')"
      class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
    >
      <Plus class="w-4 h-4" />
      添加愿望
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Plus } from 'lucide-vue-next';

const props = defineProps({
  type: {
    type: String,
    default: 'empty', // 'empty' | 'completed' | 'filtered'
  },
});

defineEmits(['add']);

const icon = computed(() => {
  const icons = {
    empty: '🌟',
    completed: '🎉',
    filtered: '🔍',
  };
  return icons[props.type] || '🌟';
});

const title = computed(() => {
  const titles = {
    empty: '还没有愿望',
    completed: '还没有完成的愿望',
    filtered: '没有匹配的愿望',
  };
  return titles[props.type] || '还没有愿望';
});

const description = computed(() => {
  const descriptions = {
    empty: '写下你们想一起完成的心愿吧',
    completed: '完成的愿望会显示在这里',
    filtered: '试试调整筛选条件',
  };
  return descriptions[props.type] || '写下你们想一起完成的心愿吧';
});

const showAddButton = computed(() => {
  return props.type === 'empty' || props.type === 'filtered';
});
</script>

<style scoped>
.empty-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
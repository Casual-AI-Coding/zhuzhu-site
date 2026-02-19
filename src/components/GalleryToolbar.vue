<template>
  <div class="flex items-center justify-between mb-6">
    <!-- 左侧：视图切换 -->
    <div class="flex items-center gap-2">
      <RippleButton
        @click="$emit('update:viewMode', 'masonry')"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="viewMode === 'masonry'
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        <Grid3X3 class="w-4 h-4 inline-block mr-1" />
        瀑布流
      </RippleButton>
      <RippleButton
        @click="$emit('update:viewMode', 'timeline')"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="viewMode === 'timeline'
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        <List class="w-4 h-4 inline-block mr-1" />
        时间线
      </RippleButton>
    </div>

    <!-- 右侧：聚合级别切换（仅时间线视图显示） -->
    <div v-if="viewMode === 'timeline'" class="flex items-center gap-2">
      <RippleButton
        v-for="level in groupLevels"
        :key="level.value"
        @click="$emit('update:groupBy', level.value)"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="groupBy === level.value
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-primary/10 text-text-secondary'"
      >
        {{ level.label }}
      </RippleButton>
    </div>
  </div>
</template>

<script setup>
import { Grid3X3, List } from 'lucide-vue-next';
import RippleButton from './RippleButton.vue';

defineProps({
  viewMode: { type: String, default: 'masonry' },
  groupBy: { type: String, default: 'day' },
});

defineEmits(['update:viewMode', 'update:groupBy']);

const groupLevels = [
  { value: 'day', label: '日' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];
</script>

<template>
  <div class="timeline-gallery space-y-6">
    <div
      v-for="[dateKey, datePhotos] in groupedPhotos"
      :key="dateKey"
      class="timeline-group"
    >
      <!-- 日期标签 -->
      <div class="flex items-center gap-4 mb-3">
        <div class="text-text-main font-display text-lg min-w-[120px]">
          {{ dateKey }}
        </div>
        <div class="flex-1 h-px bg-border/50 dark:bg-border-dark/50"></div>
        <div class="text-text-secondary text-sm">
          {{ datePhotos.length }} 张
        </div>
      </div>
      
      <!-- 照片网格 -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 pl-4">
        <div
          v-for="photo in datePhotos"
          :key="photo.id"
          class="aspect-square rounded-lg overflow-hidden cursor-pointer group"
          @click="$emit('select', photo)"
        >
          <img
            :src="photo.thumbnailUrl || photo.url"
            :alt="photo.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  photos: { type: Array, default: () => [] },
  groupBy: { type: String, default: 'day' },
});

defineEmits(['select']);

// 按日期分组照片
const groupedPhotos = computed(() => {
  const groups = {};
  
  props.photos.forEach(photo => {
    if (!photo.date) return;
    
    const date = new Date(photo.date);
    let key;
    
    switch (props.groupBy) {
      case 'day':
        key = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        break;
      case 'month':
        key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        break;
      case 'year':
        key = `${date.getFullYear()}年`;
        break;
      default:
        key = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(photo);
  });
  
  // 按日期倒序排列
  return Object.entries(groups).sort((a, b) => {
    const dateA = parseDateKey(a[0]);
    const dateB = parseDateKey(b[0]);
    return dateB - dateA;
  });
});

// 解析日期键用于排序
function parseDateKey(key) {
  const match = key.match(/(\d+)年(?:(\d+)月)?(?:(\d+)日)?/);
  if (!match) return 0;
  
  const year = parseInt(match[1]) || 0;
  const month = parseInt(match[2]) || 1;
  const day = parseInt(match[3]) || 1;
  
  return new Date(year, month - 1, day).getTime();
}
</script>

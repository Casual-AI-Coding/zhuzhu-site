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
          class="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
          @click="$emit('select', photo)"
        >
          <!-- 图片 -->
          <img
            v-if="!imgErrors[photo.id]"
            :src="photo.thumbnailUrl || photo.url"
            :alt="photo.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            @error="imgErrors[photo.id] = true"
          />
          
          <!-- 加载失败占位 -->
          <div 
            v-else 
            class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
          >
            <ImageIcon class="w-6 h-6 text-gray-400" />
          </div>
          
          <!-- 悬停信息层 -->
          <div 
            class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2"
          >
            <p class="text-white text-xs truncate">{{ photo.title }}</p>
            <p class="text-white/70 text-[10px]">{{ formatDate(photo.date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { Image as ImageIcon } from 'lucide-vue-next';

const props = defineProps({
  photos: { type: Array, default: () => [] },
  groupBy: { type: String, default: 'day' },
});

defineEmits(['select']);

// 图片加载错误状态
const imgErrors = reactive({});

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

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

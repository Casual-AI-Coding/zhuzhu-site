<template>
  <div class="empty-state text-center py-16 px-4">
    <!-- 插画区域 -->
    <div class="illustration mb-6">
      <!-- 相册页面 - 拥抱的情侣 -->
      <svg v-if="type === 'gallery'" viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
        <!-- 背景圆 -->
        <circle cx="100" cy="100" r="90" fill="#FFF5F0"/>
        <!-- 心形 -->
        <path d="M100 60 C80 40, 50 50, 50 80 C50 110, 100 150, 100 150 C100 150, 150 110, 150 80 C150 50, 120 40, 100 60" fill="#FF6B6B"/>
        <!-- 男生 -->
        <circle cx="70" cy="110" r="18" fill="#D4A574"/>
        <rect x="58" y="128" width="24" height="40" rx="4" fill="#D4A574"/>
        <!-- 女生 -->
        <circle cx="130" cy="110" r="16" fill="#E8C9A8"/>
        <rect x="120" y="126" width="20" height="36" rx="4" fill="#E8C9A8"/>
        <!-- 爱心 -->
        <path d="M100 85 C95 75, 85 75, 85 82 C85 90, 100 105, 100 105 C100 105, 115 90, 115 82 C115 75, 105 75, 100 85" fill="#FFF"/>
      </svg>
      
      <!-- 时光轴页面 - 时钟+心形 -->
      <svg v-else-if="type === 'timeline'" viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
        <circle cx="100" cy="100" r="90" fill="#FFF5F0"/>
        <!-- 时钟 -->
        <circle cx="100" cy="90" r="50" fill="none" stroke="#D4A574" stroke-width="4"/>
        <circle cx="100" cy="90" r="4" fill="#D4A574"/>
        <!-- 时针 -->
        <line x1="100" y1="90" x2="100" y2="60" stroke="#D4A574" stroke-width="4" stroke-linecap="round"/>
        <!-- 分针 -->
        <line x1="100" y1="90" x2="125" y2="90" stroke="#D4A574" stroke-width="3" stroke-linecap="round"/>
        <!-- 心形 -->
        <path d="M100 150 C90 140, 75 145, 75 155 C75 165, 100 180, 100 180 C100 180, 125 165, 125 155 C125 145, 110 140, 100 150" fill="#FF6B6B"/>
      </svg>
      
      <!-- 纪念日页面 - 日历+心形 -->
      <svg v-else-if="type === 'anniversary'" viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
        <circle cx="100" cy="100" r="90" fill="#FFF5F0"/>
        <!-- 日历 -->
        <rect x="55" y="50" width="90" height="100" rx="8" fill="white" stroke="#D4A574" stroke-width="3"/>
        <rect x="55" y="50" width="90" height="25" rx="8" fill="#D4A574"/>
        <rect x="55" y="65" width="90" height="10" fill="#D4A574"/>
        <!-- 日期 -->
        <text x="100" y="115" text-anchor="middle" font-size="28" font-weight="bold" fill="#D4A574">?</text>
        <!-- 心形 -->
        <path d="M100 160 C92 152, 80 155, 80 163 C80 172, 100 185, 100 185 C100 185, 120 172, 120 163 C120 155, 108 152, 100 160" fill="#FF6B6B"/>
      </svg>
      
      <!-- 留言板页面 - 信封 -->
      <svg v-else-if="type === 'guestbook'" viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
        <circle cx="100" cy="100" r="90" fill="#FFF5F0"/>
        <!-- 信封 -->
        <rect x="50" y="60" width="100" height="80" rx="4" fill="white" stroke="#D4A574" stroke-width="3"/>
        <polyline points="50,60 100,100 150,60" fill="none" stroke="#D4A574" stroke-width="3"/>
        <!-- 爱心 -->
        <path d="M100 120 C92 112, 80 115, 80 123 C80 132, 100 145, 100 145 C100 145, 120 132, 120 123 C120 115, 108 112, 100 120" fill="#FF6B6B"/>
      </svg>
      
      <!-- 默认 - 通用空状态 -->
      <svg v-else viewBox="0 0 200 200" class="empty-illustration mx-auto w-32 h-32">
        <circle cx="100" cy="100" r="90" fill="#FFF5F0"/>
        <path d="M100 60 C80 40, 50 50, 50 80 C50 110, 100 150, 100 150 C100 150, 150 110, 150 80 C150 50, 120 40, 100 60" fill="#FF6B6B"/>
      </svg>
    </div>
    
    <!-- 标题 -->
    <h3 class="text-lg font-display text-text-main mb-2">
      {{ title }}
    </h3>
    
    <!-- 副标题 -->
    <p class="text-text-secondary text-sm mb-6 max-w-xs mx-auto">
      {{ subtitle }}
    </p>
    
    <!-- 引导按钮 -->
    <button
      v-if="actionText"
      @click="$emit('action')"
      class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['gallery', 'timeline', 'anniversary', 'guestbook', 'default'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
});

defineEmits(['action']);
</script>

<style scoped>
.empty-illustration {
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

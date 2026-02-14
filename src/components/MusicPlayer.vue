<template>
  <div class="music-player fixed z-[10000] group" :style="{ top: '140px', right: '20px' }">
    <!-- 悬停/点击展开的控制面板 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div 
        v-show="showControls"
        class="absolute bottom-0 right-16 sm:right-18 bg-card/95 dark:bg-card-dark/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-border/30 dark:border-border-dark/30"
        @mouseenter="showControls = true"
        @mouseleave="showControls = false"
      >
        <!-- 歌曲信息 -->
        <div class="min-w-[160px] max-w-[200px] mb-3">
          <p class="text-sm font-medium text-text-main dark:text-text-main-dark truncate">
            {{ currentSong?.title || '未加载' }}
          </p>
          <p class="text-xs text-text-secondary dark:text-text-secondary-dark truncate">
            {{ currentSong?.artist || '点击播放' }}
          </p>
        </div>

        <!-- 播放控制 -->
        <div class="flex items-center justify-center gap-3">
          <button
            @click.stop="prev"
            class="p-2 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
            :disabled="playlist.length === 0"
          >
            <SkipBack class="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
          
          <button
            @click.stop="toggle"
            class="p-3 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
            :disabled="playlist.length === 0"
          >
            <Pause v-if="isPlaying" class="w-5 h-5" />
            <Play v-else class="w-5 h-5" />
          </button>
          
          <button
            @click.stop="next"
            class="p-2 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
            :disabled="playlist.length === 0"
          >
            <SkipForward class="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>

        <!-- 进度条 -->
        <div v-if="playlist.length > 0" class="mt-3">
          <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer" @click="seekTo">
            <div 
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 唱片机主体 -->
    <div 
      class="relative w-14 h-14 sm:w-16 sm:h-16 cursor-pointer"
      @click="handleClick"
      @mouseenter="showControls = true"
    >
      <!-- 旋转底盘 -->
      <div 
        class="absolute inset-0 rounded-full shadow-xl transition-transform duration-500"
        :class="{ 'animate-spin-slow': isPlaying }"
        style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a);"
      >
        <!-- 唱片纹理 -->
        <div class="absolute inset-1 rounded-full overflow-hidden">
          <div class="w-full h-full" style="background: linear-gradient(145deg, #1a1a1a, #0a0a0a);">
            <!-- 音轨纹理 -->
            <div class="absolute inset-2 rounded-full border-2" style="border-color: rgba(100,100,100,0.3)"></div>
            <div class="absolute inset-4 rounded-full border-2" style="border-color: rgba(100,100,100,0.2)"></div>
            <div class="absolute inset-6 rounded-full border-2" style="border-color: rgba(100,100,100,0.1)"></div>
          </div>
        </div>
        
        <!-- 中心标签 -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-lg" style="background: var(--color-primary, #D4A574);"></div>
        </div>
      </div>
    </div>

    <!-- 隐藏的 audio 元素 -->
    <audio
      ref="audioEl"
      :src="currentSong?.url"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-vue-next';
import { useMusicPlayer } from '@/composables/useMusicPlayer.js';

const showControls = ref(false);
const audioEl = ref(null);

const {
  playlist,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  toggle,
  next,
  prev,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  setAudioRef,
  formatTime,
} = useMusicPlayer();

const progress = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

function handleClick() {
  if (showControls.value) {
    // 如果控制面板显示，点击唱片机则播放/暂停
    toggle();
  } else {
    // 否则显示控制面板
    showControls.value = true;
  }
}

function seekTo(event) {
  if (!audioEl.value || !duration.value) return;
  const rect = event.target.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioEl.value.currentTime = percent * duration.value;
}

onMounted(() => {
  if (audioEl.value) {
    setAudioRef(audioEl.value);
  }
});
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>

<template>
  <div class="photo-carousel relative" @mouseenter="pause" @mouseleave="resume">
    <!-- Carousel Container -->
    <div class="carousel-wrapper overflow-hidden rounded-2xl">
      <TransitionGroup name="carousel-fade" tag="div" class="carousel-track">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="carousel-slide"
          :class="{ 'is-active': index === currentIndex }"
        >
          <div 
            class="slide-content aspect-[16/9] sm:aspect-[16/10] relative cursor-pointer"
            @click="openGallery"
          >
            <img
              :src="photo.thumbnailUrl || photo.url"
              :alt="photo.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <!-- Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <h3 class="font-display text-lg sm:text-xl mb-1">{{ photo.title }}</h3>
              <p class="text-white/80 text-sm">{{ formatDate(photo.date) }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
    
    <!-- Navigation Arrows -->
    <button
      v-if="photos.length > 1"
      @click="prev"
      class="carousel-nav prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
      aria-label="上一张"
    >
      <ChevronLeft class="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
    
    <button
      v-if="photos.length > 1"
      @click="next"
      class="carousel-nav next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
      aria-label="下一张"
    >
      <ChevronRight class="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
    
    <!-- Indicators -->
    <div v-if="photos.length > 1" class="carousel-indicators absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(_, index) in photos"
        :key="index"
        @click="goTo(index)"
        class="indicator w-2 h-2 rounded-full transition-all"
        :class="index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'"
        :aria-label="`跳转到第 ${index + 1} 张`"
      ></button>
    </div>
    
    <!-- Progress Bar -->
    <div v-if="photos.length > 1 && isPlaying" class="carousel-progress absolute bottom-0 left-0 right-0 h-1 bg-white/20">
      <div 
        class="progress-bar h-full bg-primary transition-all"
        :style="{ width: progressWidth + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  photos: { type: Array, required: true },
  autoPlay: { type: Boolean, default: true },
  interval: { type: Number, default: 5000 },
  formatDate: { type: Function, required: true },
});

const emit = defineEmits(['open-gallery']);

const currentIndex = ref(0);
const isPlaying = ref(props.autoPlay);
const progress = ref(0);
let timer = null;
let progressTimer = null;

// Progress width for the progress bar
const progressWidth = computed(() => {
  return (progress.value / props.interval) * 100;
});

// Navigation methods
function next() {
  if (props.photos.length <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % props.photos.length;
  resetProgress();
}

function prev() {
  if (props.photos.length <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length;
  resetProgress();
}

function goTo(index) {
  currentIndex.value = index;
  resetProgress();
}

function openGallery() {
  emit('open-gallery');
}

// Auto-play controls
function pause() {
  isPlaying.value = false;
  stopTimers();
}

function resume() {
  if (props.autoPlay) {
    isPlaying.value = true;
    startTimers();
  }
}

function resetProgress() {
  progress.value = 0;
  if (isPlaying.value) {
    stopTimers();
    startTimers();
  }
}

function startTimers() {
  // Progress timer (updates every 50ms)
  progressTimer = setInterval(() => {
    progress.value += 50;
    if (progress.value >= props.interval) {
      progress.value = 0;
      next();
    }
  }, 50);
}

function stopTimers() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      next();
    } else {
      prev();
    }
  }
}

onMounted(() => {
  if (props.autoPlay && props.photos.length > 1) {
    startTimers();
  }
  
  // Add touch listeners
  const carousel = document.querySelector('.photo-carousel');
  if (carousel) {
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
});

onUnmounted(() => {
  stopTimers();
  
  const carousel = document.querySelector('.photo-carousel');
  if (carousel) {
    carousel.removeEventListener('touchstart', handleTouchStart);
    carousel.removeEventListener('touchend', handleTouchEnd);
  }
});

// Reset when photos change
watch(() => props.photos, () => {
  currentIndex.value = 0;
  resetProgress();
});
</script>

<style scoped>
.photo-carousel {
  position: relative;
  width: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
}

.carousel-track {
  position: relative;
  width: 100%;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-slide.is-active {
  position: relative;
  opacity: 1;
}

.slide-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
}

/* Ken Burns Effect */
.carousel-slide.is-active img {
  animation: kenBurns 5s ease-out forwards;
}

/* Different Ken Burns directions for variety */
.carousel-slide.is-active:nth-child(odd) img {
  animation-name: kenBurnsRight;
}

.carousel-slide.is-active:nth-child(3n) img {
  animation-name: kenBurnsZoom;
}

@keyframes kenBurns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.08);
  }
}

@keyframes kenBurnsRight {
  0% {
    transform: scale(1) translateX(0);
  }
  100% {
    transform: scale(1.08) translateX(-2%);
  }
}

@keyframes kenBurnsZoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

/* Carousel fade animation */
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.5s ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

/* Navigation buttons */
.carousel-nav {
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.photo-carousel:hover .carousel-nav {
  opacity: 1;
}

.carousel-nav:active {
  transform: translateY(-50%) scale(0.95);
}

/* Indicators */
.indicator {
  transition: all 0.3s ease;
}

/* Progress bar */
.carousel-progress {
  border-radius: 0 0 1rem 1rem;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.05s linear;
}
</style>

<template>
  <div class="flip-clock">
    <div v-for="(unit, index) in timeUnits" :key="unit.label" class="flip-unit">
      <div class="flip-label">{{ unit.label }}</div>
      <div class="flip-card">
        <div 
          class="flip-card-inner" 
          :class="{ 'is-flipping': isFlipping[index] }"
        >
          <!-- 上半部分 - 当前值 -->
          <div class="flip-card-top">
            <span>{{ formatNumber(unit.current) }}</span>
          </div>
          <!-- 下半部分 - 新值 -->
          <div class="flip-card-bottom">
            <span>{{ formatNumber(unit.next) }}</span>
          </div>
          <!-- 翻转动画层 -->
          <div class="flip-card-flip flip-card-flip-top">
            <span>{{ formatNumber(unit.current) }}</span>
          </div>
          <div class="flip-card-flip flip-card-flip-bottom">
            <span>{{ formatNumber(unit.next) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  days: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  seconds: { type: Number, default: 0 },
});

const prevValues = ref({
  days: props.days,
  hours: props.hours,
  minutes: props.minutes,
  seconds: props.seconds,
});

const isFlipping = ref([false, false, false, false]);

const timeUnits = computed(() => [
  { label: '天', current: props.days, next: prevValues.value.days },
  { label: '时', current: props.hours, next: prevValues.value.hours },
  { label: '分', current: props.minutes, next: prevValues.value.minutes },
  { label: '秒', current: props.seconds, next: prevValues.value.seconds },
]);

// 监听数值变化触发动画
watch(() => props, (newVal) => {
  const keys = ['days', 'hours', 'minutes', 'seconds'];
  keys.forEach((key, index) => {
    if (newVal[key] !== prevValues.value[key]) {
      isFlipping.value[index] = true;
      setTimeout(() => {
        prevValues.value[key] = newVal[key];
        isFlipping.value[index] = false;
      }, 600);
    }
  });
}, { deep: true });

function formatNumber(num) {
  return String(num).padStart(2, '0');
}
</script>

<style scoped>
.flip-clock {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: flex-end;
}

.flip-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.flip-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.flip-card {
  width: 3rem;
  height: 3.5rem;
  perspective: 400px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.flip-card-top,
.flip-card-bottom,
.flip-card-flip {
  position: absolute;
  width: 100%;
  height: 50%;
  left: 0;
  overflow: hidden;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.flip-card-top {
  top: 0;
  border-radius: 0.375rem 0.375rem 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  align-items: flex-end;
  padding-bottom: 0.125rem;
}

.flip-card-bottom {
  bottom: 0;
  border-radius: 0 0 0.375rem 0.375rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  align-items: flex-start;
  padding-top: 0.125rem;
}

.flip-card-flip {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
}

.flip-card-flip-top {
  top: 0;
  border-radius: 0.375rem 0.375rem 0 0;
  transform-origin: bottom;
  align-items: flex-end;
  padding-bottom: 0.125rem;
  z-index: 2;
}

.flip-card-flip-bottom {
  bottom: 0;
  border-radius: 0 0 0.375rem 0.375rem;
  transform-origin: top;
  align-items: flex-start;
  padding-top: 0.125rem;
  transform: rotateX(180deg);
  z-index: 1;
}

/* 翻转动画 */
.is-flipping .flip-card-flip-top {
  animation: flip-top 0.6s ease-in forwards;
}

.is-flipping .flip-card-flip-bottom {
  animation: flip-bottom 0.6s ease-in forwards;
}

@keyframes flip-top {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}

@keyframes flip-bottom {
  0% {
    transform: rotateX(180deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

/* 响应式 */
@media (min-width: 640px) {
  .flip-card {
    width: 4rem;
    height: 4.5rem;
  }
  
  .flip-card-top,
  .flip-card-bottom,
  .flip-card-flip {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .flip-clock {
    gap: 1rem;
  }
  
  .flip-card {
    width: 5rem;
    height: 5.5rem;
  }
  
  .flip-card-top,
  .flip-card-bottom,
  .flip-card-flip {
    font-size: 2.5rem;
  }
  
  .flip-label {
    font-size: 0.875rem;
  }
}
</style>

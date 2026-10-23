import { ref, computed, onMounted, onUnmounted } from 'vue';

// 恋爱起始日期: 2024年9月19日
// 必须用本地时区构造。此前写成 new Date('2024-09-19') 会按 UTC 解析,
// 导致"在一起天数"在北京时间每天早上 8 点才 +1。
const START_DATE = new Date(2024, 8, 19);

const DAY_MS = 1000 * 60 * 60 * 24;

// 以本地日历日为单位的整数天（以当天 00:00 为界翻转）
function calendarDay(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

// Notion 日期多为 'YYYY-MM-DD'，new Date() 会按 UTC 解析导致偏移一天，这里显式本地解析
function parseDate(dateString) {
  if (!dateString) return null;
  const m = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? null : d;
}

// 模块级单例 - 所有组件共享同一份状态
const today = ref(new Date());
let sharedIntervalId = null;
let intervalRefCount = 0;

function ensureSharedInterval() {
  intervalRefCount++;
  if (sharedIntervalId === null) {
    sharedIntervalId = setInterval(() => {
      today.value = new Date();
    }, 60000);
  }
}

function releaseSharedInterval() {
  intervalRefCount--;
  if (intervalRefCount <= 0 && sharedIntervalId !== null) {
    clearInterval(sharedIntervalId);
    sharedIntervalId = null;
    intervalRefCount = 0;
  }
}

export function useDaysCount() {

  // 在一起的总天数（本地日历日差）
  const totalDays = computed(() => {
    return Math.max(0, calendarDay(today.value) - calendarDay(START_DATE));
  });

  // 下一个百天纪念日（一定是未来的）
  const nextMilestone = computed(() => {
    const days = totalDays.value;
    const nextHundred = Math.ceil((days + 1) / 100) * 100;
    return {
      days: nextHundred,
      daysUntil: nextHundred - days,
      isPast: false,
    };
  });

  // 下次百天纪念日的具体日期（起始日 + N 天）
  const nextMilestoneDate = computed(() => {
    const target = new Date(START_DATE);
    target.setDate(target.getDate() + nextMilestone.value.days);
    return target;
  });

  // 下一个周年（按真实日历日期计算，与 FlipClock 显示的日期完全一致）
  const nextAnniversary = computed(() => {
    const now = today.value;
    const yearsElapsed = now.getFullYear() - START_DATE.getFullYear();
    const notYetThisYear =
      now.getMonth() < START_DATE.getMonth() ||
      (now.getMonth() === START_DATE.getMonth() && now.getDate() < START_DATE.getDate());
    const nextYear = notYetThisYear ? yearsElapsed : yearsElapsed + 1;
    const anniv = new Date(START_DATE);
    anniv.setFullYear(START_DATE.getFullYear() + nextYear);
    const daysUntil = Math.round(calendarDay(anniv) - calendarDay(now));
    return {
      year: nextYear,
      daysUntil,
      isPast: false,
    };
  });

  // 下次周年的具体日期
  const nextAnniversaryDate = computed(() => {
    const target = new Date(START_DATE);
    target.setFullYear(START_DATE.getFullYear() + nextAnniversary.value.year);
    return target;
  });

  const formattedStartDate = computed(() => {
    return START_DATE.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  function formatDate(dateString) {
    const date = parseDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatDateTime(dateString) {
    const date = parseDate(dateString);
    if (!date) return '';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 相对时间显示 (刚刚、5分钟前等)
  function formatRelativeTime(dateString) {
    const date = parseDate(dateString);
    if (!date) return '';
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;
    return formatDateTime(dateString);
  }

  // 距离某日期还有多少天（0 表示就是今天，负数表示已过）
  function getDaysUntil(dateString) {
    const target = parseDate(dateString);
    if (!target) return 0;
    return Math.round(calendarDay(target) - calendarDay(today.value));
  }

  // 距离某日期的详细倒计时（天、时、分、秒），到期返回 null
  function getCountdown(date) {
    if (!date) return null;
    const diffMs = date.getTime() - Date.now();
    if (diffMs <= 0) return null;
    return {
      days: Math.floor(diffMs / DAY_MS),
      hours: Math.floor((diffMs % DAY_MS) / (1000 * 60 * 60)),
      minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
    };
  }

  onMounted(() => {
    ensureSharedInterval();
  });

  onUnmounted(() => {
    releaseSharedInterval();
  });

  return {
    totalDays,
    nextMilestone,
    nextMilestoneDate,
    nextAnniversary,
    nextAnniversaryDate,
    formattedStartDate,
    startDate: START_DATE,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    getDaysUntil,
    getCountdown,
  };
}

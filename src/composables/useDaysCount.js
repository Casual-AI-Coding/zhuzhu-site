import { ref, computed, onMounted, onUnmounted } from 'vue';

// 恋爱起始日期: 2024年9月19日
const START_DATE = new Date('2024-09-19');

export function useDaysCount() {
  const today = ref(new Date());
  
  // 计算在一起的总天数
  const totalDays = computed(() => {
    const diffTime = today.value.getTime() - START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });
  
  // 计算下一个百天纪念日（一定是未来的）
  const nextMilestone = computed(() => {
    const days = totalDays.value;
    const nextHundred = Math.ceil((days + 1) / 100) * 100;
    const daysUntilNext = nextHundred - days;
    return {
      days: nextHundred,
      daysUntil: daysUntilNext,
      isPast: false,
    };
  });
  
  // 计算下一个周年纪念日（一定是未来的）
  const nextAnniversary = computed(() => {
    const days = totalDays.value;
    const currentYear = Math.floor(days / 365);
    const nextYear = currentYear + 1;
    const daysInCurrentYear = days % 365;
    const daysUntilNextYear = 365 - daysInCurrentYear;
    
    return {
      year: nextYear,
      daysUntil: daysUntilNextYear,
      isPast: false,
    };
  });
  
  // 获取最近百天的详细日期
  const nearestMilestoneDate = computed(() => {
    const milestone = nearestMilestone.value;
    const targetDate = new Date(START_DATE);
    targetDate.setDate(targetDate.getDate() + milestone.days);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  });
  
  // 获取最近周年的详细日期
  const nearestAnniversaryDate = computed(() => {
    const anniversary = nearestAnniversary.value;
    const targetDate = new Date(START_DATE);
    targetDate.setFullYear(START_DATE.getFullYear() + anniversary.year);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  });
  
  // 格式化日期显示
  const formattedStartDate = computed(() => {
    return START_DATE.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  // 格式化日期
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // 格式化日期+时间
  function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
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
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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

  // 计算距离某日期还有多少天（可正可负，负数表示已过）
  function getDaysUntil(dateString) {
    if (!dateString) return 0;
    const target = new Date(dateString);
    const todayDate = new Date();
    const diffTime = target.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // 获取详细倒计时（天、时、分、秒）
  function getCountdown(dateString) {
    if (!dateString) return null;
    const target = new Date(dateString);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  }
  
  // 获取下次纪念日的详细日期
  const nextAnniversaryDate = computed(() => {
    const anniversary = nextAnniversary.value;
    const targetDate = new Date(START_DATE);
    targetDate.setFullYear(START_DATE.getFullYear() + anniversary.year);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  });
  
  // 获取下次百天纪念日的详细日期
  const nextMilestoneDate = computed(() => {
    const milestone = nextMilestone.value;
    const targetDate = new Date(START_DATE);
    targetDate.setDate(targetDate.getDate() + milestone.days);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  });
  
  // 更新今天的日期（每天更新一次）
  let intervalId;
  onMounted(() => {
    intervalId = setInterval(() => {
      today.value = new Date();
    }, 60000); // 每分钟检查一次
  });
  
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
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

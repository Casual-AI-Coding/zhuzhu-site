<template>
  <div 
    class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8"
    @touchstart="handlePullStart"
    @touchmove="handlePullMove"
    @touchend="handlePullEnd"
  >
    <!-- Pull to refresh indicator -->
    <div 
      v-if="refreshing"
      class="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-full shadow-lg z-50 flex items-center gap-2"
    >
      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span class="text-sm">刷新中...</span>
    </div>
    
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          留言板
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          写下想对对方说的话
        </p>
      </div>
      
      <!-- Message Input -->
      <div class="glass-nav rounded-2xl p-6 mb-8">
        <!-- Toast 提示 -->
        <Transition name="fade">
          <div v-if="toast.show" 
            class="fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50"
            :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
          >
            <p class="text-white font-medium">{{ toast.message }}</p>
          </div>
        </Transition>
         
        <textarea
          ref="textareaRef"
          v-model="newMessage"
          placeholder="写下你的留言..."
          class="w-full bg-transparent border rounded-xl p-4 text-text-main placeholder-text-secondary resize-none focus:outline-none transition-colors"
          :class="isOverLimit ? 'border-red-400' : 'border-border focus:border-primary'"
          :rows="textareaRows"
          :maxlength="MAX_LENGTH + 50"
          @keydown="handleKeydown"
          @focus="handleFocus"
        ></textarea>
        
        <!-- 字符计数 -->
        <div class="flex justify-end mt-1">
          <span class="text-xs" :class="isOverLimit ? 'text-red-500' : 'text-text-secondary'">
            {{ charCount }}/{{ MAX_LENGTH }}
          </span>
        </div>
        
        <!-- 心情选择 -->
        <div class="flex items-center gap-2 mt-4">
          <span class="text-text-secondary text-sm">心情:</span>
          <div class="flex gap-1.5">
            <button
              v-for="moodItem in moodOptions"
              :key="moodItem.value"
              @click="mood = moodItem.value; triggerHaptic()"
              class="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
              :class="mood === moodItem.value 
                ? 'bg-primary/20 ring-2 ring-primary' 
                : 'hover:bg-primary/10'"
              :title="moodItem.value"
            >
              {{ moodItem.emoji }}
            </button>
          </div>
        </div>
        
        <!-- 发送者 + 发送按钮 -->
        <div class="flex items-center justify-between gap-2 mt-4">
          <!-- 发送者选择器 -->
          <div class="flex sm:inline-flex justify-start bg-card rounded-xl p-1 border border-border">
            <button
              v-for="senderItem in senderOptions"
              :key="senderItem.value"
              @click="sender = senderItem.value; triggerHaptic()"
              class="flex-none flex items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-2 sm:px-3 rounded-lg text-[10px] sm:text-sm transition-all whitespace-nowrap"
              :class="sender === senderItem.value 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-text-main hover:bg-primary/5'"
            >
              <span class="text-[10px] sm:text-sm">{{ senderItem.emoji }}</span>
              <span>{{ senderItem.label }}</span>
            </button>
          </div>
          <button
            @click="addMessage(); triggerHaptic()"
            class="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 whitespace-nowrap"
            :disabled="!newMessage.trim() || sending || isOverLimit"
          >
            <span v-if="sending">发送中...</span>
            <span v-else class="flex items-center gap-1 sm:gap-2">
              {{ moodEmoji[mood] }} 发送
            </span>
          </button>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="glass-nav rounded-2xl p-6">
            <div class="flex items-start gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/5"></div>
              <div class="space-y-2">
                <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-20"></div>
                <div class="h-3 bg-primary/10 dark:bg-primary/5 rounded w-24"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-full"></div>
              <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">💌</div>
        <p class="text-text-secondary">还没有留言</p>
        <p class="text-text-secondary text-sm mt-1">写下第一句想说的话吧</p>
      </div>
      
      <!-- Messages Grid -->
      <TransitionGroup 
        name="message" 
        tag="div" 
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          v-for="(message, index) in messages"
          :key="message.id"
          class="glass-nav rounded-2xl p-6 card-hover cursor-pointer select-none message-card flex flex-col"
          :class="`message-direction-${index % 3}`"
          @touchstart="handleTouchStart($event, message.content)"
          @touchend="handleTouchEnd"
          @contextmenu="handleContextMenu($event, message.content)"
          title="长按或右键复制"
        >
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :class="senderColors[message.sender]"
            >
              {{ senderEmojis[message.sender] || '👤' }}
            </div>
            <div>
              <p class="font-medium text-text-main">{{ message.sender }}</p>
              <p class="text-text-secondary text-sm">{{ formatRelativeTime(message.time) }}</p>
            </div>
          </div>
          <p class="text-text-main whitespace-pre-wrap flex-1">{{ message.content }}</p>
          <div class="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ moodEmoji[message.mood] || '😊' }}</span>
            </div>
            
            <!-- 点赞和表情回复 -->
            <div class="flex items-center gap-2">
              <!-- 点赞 -->
              <button 
                @click.stop="toggleLike(message.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all hover:bg-pink-50 dark:hover:bg-pink-900/20"
                :class="isLiked(message.id) ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-text-secondary'"
              >
                <span class="text-base">{{ isLiked(message.id) ? '❤️' : '👍' }}</span>
                <span class="text-xs font-medium">{{ getLikeCount(message.id) || '' }}</span>
              </button>
              
              <!-- 表情回复 -->
              <div class="relative">
                <button 
                  @click.stop="toggleReactionPicker(message.id)"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  :class="hasReaction(message.id) ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'text-text-secondary'"
                >
                  {{ hasReaction(message.id) ? getUserReaction(message.id) : '😊' }}
                </button>
                
                <!-- 表情选择器 -->
                <div 
                  v-if="showReactionPicker === message.id"
                  class="absolute bottom-full right-0 mb-2 flex gap-1 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-border/50 z-10"
                >
                  <button 
                    v-for="emoji in reactionEmojis" 
                    :key="emoji"
                    @click.stop="addReaction(message.id, emoji)"
                    class="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-lg transition-all hover:scale-125"
                    :title="emoji"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { fetchMessages, addMessage as addMessageToNotion } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { formatDate, formatDateTime, formatRelativeTime } = useDaysCount();

const newMessage = ref('');
const sender = ref('猪猪');
const mood = ref('开心');
const messages = ref([]);
const loading = ref(true);
const sending = ref(false);
const refreshing = ref(false);
const textareaRef = ref(null);

// 点赞和表情回复
const likes = ref({});
const reactions = ref({});
const showReactionPicker = ref(null);

const reactionEmojis = ['👍', '❤️', '😂', '😢', '😮', '🎉', '🔥', '💕'];

// 从 localStorage 加载数据
function loadInteractions() {
  try {
    const savedLikes = localStorage.getItem('guestbook_likes');
    const savedReactions = localStorage.getItem('guestbook_reactions');
    if (savedLikes) likes.value = JSON.parse(savedLikes);
    if (savedReactions) reactions.value = JSON.parse(savedReactions);
  } catch {
    // Ignore localStorage errors
  }
}

// 保存到 localStorage
function saveInteractions() {
  try {
    localStorage.setItem('guestbook_likes', JSON.stringify(likes.value));
    localStorage.setItem('guestbook_reactions', JSON.stringify(reactions.value));
  } catch {
    // Ignore localStorage errors
  }
}

// 点赞
function toggleLike(messageId) {
  const deviceId = getDeviceId();
  if (!likes.value[messageId]) {
    likes.value[messageId] = { count: 0, users: [] };
  }
  
  const userIndex = likes.value[messageId].users.indexOf(deviceId);
  if (userIndex > -1) {
    likes.value[messageId].users.splice(userIndex, 1);
    likes.value[messageId].count = Math.max(0, likes.value[messageId].count - 1);
  } else {
    likes.value[messageId].users.push(deviceId);
    likes.value[messageId].count = (likes.value[messageId].count || 0) + 1;
  }
  saveInteractions();
}

function isLiked(messageId) {
  const deviceId = getDeviceId();
  return likes.value[messageId]?.users?.includes(deviceId);
}

function getLikeCount(messageId) {
  return likes.value[messageId]?.count || 0;
}

// 表情回复
function toggleReactionPicker(messageId) {
  showReactionPicker.value = showReactionPicker.value === messageId ? null : messageId;
}

function addReaction(messageId, emoji) {
  const deviceId = getDeviceId();
  if (!reactions.value[messageId]) {
    reactions.value[messageId] = {};
  }
  
  // 切换表情
  if (reactions.value[messageId][deviceId] === emoji) {
    delete reactions.value[messageId][deviceId];
  } else {
    reactions.value[messageId][deviceId] = emoji;
  }
  saveInteractions();
  showReactionPicker.value = null;
}

function getUserReaction(messageId) {
  const deviceId = getDeviceId();
  return reactions.value[messageId]?.[deviceId] || null;
}

function hasReaction(messageId) {
  const deviceId = getDeviceId();
  return !!reactions.value[messageId]?.[deviceId];
}

// 简单的设备ID
function getDeviceId() {
  let deviceId = localStorage.getItem('guestbook_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestbook_device_id', deviceId);
  }
  return deviceId;
}

const MAX_LENGTH = 500;

const charCount = computed(() => newMessage.value.length);
const isOverLimit = computed(() => charCount.value > MAX_LENGTH);

// 动态计算 textarea 行数
const textareaRows = computed(() => {
  const lines = newMessage.value.split('\n').length;
  return Math.max(3, Math.min(lines, 8));
});

const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

const moodOptions = [
  { value: '开心', emoji: '😊' },
  { value: '感动', emoji: '🥰' },
  { value: '想念', emoji: '😢' },
  { value: '甜蜜', emoji: '🍯' },
  { value: '害羞', emoji: '🫣' },
  { value: '调皮', emoji: '😜' },
];

const senderOptions = [
  { value: '大萝卜', label: '大萝卜', emoji: '🥕' },
  { value: '猪猪', label: '猪猪', emoji: '🐷' },
  { value: '小葡萄', label: '小葡萄', emoji: '🍇' },
];

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

const senderEmojis = {
  '大萝卜': '🥕',
  '猪猪': '🐷',
  '小葡萄': '🍇',
};

const senderColors = {
  '大萝卜': 'bg-orange-100',
  '猪猪': 'bg-pink-100',
  '小葡萄': 'bg-purple-100',
};

const moodEmoji = {
  '开心': '😊',
  '感动': '🥰',
  '想念': '😢',
  '甜蜜': '🍯',
};

function handleRefresh() {
  loading.value = true;
  fetchMessages().then(data => {
    messages.value = data;
    loading.value = false;
  });
}

async function addMessage() {
  if (!newMessage.value.trim() || sending.value || isOverLimit.value) return;
  
  sending.value = true;
  
  try {
    const result = await addMessageToNotion(newMessage.value, sender.value, mood.value);
    messages.value.unshift(result);
    showToast('留言成功！', 'success');
  } catch (error) {
    // 即使失败也显示在本地
    messages.value.unshift({
      id: Date.now(),
      content: newMessage.value,
      sender: sender.value,
      mood: mood.value,
      time: new Date().toISOString(),
    });
    showToast('发送失败，已保存到本地', 'error');
  }
  
  newMessage.value = '';
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
  sending.value = false;
}

// 键盘快捷键发送
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!isOverLimit.value && newMessage.value.trim()) {
      addMessage();
    }
  }
}

// 移动端键盘避让
function handleFocus() {
  setTimeout(() => {
    if (textareaRef.value) {
      textareaRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, 300);
}

// 长按复制
let pressTimer = null;
function handleTouchStart(e, content) {
  pressTimer = setTimeout(() => {
    navigator.clipboard.writeText(content);
    showToast('已复制到剪贴板', 'success');
  }, 500);
}
function handleTouchEnd() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

// 右键复制
function handleContextMenu(e, content) {
  e.preventDefault();
  navigator.clipboard.writeText(content);
  showToast('已复制到剪贴板', 'success');
}

// 下拉刷新
let pullStartY = 0;
function handlePullStart(e) {
  if (window.scrollY === 0) {
    pullStartY = e.touches[0].clientY;
  }
}

function handlePullMove(e) {
  if (pullStartY > 0 && window.scrollY === 0) {
    const pullCurrentY = e.touches[0].clientY;
    if (pullCurrentY - pullStartY > 100 && !refreshing.value && !loading.value) {
      refreshing.value = true;
      fetchMessages().then(() => {
        refreshing.value = false;
        showToast('刷新成功', 'success');
      });
      pullStartY = 0;
    }
  }
}

function handlePullEnd() {
  pullStartY = 0;
}

// 触感反馈
function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// 点击外部关闭表情选择器
function handleClickOutside(e) {
  if (showReactionPicker.value && !e.target.closest('.relative')) {
    showReactionPicker.value = null;
  }
}

onMounted(async () => {
  loadInteractions();
  messages.value = await fetchMessages();
  loading.value = false;
  window.addEventListener('refresh-data', handleRefresh);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 留言入场动画 - 增强版 */
.message-enter-active {
  animation: messageFlyIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.message-leave-active {
  animation: messageSlideOut 0.3s ease-in;
}

.message-move {
  transition: transform 0.4s ease;
}

/* 随机方向动画变体 */
.message-direction-0.message-enter-active {
  animation-name: messageFlyInFromTop;
}

.message-direction-1.message-enter-active {
  animation-name: messageFlyInFromLeft;
}

.message-direction-2.message-enter-active {
  animation-name: messageFlyInFromRight;
}

@keyframes messageFlyInFromTop {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8);
  }
  60% {
    transform: translateY(10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes messageFlyInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-40px) scale(0.8);
  }
  60% {
    transform: translateX(10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes messageFlyInFromRight {
  0% {
    opacity: 0;
    transform: translateX(40px) scale(0.8);
  }
  60% {
    transform: translateX(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes messageSlideOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* 涟漪效果 */
.message-card {
  position: relative;
  overflow: hidden;
}

.message-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
}

.message-enter-active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 30px rgba(212, 165, 116, 0);
  }
}
</style>

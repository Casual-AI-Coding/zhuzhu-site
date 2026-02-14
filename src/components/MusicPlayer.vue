<template>
  <!-- 启用音乐按钮 -->
  <button
    v-if="!isEnabled"
    @click="enableMusic"
    class="music-enable-btn"
    title="点击启用音乐"
  >
    🎵
  </button>
  
  <!-- 播放器 -->
  <div class="netease-mini-player music-player"
    :class="{ 'player-ready': isEnabled }"
    data-playlist-id="17760528164"
    data-embed="false"
    data-position="bottom-right"
    data-lyric="false"
    data-theme="auto"
    data-autoplay="false"
    data-default-minimized="true"
  ></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isEnabled = ref(false);

function enableMusic() {
  isEnabled.value = true;
  
  // 加载 CSS
  const linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = '/netease-mini-player-v2.css';
  document.head.appendChild(linkEl);

  // 加载 JS
  const scriptEl = document.createElement('script');
  scriptEl.src = '/netease-mini-player-v2.js';
  scriptEl.onload = () => {
    console.log('NeteaseMiniPlayer loaded successfully');
    
    // 等待播放器初始化后手动播放
    const checkPlayer = setInterval(() => {
      const playerEl = document.querySelector('.music-player');
      if (playerEl?.neteasePlayer?.audio) {
        // 设置音量为 0.2
        playerEl.neteasePlayer.audio.volume = 0.2;
        playerEl.neteasePlayer.volume = 0.2;
        
        // 手动调用播放（用户点击后应该可以播放）
        playerEl.neteasePlayer.play().then(() => {
          console.log('音乐播放成功');
        }).catch(err => {
          console.log('播放失败:', err);
        });
        
        clearInterval(checkPlayer);
      }
    }, 100);
    
    setTimeout(() => clearInterval(checkPlayer), 5000);
  };
  document.body.appendChild(scriptEl);
}
</script>

<style>
/* 启用音乐按钮 - 与烟花按钮风格一致 */
.music-enable-btn {
  position: fixed;
  top: 150px;
  right: 20px;
  width: 52px;
  height: 52px;
  font-size: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.music-enable-btn:hover {
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
}

/* 调整播放器位置和最小化大小，与烟花按钮一致 */
.music-player {
  top: 150px !important;
  right: 20px !important;
}

/* 最小化状态 */
.music-player.minimized {
  width: 52px !important;
  height: 52px !important;
  border-radius: 50% !important;
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
}

/* 禁用自动最小化到边缘的动画 */
.music-player.minimized.idle,
.music-player.minimized.docked-right,
.music-player.minimized.docked-left,
.music-player.minimized.fading-out,
.music-player.minimized.fading-in {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
}
</style>

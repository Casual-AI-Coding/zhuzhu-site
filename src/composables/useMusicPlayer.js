import { ref, computed, watch } from 'vue';

// 默认播放列表
const defaultPlaylist = [
  {
    id: 1,
    title: 'When Its Time',
    artist: 'Green Day',
    url: 'https://music.163.com/song/media/outer/url?id=4083680.mp3',
  },
  {
    id: 2,
    title: 'No Matter What (Acoustic)',
    artist: 'Papa Roach',
    url: 'https://music.163.com/song/media/outer/url?id=572835719.mp3',
  },
  {
    id: 3,
    title: 'Through Glass',
    artist: 'Stone Sour',
    url: 'https://music.163.com/song/media/outer/url?id=26741691.mp3',
  },
];

export function useMusicPlayer() {
  const playlist = ref([...defaultPlaylist]);
  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const audioRef = ref(null);

  const currentSong = computed(() => playlist.value[currentIndex.value] || null);

  const hasNext = computed(() => currentIndex.value < playlist.value.length - 1);
  const hasPrev = computed(() => currentIndex.value > 0);

  function setPlaylist(songs) {
    playlist.value = songs;
    currentIndex.value = 0;
    isPlaying.value = false;
  }

  function play() {
    if (audioRef.value) {
      audioRef.value.play();
      isPlaying.value = true;
    }
  }

  function pause() {
    if (audioRef.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    }
  }

  function toggle() {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  }

  function next() {
    if (hasNext.value) {
      currentIndex.value++;
      if (isPlaying.value) {
        play();
      }
    } else {
      // 循环到第一首
      currentIndex.value = 0;
      if (isPlaying.value) {
        play();
      }
    }
  }

  function prev() {
    if (hasPrev.value) {
      currentIndex.value--;
      if (isPlaying.value) {
        play();
      }
    } else {
      // 循环到最后一首
      currentIndex.value = playlist.value.length - 1;
      if (isPlaying.value) {
        play();
      }
    }
  }

  function onTimeUpdate() {
    if (audioRef.value) {
      currentTime.value = audioRef.value.currentTime;
    }
  }

  function onLoadedMetadata() {
    if (audioRef.value) {
      duration.value = audioRef.value.duration;
    }
  }

  function onEnded() {
    next();
  }

  function setAudioRef(el) {
    audioRef.value = el;
  }

  // 格式化时间
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return {
    playlist,
    currentIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    hasNext,
    hasPrev,
    setPlaylist,
    play,
    pause,
    toggle,
    next,
    prev,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
    setAudioRef,
    formatTime,
  };
}

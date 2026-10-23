<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          我们的足迹
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          每一张照片都是一枚脚印
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="h-[60vh] glass-nav rounded-2xl animate-pulse"></div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">💔</div>
        <p class="text-text-secondary mb-4">地图数据加载失败，请稍后再试</p>
        <button
          type="button"
          class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
          @click="handleRefresh"
        >
          重新加载
        </button>
      </div>

      <template v-else>
        <!-- 地图 -->
        <div
          v-show="locatedPlaces.length > 0"
          ref="mapRef"
          class="h-[60vh] sm:h-[65vh] rounded-2xl overflow-hidden z-0 border border-border/50"
        ></div>

        <!-- 无坐标提示 -->
        <div v-if="!loading && locatedPlaces.length === 0" class="glass-nav rounded-2xl p-8 text-center">
          <div class="text-6xl mb-4">🗺️</div>
          <p class="text-text-main font-medium mb-2">还没有带上位置的照片</p>
          <p class="text-text-secondary text-sm">
            在 Notion 相册库的"地点"字段里按
            <code class="px-1.5 py-0.5 bg-primary/10 rounded text-primary">名称, 纬度, 经度</code>
            格式填写（如 <code class="px-1.5 py-0.5 bg-primary/10 rounded text-primary">西湖, 30.24, 120.15</code>），
            照片就会出现在地图上
          </p>
        </div>

        <!-- 地点列表 -->
        <div v-if="locatedPlaces.length > 0" class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="place in locatedPlaces"
            :key="place.name"
            class="glass-nav rounded-2xl p-4 text-left card-hover"
            @click="focusPlace(place)"
          >
            <div class="flex items-center gap-2 mb-2">
              <MapPin class="w-4 h-4 text-primary shrink-0" />
              <span class="font-medium text-text-main truncate">{{ place.name }}</span>
            </div>
            <div class="flex -space-x-2">
              <img
                v-for="photo in place.photos.slice(0, 3)"
                :key="photo.id"
                :src="thumbUrl(photo.url, 120)"
                :alt="photo.title || place.name"
                class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800"
                loading="lazy"
              />
            </div>
            <p class="text-text-secondary text-xs mt-2">{{ place.photos.length }} 张照片</p>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { MapPin } from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPhotos, invalidate } from '@/lib/notion.js';
import { thumbUrl } from '@/lib/imageUrl.js';

const mapRef = ref(null);
const photos = ref([]);
const loading = ref(true);
const error = ref(false);
let map = null;

// 修复 Vite 下 Leaflet 默认图标路径
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// WGS-84 → GCJ-02（高德瓦片坐标系）纠偏
function wgs2gcj(lng, lat) {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const transform = (x, y, isLat) => {
    let ret;
    if (isLat) {
      ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0;
      ret += ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320.0 * Math.sin((y * Math.PI) / 30.0)) * 2.0) / 3.0;
    } else {
      ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0;
      ret += ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) / 3.0;
    }
    return ret;
  };
  let dlat = transform(lng - 105.0, lat - 35.0, true);
  let dlng = transform(lng - 105.0, lat - 35.0, false);
  const radlat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI));
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * Math.PI);
  return [lng + dlng, lat + dlat];
}

// 有坐标的照片按地点聚合
const locatedPlaces = computed(() => {
  const groups = {};
  for (const photo of photos.value) {
    if (photo.lat == null || photo.lon == null || !photo.place) continue;
    const key = photo.place;
    if (!groups[key]) {
      groups[key] = { name: photo.place, lat: 0, lon: 0, photos: [] };
    }
    groups[key].lat += photo.lat;
    groups[key].lon += photo.lon;
    groups[key].photos.push(photo);
  }
  return Object.values(groups)
    .map((g) => ({
      ...g,
      lat: g.lat / g.photos.length,
      lon: g.lon / g.photos.length,
    }))
    .sort((a, b) => b.photos.length - a.photos.length);
});

function initMap() {
  if (!mapRef.value || map) return;
  map = L.map(mapRef.value, {
    attributionControl: false,
    zoomControl: true,
  }).setView([35.5, 105.5], 4);

  // 高德栅格瓦片（GCJ-02 坐标系, 国内访问稳定, 无需 key）
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
  }).addTo(map);

  const bounds = [];
  for (const place of locatedPlaces.value) {
    const [lng, lat] = wgs2gcj(place.lon, place.lat);
    bounds.push([lat, lng]);
    const thumbsHtml = place.photos
      .slice(0, 3)
      .map(
        (p) =>
          `<img src="${thumbUrl(p.url, 120)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px;margin:2px"/>`,
      )
      .join('');
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif"><b style="font-size:14px">${place.name}</b>` +
          `<div style="color:#888;font-size:12px;margin:2px 0">${place.photos.length} 张照片</div>` +
          `<div style="display:flex">${thumbsHtml}</div></div>`,
        { maxWidth: 240 },
      );
  }
  if (bounds.length === 1) {
    map.setView(bounds[0], 12);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

function focusPlace(place) {
  if (!map) return;
  const [lng, lat] = wgs2gcj(place.lon, place.lat);
  map.flyTo([lat, lng], 12, { duration: 0.8 });
}

async function load() {
  loading.value = true;
  error.value = false;
  try {
    photos.value = await fetchPhotos();
  } catch {
    error.value = true;
    loading.value = false;
    return;
  }
  loading.value = false;
  await nextTick();
  initMap();
}

function handleRefresh() {
  invalidate('photos');
  if (map) {
    map.remove();
    map = null;
  }
  load();
}

onMounted(() => {
  load();
  window.addEventListener('refresh-data', handleRefresh);
});

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* Leaflet 弹窗适配站点风格 */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 16px;
}
:deep(.leaflet-popup-content) {
  margin: 12px;
}
:deep(.leaflet-container) {
  font: inherit;
  background: #e8e0d5;
}
.dark :deep(.leaflet-container) {
  background: #262626;
}
.dark :deep(.leaflet-tile) {
  filter: brightness(0.85) saturate(0.9);
}

/* 缩放控件主题化：玻璃圆角、适配暗色 */
:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
:deep(.leaflet-control-zoom a) {
  background: rgba(255, 255, 255, 0.75) !important;
  color: #8b7355 !important;
  border: none !important;
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  font-weight: 500;
}
.dark :deep(.leaflet-control-zoom a) {
  background: rgba(40, 40, 40, 0.8) !important;
  color: #e8c9a8 !important;
}

/* 手机端交给双指缩放, 隐藏 +/- 控件腾出空间 */
@media (max-width: 640px) {
  :deep(.leaflet-control-zoom) {
    display: none;
  }
}
</style>

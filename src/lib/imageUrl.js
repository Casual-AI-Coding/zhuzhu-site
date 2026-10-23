// 图片 URL 处理工具
// 网格/轮播等场景通过 Netlify Image CDN 按需生成小尺寸 WebP,
// 原图仅在 Lightbox/海报等需要高清时使用。
//
// 约束:
// - Notion 托管的图片是临时签名 URL(约 1 小时过期), CDN 每次回源拉取,
//   因此 URL 必须来自较新的数据(配合 cache.js 的 TTL 使用);
// - 本地开发没有 /.netlify/images 服务, 直接回退原图;
// - 若站点迁移到非 Netlify 平台, 缩略图请求会 404, img 的 onerror 会回退原图。

const IS_LOCAL = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

// 生成缩略图 URL; 非本地默认走 Netlify Image CDN
export function thumbUrl(url, width = 480) {
  if (!url) return '';
  if (IS_LOCAL) return url;
  const params = new URLSearchParams({
    url,
    w: String(width),
    fm: 'webp',
    q: '72',
  });
  return `/.netlify/images?${params.toString()}`;
}

// 生成 srcset 字符串(多档缩略 + 原图兜底), 供 grid/轮播的 <img> 使用
export function thumbSrcset(url, widths = [480, 800]) {
  if (!url) return '';
  const parts = widths.map((w) => `${thumbUrl(url, w)} ${w}w`);
  parts.push(`${url} 1600w`);
  return parts.join(', ');
}

// 轻量 SWR 缓存: 内存 + localStorage 双层
// - get(key): 返回 { data, age } 或 null
// - set(key, data)
// - invalidate(key|prefix): 清除指定键或以其为前缀的所有键
// 注意: 相册图片 URL 是 Notion 的临时签名地址(约 1 小时过期),
// 因此 TTL 保持远小于 1 小时, 过期缓存仅作断网兜底。

const STORAGE_KEY = 'zz-notion-cache-v1';
const FRESH_TTL = 5 * 60 * 1000; // 5 分钟内视为新鲜, 直接使用
const MAX_AGE = 50 * 60 * 1000; // 超过 50 分钟的缓存可能含过期图片 URL, 丢弃

const memory = new Map();

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveStorage(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 存储满/隐私模式: 内存缓存仍然有效
  }
}

export function cacheGet(key) {
  const entry = memory.get(key) || loadStorage()[key];
  if (!entry || typeof entry.ts !== 'number') return null;
  const age = Date.now() - entry.ts;
  if (age > MAX_AGE) {
    invalidate(key);
    return null;
  }
  return { data: entry.data, age, fresh: age < FRESH_TTL };
}

export function cacheSet(key, data) {
  const entry = { ts: Date.now(), data };
  memory.set(key, entry);
  const all = loadStorage();
  all[key] = entry;
  saveStorage(all);
}

export function invalidate(key) {
  memory.delete(key);
  const all = loadStorage();
  let changed = false;
  for (const k of Object.keys(all)) {
    if (k === key || k.startsWith(`${key}:`)) {
      delete all[k];
      changed = true;
    }
  }
  // 前缀式清理也同步内存
  for (const k of [...memory.keys()]) {
    if (k.startsWith(`${key}:`)) memory.delete(k);
  }
  if (changed) saveStorage(all);
}

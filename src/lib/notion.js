import { cacheGet, cacheSet, invalidate } from './cache';

const API_BASE = '/notion-api';
const MAX_RETRIES = 2;

// 鉴权说明: 浏览器端不携带任何 token。
// 生产环境由 Netlify/Vercel 服务端函数注入 Authorization,
// 本地开发由 vite.config.js 的代理注入。

// 数据库 ID
const DATABASES = {
  anniversary: import.meta.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: import.meta.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: import.meta.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: import.meta.env.VITE_NOTION_DATABASE_MESSAGES,
  wishes: import.meta.env.VITE_NOTION_DATABASE_WISHES,
};

export class NotionApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'NotionApiError';
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 带重试的请求: 仅对限流/网关错误和网络错误重试, 且不重试非幂等的 POST /pages
async function notionRequest(endpoint, options = {}, retryCount = 0) {
  const method = options.method || 'POST';
  const nonIdempotent = method === 'POST' && endpoint === '/pages';

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: options.body,
    });
  } catch {
    if (!nonIdempotent && retryCount < MAX_RETRIES) {
      await sleep(300 * (retryCount + 1));
      return notionRequest(endpoint, options, retryCount + 1);
    }
    throw new NotionApiError('网络连接失败，请检查网络后重试');
  }

  if (!response.ok) {
    const retriable = [429, 502, 503, 504].includes(response.status);
    if (retriable && !nonIdempotent && retryCount < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(retryAfter) ? Math.min(retryAfter * 1000, 5000) : 500 * (retryCount + 1));
      return notionRequest(endpoint, options, retryCount + 1);
    }
    let message = `Notion API 错误 (${response.status})`;
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch {
      // 响应体不是 JSON 时保留默认消息
    }
    throw new NotionApiError(message, response.status);
  }

  return response.json();
}

// 通用查询: 5 分钟内走缓存, 失败时降级到过期缓存(断网兜底)
async function cachedQuery(cacheKey, dbKey, sorts) {
  const cached = cacheGet(cacheKey.key);
  if (cached && cached.fresh) return cached.data;

  try {
    const response = await notionRequest(`/databases/${DATABASES[dbKey]}/query`, {
      method: 'POST',
      body: JSON.stringify(sorts ? { sorts } : {}),
    });
    const data = response.results.map(cacheKey.mapper);
    cacheSet(cacheKey.key, data);
    return data;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

// 地点字段兼容解析: 支持 place 对象(初始化脚本)与富文本 "名称, 纬度, 经度"
export function parsePlace(prop) {
  if (!prop) return { name: '', lat: null, lon: null };
  if (prop.place && typeof prop.place === 'object' && prop.place.name) {
    return {
      name: prop.place.name,
      lat: Number.isFinite(prop.place.lat) ? prop.place.lat : null,
      lon: Number.isFinite(prop.place.lon) ? prop.place.lon : null,
    };
  }
  const text = prop.rich_text?.[0]?.plain_text || prop.select?.name || '';
  const parts = text.split(',').map((s) => s.trim());
  if (parts.length >= 3) {
    const lat = parseFloat(parts[parts.length - 2]);
    const lon = parseFloat(parts[parts.length - 1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { name: parts.slice(0, -2).join(','), lat, lon };
    }
  }
  return { name: text, lat: null, lon: null };
}

const richText = (prop) => prop?.rich_text?.[0]?.plain_text || '';

// ==================== 纪念日 ====================

function mapAnniversary(page) {
  return {
    id: page.id,
    title: richText(page.properties['名称']) || '',
    date: page.properties['日期']?.date?.start || '',
    type: page.properties['类型']?.select?.name || '',
    description: richText(page.properties['描述']) || '',
  };
}

export async function fetchAnniversaries() {
  return cachedQuery(
    { key: 'anniversaries', mapper: mapAnniversary },
    'anniversary',
    [{ property: '日期', direction: 'ascending' }],
  );
}

// ==================== 相册 ====================

function mapPhoto(page) {
  const files = page.properties['图片']?.files || [];
  const url = files[0]?.file?.url || files[0]?.external?.url || '';
  const place = parsePlace(page.properties['地点']);
  return {
    id: page.id,
    title: richText(page.properties['标题']) || '',
    url,
    date: page.properties['日期']?.date?.start || '',
    place: place.name,
    lat: place.lat,
    lon: place.lon,
    tags: (page.properties['标签']?.multi_select || []).map((tag) => tag.name),
    description: richText(page.properties['描述']) || '',
  };
}

export async function fetchPhotos() {
  return cachedQuery(
    { key: 'photos', mapper: mapPhoto },
    'photos',
    [{ property: '日期', direction: 'descending' }],
  );
}

// ==================== 时光轴 ====================

function mapTimelineEvent(page) {
  return {
    id: page.id,
    title: richText(page.properties['事件']) || '',
    date: page.properties['日期']?.date?.start || '',
    description: richText(page.properties['描述']) || '',
    importance: page.properties['重要度']?.select?.name || '中',
  };
}

export async function fetchTimeline() {
  return cachedQuery(
    { key: 'timeline', mapper: mapTimelineEvent },
    'timeline',
    [{ property: '日期', direction: 'ascending' }],
  );
}

// ==================== 留言板 ====================

function mapMessage(page) {
  return {
    id: page.id,
    content: richText(page.properties['内容']) || '',
    sender: page.properties['发送者']?.select?.name || '',
    time: page.created_time,
    mood: page.properties['心情']?.select?.name || '',
  };
}

export async function fetchMessages() {
  return cachedQuery(
    { key: 'messages', mapper: mapMessage },
    'messages',
    [{ timestamp: 'created_time', direction: 'descending' }],
  );
}

// 发送新留言
export async function addMessage(content, sender, mood = '开心') {
  // 自增 Id 仅作展示排序用, 真实主键是 page id
  const existing = await notionRequest(`/databases/${DATABASES.messages}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100 }),
  });
  let maxId = 0;
  for (const page of existing.results) {
    const idNum = parseInt(page.properties['Id']?.title?.[0]?.plain_text || '0', 10);
    if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
  }

  const response = await notionRequest('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: DATABASES.messages },
      properties: {
        Id: { title: [{ text: { content: (maxId + 1).toString() } }] },
        内容: { rich_text: [{ text: { content } }] },
        发送者: { select: { name: sender } },
        心情: { select: { name: mood } },
      },
    }),
  });

  invalidate('messages');
  return { id: response.id, content, sender, time: response.created_time, mood };
}

// ==================== 愿望清单 ====================

// Notion status 有三个选项, 产品语义是两态: 未成真(Not started/In progress)与已成真(Done)
const STATUS_MAP = {
  'Not started': '进行中',
  'In progress': '进行中',
  Done: '已完成',
};

function mapWish(page) {
  return {
    id: page.id,
    title: page.properties['标题']?.title?.[0]?.plain_text
      || richText(page.properties['标题']) || '',
    description: richText(page.properties['描述']) || '',
    category: page.properties['分类']?.select?.name || '其他',
    targetDate: page.properties['目标日期']?.date?.start || '',
    priority: page.properties['优先级']?.select?.name || '中',
    status: STATUS_MAP[page.properties['状态']?.status?.name] || '进行中',
    completedDate: page.properties['完成日期']?.date?.start || '',
  };
}

export async function fetchWishes() {
  return cachedQuery(
    { key: 'wishes', mapper: mapWish },
    'wishes',
    [{ property: '目标日期', direction: 'ascending' }],
  );
}

// 添加愿望
export async function addWish(wish) {
  const existing = await notionRequest(`/databases/${DATABASES.wishes}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100 }),
  });
  let maxId = 0;
  for (const page of existing.results) {
    const idNum = parseInt(page.properties['Id']?.title?.[0]?.plain_text || '0', 10);
    if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
  }

  const response = await notionRequest('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: DATABASES.wishes },
      properties: {
        Id: { title: [{ text: { content: (maxId + 1).toString() } }] },
        标题: { rich_text: [{ text: { content: wish.title } }] },
        描述: { rich_text: [{ text: { content: wish.description || '' } }] },
        分类: { select: { name: wish.category || '其他' } },
        目标日期: { date: wish.targetDate ? { start: wish.targetDate } : null },
        优先级: { select: { name: wish.priority || '中' } },
      },
    }),
  });

  invalidate('wishes');
  return mapWish(response);
}

// 更新愿望
export async function updateWish(wishId, updates) {
  const properties = {};
  if (updates.title !== undefined) {
    properties['标题'] = { rich_text: [{ text: { content: updates.title } }] };
  }
  if (updates.description !== undefined) {
    properties['描述'] = { rich_text: [{ text: { content: updates.description } }] };
  }
  if (updates.category !== undefined) {
    properties['分类'] = { select: { name: updates.category } };
  }
  if (updates.targetDate !== undefined) {
    properties['目标日期'] = { date: updates.targetDate ? { start: updates.targetDate } : null };
  }
  if (updates.priority !== undefined) {
    properties['优先级'] = { select: { name: updates.priority } };
  }

  await notionRequest(`/pages/${wishId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });

  invalidate('wishes');
  return true;
}

// 完成愿望
export async function completeWish(wishId, completedDate) {
  await notionRequest(`/pages/${wishId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        状态: { status: { name: 'Done' } },
        完成日期: { date: { start: completedDate } },
      },
    }),
  });

  invalidate('wishes');
  return true;
}

// 删除愿望（归档）
export async function deleteWish(wishId) {
  await notionRequest(`/pages/${wishId}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  });

  invalidate('wishes');
  return true;
}

export { invalidate };

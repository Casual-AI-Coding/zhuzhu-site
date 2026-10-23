// Vercel Serverless Function: /api/proxy
// 职责: 服务端注入 Notion 鉴权, 前端不携带任何 token
// 安全: endpoint 白名单 + Origin 白名单 CORS + 简单限流

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const RATE_LIMIT = 60; // 每分钟每 IP
const RATE_WINDOW = 60 * 1000;

// ---------- 配置 ----------
function getToken() {
  return process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || '';
}

function getDatabaseIds() {
  const keys = [
    'NOTION_DATABASE_ANNIVERSARY', 'NOTION_DATABASE_PHOTOS',
    'NOTION_DATABASE_TIMELINE', 'NOTION_DATABASE_MESSAGES',
    'NOTION_DATABASE_WISHES',
  ];
  const ids = new Set();
  for (const key of keys) {
    const id = process.env[key] || process.env[`VITE_${key}`];
    if (id) ids.add(id.replace(/-/g, ''));
  }
  return ids;
}

function getAllowedOrigins() {
  const origins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // 始终放行本站与本地开发
  return new Set([
    ...origins,
    'https://zhuzhu-site.netlify.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:4173',
  ]);
}

// ---------- 限流(单实例内存, 尽力而为) ----------
const buckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW };
    buckets.set(ip, bucket);
  }
  bucket.count++;
  if (buckets.size > 5000) buckets.clear(); // 防内存膨胀
  return bucket.count > RATE_LIMIT;
}

// ---------- 请求校验 ----------
// 只放行: 5 个已知库的 query、创建页面(留言/愿望)、更新页面(愿望状态)
function validatePath(method, restPath) {
  const dbIds = getDatabaseIds();
  let m;
  if ((m = restPath.match(/^\/databases\/([0-9a-f-]+)\/query$/))) {
    if (method !== 'POST') return 'method not allowed';
    return dbIds.has(m[1].replace(/-/g, '')) ? null : 'database not allowed';
  }
  if (restPath === '/pages') {
    return method === 'POST' ? null : 'method not allowed';
  }
  if ((m = restPath.match(/^\/pages\/([0-9a-f-]+)$/))) {
    return method === 'PATCH' ? null : 'method not allowed';
  }
  return 'endpoint not allowed';
}

// ---------- CORS ----------
function corsHeaders(req) {
  const origin = req.headers.origin || '';
  const headers = {
    'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (getAllowedOrigins().has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
    return res.end();
  }

  // Vercel rewrite: /notion-api/(.*) -> /api/proxy?path=$1
  const url = new URL(req.url, 'http://localhost');
  let restPath = url.searchParams.get('path') || '';
  // 兜底: 直接命中函数路径本身携带 /notion-api 前缀的情况
  if (!restPath && url.pathname.startsWith('/notion-api/')) {
    restPath = url.pathname.replace(/^\/notion-api/, '');
  }
  if (!restPath) {
    return sendJson(res, 400, { error: 'missing path' }, cors);
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return sendJson(res, 429, { error: 'too many requests' }, cors);
  }

  const invalid = validatePath(req.method, restPath);
  if (invalid) {
    return sendJson(res, 403, { error: invalid }, cors);
  }

  const token = getToken();
  if (!token) {
    return sendJson(res, 500, { error: 'server missing NOTION_TOKEN env' }, cors);
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  try {
    const upstream = await fetch(`${NOTION_API}${restPath}`, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: chunks.length ? Buffer.concat(chunks).toString() : undefined,
    });
    const text = await upstream.text();
    return sendJson(
      res,
      upstream.status,
      text ? JSON.parse(text) : {},
      { ...cors, 'Content-Type': 'application/json' },
    );
  } catch (err) {
    return sendJson(res, 502, { error: 'notion upstream error' }, cors);
  }
};

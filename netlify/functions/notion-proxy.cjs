// Netlify Function: /.netlify/functions/notion-proxy
// 与 api/proxy.cjs (Vercel) 同逻辑: 服务端注入 Notion 鉴权 + 白名单 + 限流
// 客户端请求 /notion-api/<rest>, 由 netlify.toml rewrite 到本函数

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const RATE_LIMIT = 60; // 每分钟每 IP
const RATE_WINDOW = 60 * 1000;

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
  return new Set([
    ...origins,
    'https://zhuzhu-site.netlify.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:4173',
  ]);
}

const buckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW };
    buckets.set(ip, bucket);
  }
  bucket.count++;
  if (buckets.size > 5000) buckets.clear();
  return bucket.count > RATE_LIMIT;
}

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

function corsHeaders(event) {
  const origin = event.headers.origin || '';
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

exports.handler = async (event) => {
  const cors = corsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  // 从原始 URL 中取 /notion-api 之后的路径
  let restPath = '';
  if (event.rawUrl) {
    const { pathname } = new URL(event.rawUrl);
    if (pathname.startsWith('/notion-api')) {
      restPath = pathname.replace(/^\/notion-api/, '');
    }
  }
  if (!restPath) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'missing path' }) };
  }

  const ip = (event.headers['client-ip'] || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown');
  if (rateLimited(ip)) {
    return { statusCode: 429, headers: cors, body: JSON.stringify({ error: 'too many requests' }) };
  }

  const invalid = validatePath(event.httpMethod, restPath);
  if (invalid) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: invalid }) };
  }

  const token = getToken();
  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'server missing NOTION_TOKEN env' }) };
  }

  try {
    const upstream = await fetch(`${NOTION_API}${restPath}`, {
      method: event.httpMethod,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: event.body || undefined,
    });
    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: text || '{}',
    };
  } catch (err) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'notion upstream error' }) };
  }
};

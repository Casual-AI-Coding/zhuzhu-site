const API_BASE = '/notion-api';
const NOTION_VERSION = '2022-06-28';

// 获取 token
function getToken() {
  return import.meta.env.VITE_NOTION_TOKEN;
}

// 通用请求方法
async function notionRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('Missing VITE_NOTION_TOKEN');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Notion API error: ${response.status}`);
  }

  return response.json();
}

// 数据库 ID
const DATABASES = {
  anniversary: import.meta.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: import.meta.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: import.meta.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: import.meta.env.VITE_NOTION_DATABASE_MESSAGES,
};

// 获取纪念日列表
export async function fetchAnniversaries() {
  try {
    const response = await notionRequest(`/databases/${DATABASES.anniversary}/query`, {
      method: 'POST',
      body: JSON.stringify({
        sorts: [{ property: '日期', direction: 'ascending' }],
      }),
    });

    return response.results.map(page => ({
      id: page.id,
      title: page.properties['名称']?.rich_text[0]?.plain_text || '',
      date: page.properties['日期']?.date?.start || '',
      type: page.properties['类型']?.select?.name || '',
      description: page.properties['描述']?.rich_text[0]?.plain_text || '',
    }));
  } catch (error) {
    console.error('Error fetching anniversaries:', error);
    return [];
  }
}

// 获取相册照片
export async function fetchPhotos() {
  try {
    const response = await notionRequest(`/databases/${DATABASES.photos}/query`, {
      method: 'POST',
      body: JSON.stringify({
        sorts: [{ property: '日期', direction: 'descending' }],
      }),
    });

    return response.results.map(page => {
      const files = page.properties['图片']?.files || [];
      const imageUrl = files[0]?.file?.url || files[0]?.external?.url || '';

      return {
        id: page.id,
        title: page.properties['标题']?.rich_text[0]?.plain_text || '',
        url: imageUrl,
        date: page.properties['日期']?.date?.start || '',
        place: page.properties['地点']?.place?.name || '',
        tags: page.properties['标签']?.multi_select?.map(tag => tag.name) || [],
        description: page.properties['描述']?.rich_text[0]?.plain_text || '',
      };
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

// 获取时光轴事件
export async function fetchTimeline() {
  try {
    const response = await notionRequest(`/databases/${DATABASES.timeline}/query`, {
      method: 'POST',
      body: JSON.stringify({
        sorts: [{ property: '日期', direction: 'ascending' }],
      }),
    });

    return response.results.map(page => ({
      id: page.id,
      title: page.properties['事件']?.rich_text[0]?.plain_text || '',
      date: page.properties['日期']?.date?.start || '',
      description: page.properties['描述']?.rich_text[0]?.plain_text || '',
      importance: page.properties['重要度']?.select?.name || '中',
    }));
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }
}

// 获取留言列表
export async function fetchMessages() {
  try {
    const response = await notionRequest(`/databases/${DATABASES.messages}/query`, {
      method: 'POST',
      body: JSON.stringify({
        sorts: [{ property: '时间', direction: 'descending' }],
      }),
    });

    return response.results.map(page => ({
      id: page.id,
      content: page.properties['内容']?.rich_text[0]?.plain_text || '',
      sender: page.properties['发送者']?.select?.name || '',
      time: page.properties['时间']?.date?.start || '',
      mood: page.properties['心情']?.select?.name || '',
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// 发送新留言
export async function addMessage(content, sender, mood = '开心') {
  try {
    // 先查询当前有多少条记录来确定ID
    const existing = await notionRequest(`/databases/${DATABASES.messages}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 1 }),
    });
    const newId = (existing.results.length + 1).toString();

    const response = await notionRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: DATABASES.messages },
        properties: {
          'Id': {
            title: [{ text: { content: newId } }],
          },
          '内容': {
            rich_text: [{ text: { content } }],
          },
          '发送者': {
            select: { name: sender },
          },
          '心情': {
            select: { name: mood },
          },
          '时间': {
            date: { start: new Date().toISOString().split('T')[0] },
          },
        },
      }),
    });

    return {
      id: response.id,
      content,
      sender,
      time: new Date().toISOString(),
      mood,
    };
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

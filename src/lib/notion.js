const API_BASE = '/notion-api';
const NOTION_VERSION = '2022-06-28';
const MAX_RETRIES = 2;

// 获取 token
function getToken() {
  return import.meta.env.VITE_NOTION_TOKEN;
}

// 带重试机制的请求方法
async function notionRequest(endpoint, options = {}, retryCount = 0) {
  const token = getToken();
  if (!token) {
    throw new Error('Missing VITE_NOTION_TOKEN');
  }

  try {
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
  } catch (error) {
    // 如果还有重试次数，等待一下再试
    if (retryCount < MAX_RETRIES) {
      console.warn(`Notion API 请求失败，100ms后重试... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 100));
      return notionRequest(endpoint, options, retryCount + 1);
    }
    throw error;
  }
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
      
      // 优先使用 Notion 缩略图
      const thumbnailUrl = page.thumbnail?.file?.url || page.thumbnail?.external?.url || '';

      return {
        id: page.id,
        title: page.properties['标题']?.rich_text[0]?.plain_text || '',
        url: imageUrl,
        thumbnailUrl: thumbnailUrl, // 缩略图
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
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      }),
    });

    return response.results.map(page => ({
      id: page.id,
      content: page.properties['内容']?.rich_text[0]?.plain_text || '',
      sender: page.properties['发送者']?.select?.name || '',
      time: page.created_time,
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
    // 查询所有留言获取最大ID
    const existing = await notionRequest(`/databases/${DATABASES.messages}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 100 }),
    });
    
    // 计算最大ID
    let maxId = 0;
    for (const page of existing.results) {
      const idText = page.properties['Id']?.title[0]?.plain_text || '0';
      const idNum = parseInt(idText, 10);
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
    const newId = (maxId + 1).toString();

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
        },
      }),
    });

    return {
      id: response.id,
      content,
      sender,
      time: response.created_time,
      mood,
    };
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

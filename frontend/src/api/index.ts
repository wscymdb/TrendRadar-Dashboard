/**
 * TrendRadar 前后端交互 API Client
 */

// 开发环境下指向本地后端 7773 端口，生产环境同源
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.port === '5173' || window.location.port === '5174'
    ? 'http://localhost:7773'
    : '');

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      return { success: false, message: `HTTP Error: ${res.status}` };
    }

    const json = await res.json();
    return {
      success: json.code === 0,
      data: json.data,
      message: json.message,
    };
  } catch (error: any) {
    return { success: false, message: error.message || '网络请求失败' };
  }
}

// -------------------------------------------------------------
// 具体业务 API
// -------------------------------------------------------------

export const Api = {
  // 1. 系统状态
  getStatus: () => fetchApi('/api/status'),

  // 2. 爬虫控制与日志
  triggerCrawl: (mode = 'current') =>
    fetchApi('/api/crawl', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
  getCrawlLogs: () => fetchApi('/api/crawl/logs'),
  getCrawlHistory: () => fetchApi('/api/crawl/history'),
  clearCrawlHistory: () =>
    fetchApi('/api/crawl/history', {
      method: 'DELETE',
    }),

  // 6. 系统配置与维护
  getConfig: () => fetchApi('/api/config'),
  saveConfig: (data: Record<string, any>) =>
    fetchApi('/api/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  triggerCleanup: () =>
    fetchApi('/api/cleanup', {
      method: 'POST',
    }),

  // 3.5 平台与 RSS 源
  getFeeds: () => fetchApi('/api/feeds'),
  saveFeeds: (data: { platforms?: any[]; rssFeeds?: any[]; globalMaxAgeDays?: number }) =>
    fetchApi('/api/feeds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 4. 关键词词库
  getKeywords: () => fetchApi('/api/keywords'),
  saveKeywords: (formattedText: string) =>
    fetchApi('/api/keywords', {
      method: 'POST',
      body: JSON.stringify({ formattedText }),
    }),
  resetKeywords: () =>
    fetchApi('/api/keywords/reset', {
      method: 'POST',
    }),

  // 5. 真实热搜新闻 (支持实时 scope=current 与历史全量 scope=history，以及按日期查询 date)
  getDates: () => fetchApi('/api/dates'),
  getNews: (
    platform?: string,
    search?: string,
    scope: 'current' | 'history' = 'current',
    date?: string
  ) => {
    const params = new URLSearchParams();
    if (platform && platform !== 'all') params.append('platform', platform);
    if (search) params.append('search', search);
    params.append('scope', scope);
    if (date) params.append('date', date);
    return fetchApi(`/api/news?${params.toString()}`);
  },

  // 6. 测试工具
  testAi: () => fetchApi('/api/test/ai', { method: 'POST' }),
  testWebhook: (channel: string, url: string) =>
    fetchApi('/api/test/webhook', {
      method: 'POST',
      body: JSON.stringify({ channel, url }),
    }),
};

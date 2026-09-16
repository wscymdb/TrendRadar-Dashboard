/**
 * TrendRadar 前后端交互 API Client
 */

// 开发环境下指向本地后端 7773 端口，生产环境同源
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.port === '5173' || window.location.port === '5174'
    ? 'http://localhost:7773'
    : '');

const AUTH_TOKEN_KEY = 'trendradar_auth_token';

export const getAuthToken = (): string => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
};

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
};

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; status?: number }> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // 401 未授权拦截，若不在登录页则清除 token 并跳转
      removeAuthToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
      return { success: false, status: 401, message: '未经授权或登录已过期，请重新登录' };
    }

    if (!res.ok) {
      return { success: false, status: res.status, message: `HTTP Error: ${res.status}` };
    }

    const json = await res.json();
    return {
      success: json.code === 0,
      data: json.data,
      message: json.message,
      status: res.status,
    };
  } catch (error: any) {
    return { success: false, message: error.message || '网络请求失败' };
  }
}

// -------------------------------------------------------------
// 具体业务 API
// -------------------------------------------------------------

export const Api = {
  // 0. 访问安全认证与鉴权
  getAuthStatus: () => fetchApi<{ needAuth: boolean; isAuthenticated: boolean }>('/api/auth/status'),
  login: (password: string) =>
    fetchApi<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  logout: () =>
    fetchApi('/api/auth/logout', {
      method: 'POST',
    }),

  // 1. 系统状态
  getStatus: () => fetchApi('/api/status'),

  // 2. 爬虫控制与日志
  triggerCrawl: (mode = 'current') =>
    fetchApi('/api/crawl', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
  getCrawlLogs: () => fetchApi('/api/crawl/logs'),
  clearCrawlLogs: () =>
    fetchApi('/api/crawl/logs', {
      method: 'DELETE',
    }),
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

  // 7. 系统驾驶舱与性能监控
  getSystemOverview: () => fetchApi('/api/system/overview'),
  getSystemMetrics: () => fetchApi('/api/system/metrics'),
  getSystemProbes: () => fetchApi('/api/system/probes'),
  cleanSystemLogs: () => fetchApi('/api/system/clean-logs', { method: 'POST' }),
};

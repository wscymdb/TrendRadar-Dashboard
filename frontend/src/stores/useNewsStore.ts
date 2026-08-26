import { create } from 'zustand';
import { NewsItem, CrawlLog } from '@/types/news';
import { MOCK_HOT_NEWS } from '@/mock/initialData';

interface NewsStore {
  newsList: NewsItem[];
  isCrawling: boolean;
  crawlProgress: number;
  logs: CrawlLog[];
  lastCrawlTime: string;
  selectedPlatform: string;
  searchKeyword: string;
  setSelectedPlatform: (platform: string) => void;
  setSearchKeyword: (keyword: string) => void;
  triggerCrawl: (onLogUpdate?: (log: string) => void) => Promise<void>;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  newsList: MOCK_HOT_NEWS,
  isCrawling: false,
  crawlProgress: 0,
  logs: [],
  lastCrawlTime: '2026-08-26 11:40:19',
  selectedPlatform: 'all',
  searchKeyword: '',
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  triggerCrawl: async (onLogUpdate) => {
    if (get().isCrawling) return;
    set({ isCrawling: true, crawlProgress: 10, logs: [] });

    const addLog = (message: string, type: CrawlLog['type'] = 'info') => {
      const logItem: CrawlLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      };
      set((state) => ({ logs: [...state.logs, logItem] }));
      onLogUpdate?.(message);
    };

    addLog('🚀 触发全网热搜爬取任务 (python -m trendradar)...');
    await new Promise((r) => setTimeout(r, 600));

    set({ crawlProgress: 30 });
    addLog('🌐 正在并发连接 11 大热搜平台 (今日头条/微博/知乎/B站/抖音/华尔街见闻)...');
    await new Promise((r) => setTimeout(r, 700));

    set({ crawlProgress: 60 });
    addLog('📦 抓取完成：新增 255 条热点，正在执行关键词频率匹配与新鲜度过滤...');
    await new Promise((r) => setTimeout(r, 600));

    set({ crawlProgress: 85 });
    addLog('🤖 正在执行 AI 智能提炼与多维度深度分析...', 'success');
    await new Promise((r) => setTimeout(r, 600));

    set({ crawlProgress: 100 });
    addLog('✅ 热点报告渲染完成，已生成最新 HTML 报告并推送通知！', 'success');

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    set({
      isCrawling: false,
      lastCrawlTime: nowStr,
      newsList: [
        {
          id: `new_${Date.now()}`,
          rank: 1,
          title: `[刚刚抓取] 全网最新突发热点：AI 与智能体技术迎来新一轮爆发 (${nowStr})`,
          url: 'https://news.cn',
          platform: 'toutiao',
          platformName: '今日头条',
          heat: '5.2M',
          isNew: true,
          matchedKeywords: ['AI', '大模型', '智能体'],
          firstFoundTime: nowStr.split(' ')[1] || '12:00',
          lastFoundTime: nowStr.split(' ')[1] || '12:00',
          duration: '刚刚',
          occurrenceCount: 1,
        },
        ...get().newsList,
      ],
    });
  },
}));

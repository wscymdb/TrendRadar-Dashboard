import { create } from 'zustand';
import { NewsItem, CrawlLog } from '@/types/news';
import { Api } from '@/api';

interface NewsStore {
  newsList: NewsItem[];
  totalCurrent: number;
  totalHistory: number;
  viewScope: 'current' | 'history';
  availableDates: string[];
  selectedDate: string;
  isCrawling: boolean;
  crawlProgress: number;
  logs: CrawlLog[];
  lastCrawlTime: string;
  selectedPlatform: string;
  searchKeyword: string;
  setSelectedPlatform: (platform: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setViewScope: (scope: 'current' | 'history') => void;
  setSelectedDate: (date: string) => void;
  fetchDates: () => Promise<void>;
  fetchLatestNews: (scope?: 'current' | 'history', date?: string) => Promise<void>;
  triggerCrawl: () => Promise<void>;
  pollLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  newsList: [],
  totalCurrent: 0,
  totalHistory: 0,
  viewScope: 'current',
  availableDates: [],
  selectedDate: '',
  isCrawling: false,
  crawlProgress: 0,
  logs: [],
  lastCrawlTime: '尚未抓取',
  selectedPlatform: 'all',
  searchKeyword: '',
  setSelectedPlatform: (platform) => {
    set({ selectedPlatform: platform });
  },
  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword });
  },
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchLatestNews(get().viewScope, date);
  },
  setViewScope: (scope) => {
    set({ viewScope: scope });
    get().fetchLatestNews(scope, get().selectedDate);
  },
  fetchDates: async () => {
    const res = await Api.getDates();
    if (res.success && Array.isArray(res.data)) {
      const dates = res.data;
      set({
        availableDates: dates,
        selectedDate:
          dates.length > 0
            ? get().selectedDate && dates.includes(get().selectedDate)
              ? get().selectedDate
              : dates[0]
            : '',
      });
    }
  },
  fetchLatestNews: async (scope, date) => {
    const sc = scope !== undefined ? scope : get().viewScope;
    const d = date !== undefined ? date : get().selectedDate;
    const res = await Api.getNews(undefined, undefined, sc, d);
    if (res.success && res.data) {
      if (Array.isArray(res.data)) {
        set({ newsList: res.data });
      } else if (res.data.items) {
        set({
          newsList: res.data.items,
          totalCurrent: res.data.totalCurrent || 0,
          totalHistory: res.data.totalHistory || 0,
          selectedDate: res.data.currentDate || get().selectedDate,
        });
      }
    }
  },
  clearLogs: async () => {
    set({ logs: [] });
    try {
      await Api.clearCrawlLogs();
    } catch (e) {
      console.error(e);
    }
  },
  pollLogs: async () => {
    const res = await Api.getCrawlLogs();
    if (res.success && res.data) {
      set({
        logs: res.data.logs || [],
        isCrawling: res.data.isCrawling,
        lastCrawlTime: res.data.lastCrawlTime || get().lastCrawlTime,
      });
    }
  },
  triggerCrawl: async () => {
    if (get().isCrawling) return;
    set({ isCrawling: true, crawlProgress: 15, logs: [] });
    try {
      await Api.clearCrawlLogs();
    } catch {
      // ignore
    }

    const res = await Api.triggerCrawl();

    if (res.success) {
      const interval = setInterval(async () => {
        const logRes = await Api.getCrawlLogs();
        if (logRes.success && logRes.data) {
          set({
            logs: logRes.data.logs || [],
            isCrawling: logRes.data.isCrawling,
            lastCrawlTime: logRes.data.lastCrawlTime || get().lastCrawlTime,
          });

          if (!logRes.data.isCrawling) {
            clearInterval(interval);
            set({ crawlProgress: 100 });
            get().fetchDates();
            get().fetchLatestNews();
          }
        }
      }, 1000);
    } else {
      set({ isCrawling: false });
    }
  },
}));

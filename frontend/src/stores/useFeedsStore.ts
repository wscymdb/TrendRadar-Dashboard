import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlatformItem, RssFeedItem } from '@/types/feeds';
import { Api } from '@/api';

interface FeedsStore {
  platforms: PlatformItem[];
  rssFeeds: RssFeedItem[];
  globalMaxAgeDays: number;
  togglePlatform: (id: string) => void;
  setAllPlatforms: (enabled: boolean) => void;
  toggleRssFeed: (id: string) => void;
  addRssFeed: (feed: Omit<RssFeedItem, 'id'>) => void;
  updateRssFeed: (id: string, feed: Partial<RssFeedItem>) => void;
  deleteRssFeed: (id: string) => void;
  setGlobalMaxAgeDays: (days: number) => void;
  syncFromBackend: () => Promise<void>;
  saveToBackend: () => Promise<boolean>;
}

export const useFeedsStore = create<FeedsStore>()(
  persist(
    (set, get) => ({
      platforms: [],
      rssFeeds: [],
      globalMaxAgeDays: 1,
      togglePlatform: (id) => {
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          ),
        }));
        get().saveToBackend();
      },
      setAllPlatforms: (enabled) => {
        set((state) => ({
          platforms: state.platforms.map((p) => ({ ...p, enabled })),
        }));
        get().saveToBackend();
      },
      toggleRssFeed: (id) => {
        set((state) => ({
          rssFeeds: state.rssFeeds.map((f) =>
            f.id === id ? { ...f, enabled: !f.enabled } : f
          ),
        }));
        get().saveToBackend();
      },
      addRssFeed: (feed) => {
        set((state) => ({
          rssFeeds: [
            ...state.rssFeeds,
            {
              ...feed,
              id: `rss_${Date.now()}`,
              lastFetchedAt: '刚刚添加',
              articleCount: 0,
            },
          ],
        }));
        get().saveToBackend();
      },
      updateRssFeed: (id, updated) => {
        set((state) => ({
          rssFeeds: state.rssFeeds.map((f) =>
            f.id === id ? { ...f, ...updated } : f
          ),
        }));
        get().saveToBackend();
      },
      deleteRssFeed: (id) => {
        set((state) => ({
          rssFeeds: state.rssFeeds.filter((f) => f.id !== id),
        }));
        get().saveToBackend();
      },
      setGlobalMaxAgeDays: (days) => {
        set({ globalMaxAgeDays: days });
        get().saveToBackend();
      },
      syncFromBackend: async () => {
        const res = await Api.getFeeds();
        if (res.success && res.data) {
          set({
            platforms: res.data.platforms || [],
            rssFeeds: res.data.rssFeeds || [],
            globalMaxAgeDays: res.data.globalMaxAgeDays || 1,
          });
        }
      },
      saveToBackend: async () => {
        const { platforms, rssFeeds, globalMaxAgeDays } = get();
        const res = await Api.saveFeeds({ platforms, rssFeeds, globalMaxAgeDays });
        return res.success;
      },
    }),
    {
      name: 'trendradar_feeds_store',
    }
  )
);

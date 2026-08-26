import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlatformItem, RssFeedItem } from '@/types/feeds';
import { INITIAL_PLATFORMS, INITIAL_RSS_FEEDS } from '@/mock/initialData';

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
}

export const useFeedsStore = create<FeedsStore>()(
  persist(
    (set) => ({
      platforms: INITIAL_PLATFORMS,
      rssFeeds: INITIAL_RSS_FEEDS,
      globalMaxAgeDays: 1,
      togglePlatform: (id) =>
        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          ),
        })),
      setAllPlatforms: (enabled) =>
        set((state) => ({
          platforms: state.platforms.map((p) => ({ ...p, enabled })),
        })),
      toggleRssFeed: (id) =>
        set((state) => ({
          rssFeeds: state.rssFeeds.map((f) =>
            f.id === id ? { ...f, enabled: !f.enabled } : f
          ),
        })),
      addRssFeed: (feed) =>
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
        })),
      updateRssFeed: (id, updated) =>
        set((state) => ({
          rssFeeds: state.rssFeeds.map((f) =>
            f.id === id ? { ...f, ...updated } : f
          ),
        })),
      deleteRssFeed: (id) =>
        set((state) => ({
          rssFeeds: state.rssFeeds.filter((f) => f.id !== id),
        })),
      setGlobalMaxAgeDays: (days) => set({ globalMaxAgeDays: days }),
    }),
    {
      name: 'trendradar_feeds_store',
    }
  )
);

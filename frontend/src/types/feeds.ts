export interface PlatformItem {
  id: string;
  name: string;
  category: 'social' | 'news' | 'finance' | 'tech';
  enabled: boolean;
  iconName: string;
  description: string;
}

export interface RssFeedItem {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  maxAgeDays?: number;
  description?: string;
  lastFetchedAt?: string;
  articleCount?: number;
}

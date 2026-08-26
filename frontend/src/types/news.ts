export interface NewsItem {
  id: string;
  rank: number;
  title: string;
  url: string;
  platform: string;
  platformName: string;
  heat?: string | number;
  isNew?: boolean;
  category?: string;
  matchedKeywords?: string[];
  publishTime?: string;
  firstFoundTime?: string;
  lastFoundTime?: string;
  createdAt?: string;
  duration?: string;
  occurrenceCount?: number;
}

export interface CrawlLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

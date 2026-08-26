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
  firstFoundTime?: string;
  lastFoundTime?: string;
  duration?: string;
  occurrenceCount?: number;
}

export interface CrawlLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

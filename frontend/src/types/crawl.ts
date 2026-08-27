export type CrawlStatus = 'success' | 'partial_error' | 'error';
export type CrawlTriggerType = 'cron' | 'manual' | 'startup';

export interface CrawlLogItem {
  timestamp: string;
  type: string;
  message: string;
}

export interface CrawlHistorySession {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  triggerType: CrawlTriggerType;
  triggerLabel: string;
  mode: string;
  status: CrawlStatus;
  totalNews: number;
  matchedNews: number;
  successPlatforms: string[];
  failedPlatforms: string[];
  rssCount: number;
  notifications: string[];
  logCount: number;
  logs: CrawlLogItem[];
}

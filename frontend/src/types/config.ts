export interface WebhookItem {
  id: string;
  name: string; // 备注群名
  url: string;  // Webhook URL
  enabled?: boolean;
}

export interface ConfigState {
  // Web Server
  webserverPort: number;

  // AI 大模型配置
  aiEnabled: boolean;
  aiModel: string;
  aiApiKey: string;
  aiApiBase: string;

  // 多 Webhook 列表与通知渠道配置
  feishuWebhook: string;
  dingtalkWebhook: string;
  weworkWebhook: string;
  feishuWebhooks: WebhookItem[];
  dingtalkWebhooks: WebhookItem[];
  weworkWebhooks: WebhookItem[];
  weworkMsgType: 'markdown' | 'text';
  telegramBotToken: string;
  telegramChatId: string;
  emailFrom: string;
  emailPassword: string;
  emailTo: string;
  emailSmtpServer: string;
  emailSmtpPort: number;

  // 运行配置
  cronSchedule: string;
  runMode: 'current' | 'daily' | 'incremental';
  immediateRun: boolean;

  // 存储容量与数据生命周期
  maxNewsCapacity: number;
  dataRetentionDays: number;
  autoCleanupEnabled: boolean;
}

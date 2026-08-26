export interface ConfigState {
  // Web Server
  webserverPort: number;
  
  // AI 大模型配置
  aiEnabled: boolean;
  aiModel: string;
  aiApiKey: string;
  aiApiBase: string;
  
  // 通知渠道配置
  feishuWebhook: string;
  dingtalkWebhook: string;
  weworkWebhook: string;
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
}

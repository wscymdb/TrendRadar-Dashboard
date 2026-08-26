import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConfigState } from '@/types/config';

interface ConfigStore extends ConfigState {
  setAiConfig: (config: Partial<Pick<ConfigState, 'aiEnabled' | 'aiModel' | 'aiApiKey' | 'aiApiBase'>>) => void;
  setNotificationConfig: (config: Partial<Pick<ConfigState, 'feishuWebhook' | 'dingtalkWebhook' | 'weworkWebhook' | 'weworkMsgType' | 'telegramBotToken' | 'telegramChatId'>>) => void;
  setRunConfig: (config: Partial<Pick<ConfigState, 'runMode' | 'cronSchedule' | 'immediateRun'>>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: ConfigState = {
  webserverPort: 7773,
  aiEnabled: false,
  aiModel: 'deepseek/deepseek-chat',
  aiApiKey: '',
  aiApiBase: '',
  feishuWebhook: '',
  dingtalkWebhook: '',
  weworkWebhook: '',
  weworkMsgType: 'markdown',
  telegramBotToken: '',
  telegramChatId: '',
  emailFrom: '',
  emailPassword: '',
  emailTo: '',
  emailSmtpServer: '',
  emailSmtpPort: 465,
  cronSchedule: '*/30 * * * *',
  runMode: 'current',
  immediateRun: true,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,
      setAiConfig: (cfg) => set((state) => ({ ...state, ...cfg })),
      setNotificationConfig: (cfg) => set((state) => ({ ...state, ...cfg })),
      setRunConfig: (cfg) => set((state) => ({ ...state, ...cfg })),
      resetConfig: () => set(DEFAULT_CONFIG),
    }),
    {
      name: 'trendradar_config_store',
    }
  )
);

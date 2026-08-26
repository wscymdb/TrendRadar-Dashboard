import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConfigState } from '@/types/config';
import { Api } from '@/api';

interface ConfigStore extends ConfigState {
  setAiConfig: (config: Partial<Pick<ConfigState, 'aiEnabled' | 'aiModel' | 'aiApiKey' | 'aiApiBase'>>) => void;
  setNotificationConfig: (config: Partial<Pick<ConfigState, 'feishuWebhook' | 'dingtalkWebhook' | 'weworkWebhook' | 'weworkMsgType' | 'telegramBotToken' | 'telegramChatId'>>) => void;
  setRunConfig: (config: Partial<Pick<ConfigState, 'runMode' | 'cronSchedule' | 'immediateRun'>>) => void;
  setStorageConfig: (config: Partial<Pick<ConfigState, 'maxNewsCapacity' | 'dataRetentionDays' | 'autoCleanupEnabled'>>) => void;
  triggerManualCleanup: () => Promise<{ success: boolean; message: string; data?: any }>;
  syncFromBackend: () => Promise<void>;
  saveToBackend: () => Promise<{ success: boolean; message: string }>;
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
  maxNewsCapacity: 1000,
  dataRetentionDays: 30,
  autoCleanupEnabled: true,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,
      // 仅修改本地/内存状态，禁止自动发起网络请求
      setAiConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      setNotificationConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      setRunConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      setStorageConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      triggerManualCleanup: async () => {
        const res = await Api.triggerCleanup();
        return {
          success: res.success,
          message: res.message || (res.success ? '清理成功' : '清理失败'),
          data: res.data,
        };
      },
      syncFromBackend: async () => {
        const res = await Api.getConfig();
        if (res.success && res.data) {
          set((state) => ({ ...state, ...res.data }));
        }
      },
      // 只有在用户显式点击保存配置时才发起网络请求
      saveToBackend: async () => {
        const state = get();
        const res = await Api.saveConfig(state);
        return {
          success: res.success,
          message: res.message || (res.success ? '配置已成功保存！' : '保存配置失败，请检查网络'),
        };
      },
      resetConfig: () => {
        set(DEFAULT_CONFIG);
      },
    }),
    {
      name: 'trendradar_config_store',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConfigState, WebhookItem } from '@/types/config';
import { Api } from '@/api';

export const parseUrlsToItems = (str: string, defaultPrefix: string): WebhookItem[] => {
  if (!str) return [];
  const urls = str.split(';').map((s) => s.trim()).filter(Boolean);
  return urls.map((url, idx) => ({
    id: `hook_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    name: urls.length === 1 ? defaultPrefix : `${defaultPrefix} ${idx + 1}`,
    url,
    enabled: true,
  }));
};

export const serializeItemsToUrls = (items: WebhookItem[]): string => {
  return (items || [])
    .filter((i) => i.enabled !== false && i.url && i.url.trim())
    .map((i) => i.url.trim())
    .join(';');
};

interface ConfigStore extends ConfigState {
  setAiConfig: (config: Partial<Pick<ConfigState, 'aiEnabled' | 'aiModel' | 'aiApiKey' | 'aiApiBase'>>) => void;
  setNotificationConfig: (config: Partial<Pick<ConfigState, 'feishuWebhook' | 'dingtalkWebhook' | 'weworkWebhook' | 'feishuWebhooks' | 'dingtalkWebhooks' | 'weworkWebhooks' | 'weworkMsgType' | 'telegramBotToken' | 'telegramChatId'>>) => void;
  addWebhookItem: (channel: 'dingtalk' | 'feishu' | 'wework', item?: Partial<WebhookItem>) => void;
  updateWebhookItem: (channel: 'dingtalk' | 'feishu' | 'wework', id: string, patch: Partial<WebhookItem>) => void;
  removeWebhookItem: (channel: 'dingtalk' | 'feishu' | 'wework', id: string) => void;
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
  feishuWebhooks: [],
  dingtalkWebhooks: [],
  weworkWebhooks: [],
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
      setAiConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      setNotificationConfig: (cfg) => {
        set((state) => ({ ...state, ...cfg }));
      },
      addWebhookItem: (channel, item) => {
        set((state) => {
          const listKey = channel === 'dingtalk' ? 'dingtalkWebhooks' : channel === 'feishu' ? 'feishuWebhooks' : 'weworkWebhooks';
          const defaultName = channel === 'dingtalk' ? '钉钉群' : channel === 'feishu' ? '飞书群' : '企微群';
          const currentList = state[listKey] || [];
          const newItem: WebhookItem = {
            id: `hook_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: item?.name || `${defaultName} ${currentList.length + 1}`,
            url: item?.url || '',
            enabled: true,
          };
          const updated = [...currentList, newItem];
          const strKey = channel === 'dingtalk' ? 'dingtalkWebhook' : channel === 'feishu' ? 'feishuWebhook' : 'weworkWebhook';
          return {
            ...state,
            [listKey]: updated,
            [strKey]: serializeItemsToUrls(updated),
          };
        });
      },
      updateWebhookItem: (channel, id, patch) => {
        set((state) => {
          const listKey = channel === 'dingtalk' ? 'dingtalkWebhooks' : channel === 'feishu' ? 'feishuWebhooks' : 'weworkWebhooks';
          const currentList = state[listKey] || [];
          const updated = currentList.map((item) => (item.id === id ? { ...item, ...patch } : item));
          const strKey = channel === 'dingtalk' ? 'dingtalkWebhook' : channel === 'feishu' ? 'feishuWebhook' : 'weworkWebhook';
          return {
            ...state,
            [listKey]: updated,
            [strKey]: serializeItemsToUrls(updated),
          };
        });
      },
      removeWebhookItem: (channel, id) => {
        set((state) => {
          const listKey = channel === 'dingtalk' ? 'dingtalkWebhooks' : channel === 'feishu' ? 'feishuWebhooks' : 'weworkWebhooks';
          const currentList = state[listKey] || [];
          const updated = currentList.filter((item) => item.id !== id);
          const strKey = channel === 'dingtalk' ? 'dingtalkWebhook' : channel === 'feishu' ? 'feishuWebhook' : 'weworkWebhook';
          return {
            ...state,
            [listKey]: updated,
            [strKey]: serializeItemsToUrls(updated),
          };
        });
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
          const d = res.data;
          set((state) => ({
            ...state,
            ...d,
            dingtalkWebhooks:
              Array.isArray(d.dingtalkWebhooks) && d.dingtalkWebhooks.length > 0
                ? d.dingtalkWebhooks
                : parseUrlsToItems(d.dingtalkWebhook || '', '钉钉群'),
            feishuWebhooks:
              Array.isArray(d.feishuWebhooks) && d.feishuWebhooks.length > 0
                ? d.feishuWebhooks
                : parseUrlsToItems(d.feishuWebhook || '', '飞书群'),
            weworkWebhooks:
              Array.isArray(d.weworkWebhooks) && d.weworkWebhooks.length > 0
                ? d.weworkWebhooks
                : parseUrlsToItems(d.weworkWebhook || '', '企微群'),
          }));
        }
      },
      saveToBackend: async () => {
        const state = get();
        // 序列化多 Webhook 为分号分隔标准格式
        const dtStr = serializeItemsToUrls(state.dingtalkWebhooks);
        const fsStr = serializeItemsToUrls(state.feishuWebhooks);
        const wwStr = serializeItemsToUrls(state.weworkWebhooks);

        const payload = {
          ...state,
          dingtalkWebhooks: state.dingtalkWebhooks,
          feishuWebhooks: state.feishuWebhooks,
          weworkWebhooks: state.weworkWebhooks,
          dingtalkWebhook: dtStr,
          feishuWebhook: fsStr,
          weworkWebhook: wwStr,
        };

        const res = await Api.saveConfig(payload);
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

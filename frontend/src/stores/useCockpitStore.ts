import { create } from 'zustand';
import { Api } from '@/api';
import { SystemOverview, SystemMetrics, ProbeResult, MetricSample } from '@/types/cockpit';

const MAX_HISTORY_POINTS = 30;

interface CockpitStore {
  overview: SystemOverview | null;
  metrics: SystemMetrics | null;
  history: MetricSample[];
  probes: ProbeResult[];
  isLoading: boolean;
  isProbing: boolean;
  refreshInterval: number; // 毫秒，0 代表暂停
  isCleaningLogs: boolean;

  setRefreshInterval: (interval: number) => void;
  fetchOverview: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchProbes: () => Promise<void>;
  cleanLogs: () => Promise<{ success: boolean; message: string }>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingTimer: NodeJS.Timeout | null = null;
let probeTimer: NodeJS.Timeout | null = null;

export const useCockpitStore = create<CockpitStore>((set, get) => ({
  overview: null,
  metrics: null,
  history: [],
  probes: [],
  isLoading: false,
  isProbing: false,
  refreshInterval: 3000,
  isCleaningLogs: false,

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
    get().stopPolling();
    if (interval > 0) {
      get().startPolling();
    }
  },

  fetchOverview: async () => {
    const res = await Api.getSystemOverview();
    if (res.success && res.data) {
      set({ overview: res.data });
    }
  },

  fetchMetrics: async () => {
    const res = await Api.getSystemMetrics();
    if (res.success && res.data) {
      const data: SystemMetrics = res.data;
      const date = new Date(data.timestamp);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

      const newSample: MetricSample = {
        timestamp: data.timestamp,
        timeStr,
        cpuPercent: data.cpu.percent,
        memPercent: data.memory.percent,
        rxSpeedKb: data.network.rxSpeedKb,
        txSpeedKb: data.network.txSpeedKb,
      };

      set((state) => {
        const nextHistory = [...state.history, newSample];
        return {
          metrics: data,
          history: nextHistory.length > MAX_HISTORY_POINTS
            ? nextHistory.slice(nextHistory.length - MAX_HISTORY_POINTS)
            : nextHistory,
        };
      });
    }
  },

  fetchProbes: async () => {
    set({ isProbing: true });
    try {
      const res = await Api.getSystemProbes();
      if (res.success && Array.isArray(res.data)) {
        set({ probes: res.data });
      }
    } finally {
      set({ isProbing: false });
    }
  },

  cleanLogs: async () => {
    set({ isCleaningLogs: true });
    try {
      const res = await Api.cleanSystemLogs();
      if (res.success) {
        // 重新拉取一次 metrics 刷新日志体积
        await get().fetchMetrics();
        return { success: true, message: res.message || '清理成功' };
      }
      return { success: false, message: res.message || '清理失败' };
    } finally {
      set({ isCleaningLogs: false });
    }
  },

  startPolling: () => {
    get().stopPolling();

    // 立即执行初次拉取
    get().fetchOverview();
    get().fetchMetrics();
    get().fetchProbes();

    const interval = get().refreshInterval;
    if (interval > 0) {
      pollingTimer = setInterval(() => {
        get().fetchMetrics();
      }, interval);

      // 外部连通性探测频率更低一些（每 15 秒一次），避免对外部服务高频打扰
      probeTimer = setInterval(() => {
        get().fetchProbes();
      }, Math.max(interval * 4, 12000));
    }
  },

  stopPolling: () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
    if (probeTimer) {
      clearInterval(probeTimer);
      probeTimer = null;
    }
  },
}));

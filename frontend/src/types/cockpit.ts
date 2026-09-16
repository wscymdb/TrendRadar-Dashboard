export interface SystemOverview {
  hostname: string;
  os: string;
  kernel: string;
  architecture: string;
  pythonVersion: string;
  cpuCount: number;
  isDocker: boolean;
  serverStartTime: string;
  bootTime: string;
  uptimeSeconds: number;
  appUptimeSeconds: number;
}

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    percent: number;
    loadAvg: [number, number, number];
    coreCount: number;
  };
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    percent: number;
    swapTotalMb: number;
    swapUsedMb: number;
    swapPercent: number;
  };
  disk: {
    totalGb: number;
    usedGb: number;
    freeGb: number;
    percent: number;
    trendradar: {
      outputMb: number;
      logsMb: number;
      databaseMb: number;
    };
  };
  process: {
    rssMb: number;
    isCrawling: boolean;
  };
  network: {
    rxSpeedKb: number;
    txSpeedKb: number;
  };
}

export interface ProbeResult {
  name: string;
  key: string;
  url: string;
  statusCode: number;
  latencyMs: number;
  isOnline: boolean;
  error?: string;
}

export interface MetricSample {
  timestamp: number;
  timeStr: string;
  cpuPercent: number;
  memPercent: number;
  rxSpeedKb: number;
  txSpeedKb: number;
}

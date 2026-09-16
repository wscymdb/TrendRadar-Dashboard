import React, { useState, useEffect, useRef } from 'react';
import { useCockpitStore } from '@/stores/useCockpitStore';
import HeaderBar from './HeaderBar';
import CpuCard from './CpuCard';
import MemoryCard from './MemoryCard';
import DiskCard from './DiskCard';
import NetworkCard from './NetworkCard';

const CockpitPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    metrics,
    history,
    probes,
    isProbing,
    isCleaningLogs,
    startPolling,
    stopPolling,
    fetchProbes,
    cleanLogs,
  } = useCockpitStore();

  const cpuHistory = history.map((h) => h.cpuPercent);
  const memHistory = history.map((h) => h.memPercent);
  const rxHistory = history.map((h) => h.rxSpeedKb);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const handleCleanLogs = async () => {
    const res = await cleanLogs();
    setToastMessage({
      text: res.message,
      type: res.success ? 'success' : 'error',
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRefreshProbes = () => {
    fetchProbes();
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 ${
        isFullscreen
          ? 'p-6 bg-zinc-100 text-zinc-900 dark:bg-black dark:text-zinc-100 overflow-y-auto'
          : 'space-y-6'
      }`}
    >
      {/* 操作结果提示 Toast */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl border text-xs font-mono shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-500/30 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/90 dark:border-red-500/30 dark:text-red-300'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* 顶部状态与控制栏 */}
      <HeaderBar
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 核心监控网格 (2x2 驾驶舱布局) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* 1. CPU & 系统负载 */}
        <CpuCard
          cpuPercent={metrics?.cpu.percent ?? 0}
          coreCount={metrics?.cpu.coreCount ?? 1}
          loadAvg={metrics?.cpu.loadAvg ?? [0, 0, 0]}
          history={cpuHistory}
          isCrawling={metrics?.process.isCrawling ?? false}
        />

        {/* 2. RAM 内存 & 进程占用 */}
        <MemoryCard
          totalMb={metrics?.memory.totalMb ?? 0}
          usedMb={metrics?.memory.usedMb ?? 0}
          freeMb={metrics?.memory.freeMb ?? 0}
          percent={metrics?.memory.percent ?? 0}
          swapTotalMb={metrics?.memory.swapTotalMb ?? 0}
          swapUsedMb={metrics?.memory.swapUsedMb ?? 0}
          swapPercent={metrics?.memory.swapPercent ?? 0}
          procRssMb={metrics?.process.rssMb ?? 0}
          history={memHistory}
        />

        {/* 3. 磁盘空间 & TrendRadar 资产拆解 */}
        <DiskCard
          totalGb={metrics?.disk.totalGb ?? 0}
          usedGb={metrics?.disk.usedGb ?? 0}
          freeGb={metrics?.disk.freeGb ?? 0}
          percent={metrics?.disk.percent ?? 0}
          trendradarAssets={
            metrics?.disk.trendradar ?? { outputMb: 0, logsMb: 0, databaseMb: 0 }
          }
          onCleanLogs={handleCleanLogs}
          isCleaningLogs={isCleaningLogs}
        />

        {/* 4. 网络吞吐 & 外部热点源连通性雷达 */}
        <NetworkCard
          rxSpeedKb={metrics?.network.rxSpeedKb ?? 0}
          txSpeedKb={metrics?.network.txSpeedKb ?? 0}
          probes={probes}
          rxHistory={rxHistory}
          onRefreshProbes={handleRefreshProbes}
          isProbing={isProbing}
        />
      </div>
    </div>
  );
};

export { CockpitPage };
export default CockpitPage;

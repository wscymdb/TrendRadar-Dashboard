import React, { useState, useEffect } from 'react';
import {
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Server,
  Box,
  Clock,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { useCockpitStore } from '@/stores/useCockpitStore';
import { REFRESH_INTERVAL_OPTIONS, formatSecondsToUptime } from '../constant';

interface HeaderBarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = (props) => {
  const { isFullscreen, onToggleFullscreen } = props;

  const {
    overview,
    metrics,
    refreshInterval,
    setRefreshInterval,
    fetchMetrics,
  } = useCockpitStore();

  const [localUptime, setLocalUptime] = useState(0);

  useEffect(() => {
    if (overview?.uptimeSeconds) {
      setLocalUptime(overview.uptimeSeconds);
    }
  }, [overview?.uptimeSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cpuPercent = metrics?.cpu.percent ?? 0;
  const memPercent = metrics?.memory.percent ?? 0;
  const diskPercent = metrics?.disk.percent ?? 0;
  const isCritical = cpuPercent > 90 || memPercent > 92 || diskPercent > 92;
  const isWarning = !isCritical && (cpuPercent > 75 || memPercent > 80 || diskPercent > 85);

  const healthText = isCritical ? '异常告警' : isWarning ? '负载较高' : '运行正常';
  const healthBadgeColor = isCritical
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30'
    : isWarning
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
  const pulseDotColor = isCritical
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <TooltipProvider delayDuration={150}>
      <header className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 lg:p-4.5 rounded-2xl bg-white/90 border border-zinc-200/90 text-zinc-900 shadow-sm backdrop-blur-xl dark:bg-zinc-950/80 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-2xl transition-colors">
        {/* 左侧：中文标题与运行状态 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 shadow-inner transition-colors shrink-0">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                系统驾驶舱
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${healthBadgeColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pulseDotColor} animate-ping`} />
                <span>{healthText}</span>
              </span>
              {overview?.isDocker && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/50">
                  <Box className="w-2.5 h-2.5" /> Docker 容器
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              服务器性能与运行时监控
            </p>
          </div>
        </div>

        {/* 中间：主机与运行时间元数据（单行紧凑防换行） */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-zinc-100/70 border border-zinc-200/80 text-xs text-zinc-600 dark:bg-zinc-900/50 dark:border-zinc-800/60 dark:text-zinc-300 transition-colors">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Server className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-400 dark:text-zinc-500">节点:</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium max-w-[130px] truncate" title={overview?.hostname}>
              {overview?.hostname || 'localhost'}
            </span>
          </div>
          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-800 shrink-0" />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-zinc-400 dark:text-zinc-500">系统:</span>
            <span className="text-zinc-800 dark:text-zinc-200">{overview?.os || 'Linux'}</span>
          </div>
          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-800 shrink-0" />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-zinc-400 dark:text-zinc-500">已运行:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatSecondsToUptime(localUptime)}</span>
          </div>
        </div>

        {/* 右侧：刷新控制与全屏模式 */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
          {/* 采样频率切换区（带Tooltip） */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 rounded-lg p-1 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  <Radio className="w-3.5 h-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>数据刷新频率（采样周期）</p>
              </TooltipContent>
            </Tooltip>

            {REFRESH_INTERVAL_OPTIONS.map((opt) => {
              const displayLabel = opt.value === 0 ? '暂停' : `${opt.value / 1000}s`;
              return (
                <Tooltip key={opt.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setRefreshInterval(opt.value)}
                      className={`px-2 py-1 rounded transition-all text-[11px] whitespace-nowrap font-mono ${
                        refreshInterval === opt.value
                          ? 'bg-white text-zinc-900 font-semibold shadow-sm border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-100 dark:border-transparent'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{opt.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* 手动单次刷新 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMetrics()}
                className="h-8 px-2.5 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:text-zinc-300 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>立即采样刷新</p>
            </TooltipContent>
          </Tooltip>

          {/* 全屏模式切换 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-8 px-3 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:text-zinc-300 text-xs flex items-center gap-1.5 whitespace-nowrap font-medium"
            title={isFullscreen ? '退出全屏' : '全屏大屏'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>退出全屏</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>全屏大屏</span>
              </>
            )}
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default HeaderBar;

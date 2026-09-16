import React from 'react';
import { Layers, Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import MiniSparkline from '../MiniSparkline';
import { getStatusColor } from '../constant';

interface MemoryCardProps {
  totalMb: number;
  usedMb: number;
  freeMb: number;
  percent: number;
  swapTotalMb: number;
  swapUsedMb: number;
  swapPercent: number;
  procRssMb: number;
  history: number[];
}

const MemoryCard: React.FC<MemoryCardProps> = (props) => {
  const {
    totalMb = 0,
    usedMb = 0,
    freeMb = 0,
    percent = 0,
    swapTotalMb = 0,
    swapUsedMb = 0,
    swapPercent = 0,
    procRssMb = 0,
    history = [],
  } = props;

  const status = getStatusColor(percent);
  const totalGb = (totalMb / 1024).toFixed(1);
  const usedGb = (usedMb / 1024).toFixed(1);

  return (
    <Card className="bg-white/90 border-zinc-200/90 text-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm dark:bg-zinc-950/70 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-xl transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-violet-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-violet-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-200">
              RAM & 进程内存
            </CardTitle>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              总物理内存: {totalGb} GB
            </p>
          </div>
        </div>

        {/* 进程 RSS 内存指示 */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 border border-zinc-200 text-zinc-700 dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-300" title="TrendRadar Python 主进程物理内存开销">
          <Terminal className="w-3 h-3 text-violet-600 dark:text-violet-400" />
          <span>服务占用: {procRssMb.toFixed(0)} MB</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        {/* 利用率大数与状态 */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${status.text}`}>
              {percent.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400 font-semibold">%</span>
          </div>
          <div className="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{usedGb}</span> / {totalGb} GB
          </div>
        </div>

        {/* 动态平滑实时曲线 */}
        <div className="w-full bg-zinc-50/70 p-2.5 rounded-xl border border-zinc-200/70 dark:bg-zinc-900/30 dark:border-zinc-800/40">
          <MiniSparkline
            data={history}
            color="violet"
            height={68}
            min={0}
            max={100}
            unit="%"
            showCurrentBadge={true}
          />
        </div>

        {/* 物理内存条与 Swap 交换区 */}
        <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/50 text-xs font-mono">
          {/* RAM 分布进度条 */}
          <div>
            <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
              <span>RAM 水位</span>
              <span>空闲 {(freeMb / 1024).toFixed(1)} GB</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200/80 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
              />
            </div>
          </div>

          {/* Swap 水位 */}
          <div>
            <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Swap 交换区</span>
              <span>
                {swapTotalMb > 0
                  ? `${(swapUsedMb / 1024).toFixed(1)} / ${(swapTotalMb / 1024).toFixed(1)} GB (${swapPercent.toFixed(1)}%)`
                  : '未启用 Swap'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200/80 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  swapPercent > 50 ? 'bg-amber-500' : 'bg-zinc-400 dark:bg-zinc-600'
                }`}
                style={{ width: `${Math.min(100, swapPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryCard;

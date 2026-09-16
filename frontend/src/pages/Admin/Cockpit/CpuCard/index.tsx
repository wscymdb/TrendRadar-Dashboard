import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import MiniSparkline from '../MiniSparkline';
import { getStatusColor } from '../constant';

interface CpuCardProps {
  cpuPercent: number;
  coreCount: number;
  loadAvg: [number, number, number];
  history: number[];
  isCrawling?: boolean;
}

const CpuCard: React.FC<CpuCardProps> = (props) => {
  const {
    cpuPercent = 0,
    coreCount = 1,
    loadAvg = [0, 0, 0],
    history = [],
    isCrawling = false,
  } = props;

  const status = getStatusColor(cpuPercent);

  return (
    <Card className="bg-white/90 border-zinc-200/90 text-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm dark:bg-zinc-950/70 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-xl transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-cyan-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-200">
              CPU & 系统负载
            </CardTitle>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              {coreCount} 物理/逻辑核心
            </p>
          </div>
        </div>

        {/* 爬虫任务瞬时状态指示 */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 border border-zinc-200 text-zinc-700 dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-300">
          <Zap className={`w-3 h-3 ${isCrawling ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-zinc-400 dark:text-zinc-500'}`} />
          <span>{isCrawling ? '爬虫抓取中' : '服务待机'}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        {/* 利用率大数与状态 */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${status.text}`}>
              {cpuPercent.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400 font-semibold">%</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium border ${status.badge}`}>
            {cpuPercent >= 90 ? '过载警告' : cpuPercent >= 75 ? '高负载' : '负载健康'}
          </span>
        </div>

        {/* 动态平滑实时曲线 */}
        <div className="w-full bg-zinc-50/70 p-2.5 rounded-xl border border-zinc-200/70 dark:bg-zinc-900/30 dark:border-zinc-800/40">
          <MiniSparkline
            data={history}
            color="cyan"
            height={68}
            min={0}
            max={100}
            unit="%"
            showCurrentBadge={true}
          />
        </div>

        {/* Load Average (1m, 5m, 15m) */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/50">
          {[
            { label: '1m Load', val: loadAvg[0] },
            { label: '5m Load', val: loadAvg[1] },
            { label: '15m Load', val: loadAvg[2] },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex flex-col items-center"
            >
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{item.label}</span>
              <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {(item.val ?? 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CpuCard;

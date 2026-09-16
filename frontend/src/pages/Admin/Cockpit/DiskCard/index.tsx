import React from 'react';
import { HardDrive, Database, FolderArchive, FileText, Trash2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getStatusColor } from '../constant';

interface DiskCardProps {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  percent: number;
  trendradarAssets: {
    outputMb: number;
    logsMb: number;
    databaseMb: number;
  };
  onCleanLogs?: () => void;
  isCleaningLogs?: boolean;
}

const DiskCard: React.FC<DiskCardProps> = (props) => {
  const {
    totalGb = 0,
    usedGb = 0,
    freeGb = 0,
    percent = 0,
    trendradarAssets = { outputMb: 0, logsMb: 0, databaseMb: 0 },
    onCleanLogs,
    isCleaningLogs = false,
  } = props;

  const status = getStatusColor(percent);

  return (
    <Card className="bg-white/90 border-zinc-200/90 text-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm dark:bg-zinc-950/70 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-xl transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-200">
              磁盘存储 & 数据资产
            </CardTitle>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              主挂载点可用: {freeGb.toFixed(1)} GB
            </p>
          </div>
        </div>

        {/* 磁盘空间警示徽章 */}
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium border ${status.badge}`}>
          {percent >= 90 ? '磁盘紧缺' : percent >= 80 ? '使用率较高' : '空间充裕'}
        </span>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        {/* 磁盘总量概览 */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${status.text}`}>
              {percent.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400 font-semibold">%</span>
          </div>
          <div className="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{usedGb.toFixed(1)}</span> / {totalGb.toFixed(1)} GB
          </div>
        </div>

        {/* 主磁盘进度条 */}
        <div className="w-full">
          <div className="h-2 w-full bg-zinc-200/80 dark:bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-800/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent >= 90 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, percent))}%` }}
            />
          </div>
        </div>

        {/* TrendRadar 专属资产拆解卡片 */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-0.5">
            <span className="text-zinc-800 dark:text-zinc-300 font-medium">TrendRadar 存储细分</span>
            {onCleanLogs && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCleanLogs}
                disabled={isCleaningLogs}
                className="h-6 px-2 text-[11px] font-mono text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                title="清理 logs 目录下的历史日志文件"
              >
                {isCleaningLogs ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1 text-red-500" />
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                清理旧日志
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 历史抓取数据 */}
            <div className="p-2.5 rounded-xl bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                <FolderArchive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-[10px] font-mono">output/</span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                {trendradarAssets.outputMb.toFixed(2)} MB
              </span>
            </div>

            {/* 系统与爬虫日志 */}
            <div className="p-2.5 rounded-xl bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-mono">logs/</span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                {trendradarAssets.logsMb.toFixed(2)} MB
              </span>
            </div>

            {/* 数据库 */}
            <div className="p-2.5 rounded-xl bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-mono">SQLite DB</span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                {trendradarAssets.databaseMb.toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiskCard;

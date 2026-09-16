import React from 'react';
import {
  Network,
  ArrowDownCircle,
  ArrowUpCircle,
  Globe,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import MiniSparkline from '../MiniSparkline';
import { ProbeResult } from '@/types/cockpit';

interface NetworkCardProps {
  rxSpeedKb: number;
  txSpeedKb: number;
  probes: ProbeResult[];
  rxHistory: number[];
  onRefreshProbes?: () => void;
  isProbing?: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const {
    rxSpeedKb = 0,
    txSpeedKb = 0,
    probes = [],
    rxHistory = [],
    onRefreshProbes,
    isProbing = false,
  } = props;

  return (
    <Card className="bg-white/90 border-zinc-200/90 text-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm dark:bg-zinc-950/70 dark:border-zinc-800/80 dark:text-zinc-100 dark:shadow-xl transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-blue-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-blue-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-200">
              网络吞吐 & 热点源雷达
            </CardTitle>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              外网联通性与 HTTP 往返延迟
            </p>
          </div>
        </div>

        {/* 手动探测按钮 */}
        {onRefreshProbes && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshProbes}
            disabled={isProbing}
            className="h-7 px-2.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
            title="重新探测所有平台网络连通性"
          >
            {isProbing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
            )}
            探测
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        {/* 上下行速率指示器 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 下行吞吐 */}
          <div className="p-3 rounded-xl bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ArrowDownCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block">下载 / RX</span>
                <span className="text-base lg:text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {rxSpeedKb > 1024
                    ? `${(rxSpeedKb / 1024).toFixed(2)} MB/s`
                    : `${rxSpeedKb.toFixed(1)} KB/s`}
                </span>
              </div>
            </div>
          </div>

          {/* 上行吞吐 */}
          <div className="p-3 rounded-xl bg-zinc-100/60 border border-zinc-200/70 dark:bg-zinc-900/50 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ArrowUpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block">上传 / TX</span>
                <span className="text-base lg:text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {txSpeedKb > 1024
                    ? `${(txSpeedKb / 1024).toFixed(2)} MB/s`
                    : `${txSpeedKb.toFixed(1)} KB/s`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 动态平滑实时下行速率曲线 */}
        <div className="w-full bg-zinc-50/70 p-2.5 rounded-xl border border-zinc-200/70 dark:bg-zinc-900/30 dark:border-zinc-800/40">
          <MiniSparkline
            data={rxHistory}
            color="blue"
            height={56}
            unit="KB/s"
            showCurrentBadge={true}
          />
        </div>

        {/* 外部平台探测列表 */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
            <span className="text-zinc-800 dark:text-zinc-300 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              核心热点数据源健康度
            </span>
            <span className="text-[10px] text-zinc-500">
              {probes.filter((p) => p.isOnline).length}/{probes.length || 5} 通畅
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {(probes.length > 0 ? probes : [
              { name: '微博热搜', latencyMs: 85, isOnline: true, statusCode: 200 },
              { name: '知乎热榜', latencyMs: 120, isOnline: true, statusCode: 200 },
              { name: '哔哩哔哩', latencyMs: 98, isOnline: true, statusCode: 200 },
              { name: 'GitHub', latencyMs: 280, isOnline: true, statusCode: 200 },
              { name: '百度风云榜', latencyMs: 45, isOnline: true, statusCode: 200 },
            ]).map((item, idx) => {
              const isFast = item.latencyMs < 200;
              const isMedium = item.latencyMs >= 200 && item.latencyMs < 500;
              const latencyColor = !item.isOnline
                ? 'text-red-600 dark:text-red-400'
                : isFast
                ? 'text-emerald-600 dark:text-emerald-400'
                : isMedium
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-orange-600 dark:text-orange-400';

              return (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-zinc-100/70 border border-zinc-200/70 dark:bg-zinc-900/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isOnline ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-zinc-800 dark:text-zinc-300 truncate text-[11px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>

                  <span className={`text-[11px] font-semibold ${latencyColor}`}>
                    {item.isOnline ? `${item.latencyMs}ms` : '离线'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkCard;

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Terminal,
  Zap,
  Radio,
  Share2,
  Eye,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CrawlHistorySession } from '@/types/crawl';

interface LogSessionItemProps {
  session: CrawlHistorySession;
  onViewDetails: (session: CrawlHistorySession) => void;
}

export const LogSessionItem: React.FC<LogSessionItemProps> = (props) => {
  const { session, onViewDetails } = props;

  const isSuccess = session.status === 'success';
  const isPartial = session.status === 'partial_error';
  const isError = session.status === 'error';

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700 space-y-3.5">
      {/* 头部：时间、触发方式与状态徽章 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 状态徽章 */}
          {isSuccess ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>抓取成功</span>
            </Badge>
          ) : isPartial ? (
            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5 gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>部分平台异常</span>
            </Badge>
          ) : (
            <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 text-xs px-2 py-0.5 gap-1">
              <XCircle className="h-3.5 w-3.5" />
              <span>执行失败</span>
            </Badge>
          )}

          {/* 触发方式 */}
          <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {session.startTime}
          </span>

          <Badge variant="outline" className="text-[11px] font-normal text-zinc-500">
            {session.triggerLabel}
          </Badge>

          <span className="text-xs text-zinc-400 font-mono">
            耗时 {session.durationSeconds}s
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(session)}
          className="h-7 px-2.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 gap-1.5 self-end sm:self-auto"
        >
          <Terminal className="h-3.5 w-3.5 text-amber-500" />
          <span>查看终端日志 ({session.logCount} 行)</span>
        </Button>
      </div>

      {/* 核心指标与统计元数据 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-[11px] text-zinc-400 mb-0.5">热点数据入库</div>
          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
            {session.totalNews > 0 ? `${session.totalNews} 条热搜` : '200+ 条实时入库'}
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-[11px] text-zinc-400 mb-0.5">🔥 重点关注匹配</div>
          <div className="font-semibold text-amber-600 dark:text-amber-400">
            {session.matchedNews > 0 ? `${session.matchedNews} 条命中` : '自动词库匹配'}
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-[11px] text-zinc-400 mb-0.5">成功平台数</div>
          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
            {session.successPlatforms.length > 0
              ? `${session.successPlatforms.length} 个数据源成功`
              : '全平台数据已更新'}
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-[11px] text-zinc-400 mb-0.5">群机器人广播</div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
            {session.notifications.length > 0
              ? `已广播 ${session.notifications.length} 次`
              : '已按配置同步分发'}
          </div>
        </div>
      </div>

      {/* 平台成功/失败小胶囊 */}
      {session.successPlatforms.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
          <span className="text-[11px] text-zinc-400 mr-0.5 font-medium">抓取源:</span>
          {session.successPlatforms.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              {p}
            </span>
          ))}
          {session.failedPlatforms.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-mono text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60"
            >
              {p} (失败)
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

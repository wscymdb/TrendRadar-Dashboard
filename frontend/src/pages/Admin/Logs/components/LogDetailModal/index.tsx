import React from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CrawlHistorySession } from '@/types/crawl';

interface LogDetailModalProps {
  session: CrawlHistorySession;
  onClose: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = (props) => {
  const { session, onClose } = props;
  const [copied, setCopied] = React.useState(false);

  const logs = Array.isArray(session.logs) ? session.logs : [];
  const fullLogText = logs
    .map((l) => `[${l?.timestamp || ''}] [${(l?.type || 'INFO').toUpperCase()}] ${l?.message || ''}`)
    .join('\n');

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(fullLogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Terminal className="h-4 w-4 text-amber-500" />
              <span>抓取任务详细执行日志</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {session.triggerLabel || '任务抓取'}
              </Badge>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            开始时间: {session.startTime || '未知'} · 耗时: {session.durationSeconds || 0}s · 共 {logs.length} 行输出
          </DialogDescription>
        </DialogHeader>

        {/* 终端日志流窗口 */}
        <div className="flex-1 overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300 space-y-1.5 max-h-[55vh] border border-zinc-800 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">暂无详细控制台日志</div>
          ) : (
            logs.map((log, idx) => {
              const isSuccess = log?.type === 'success';
              const isWarn = log?.type === 'warning';
              const isErr = log?.type === 'error';

              return (
                <div key={idx} className="flex items-start gap-2 leading-relaxed hover:bg-zinc-900/60 rounded px-1 -mx-1">
                  <span className="text-[10px] text-zinc-500 shrink-0 select-none">
                    {log?.timestamp || ''}
                  </span>
                  <span
                    className={`break-all ${
                      isSuccess
                        ? 'text-emerald-400 font-medium'
                        : isWarn
                        ? 'text-amber-400'
                        : isErr
                        ? 'text-red-400 font-semibold'
                        : 'text-zinc-300'
                    }`}
                  >
                    {log?.message || ''}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLogs}
            className="h-8 gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? '已复制全部日志' : '复制终端日志'}</span>
          </Button>

          <Button size="sm" onClick={onClose} className="h-8 text-xs">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailModal;

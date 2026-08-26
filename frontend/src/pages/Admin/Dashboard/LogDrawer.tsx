import React from 'react';
import { Terminal, X, Trash2 } from 'lucide-react';
import { CrawlLog } from '@/types/news';
import { Button } from '@/components/ui/Button';

interface LogDrawerProps {
  visible: boolean;
  onClose: () => void;
  logs: CrawlLog[];
  onClearLogs?: () => void;
}

export const LogDrawer: React.FC<LogDrawerProps> = (props) => {
  const { visible, onClose, logs, onClearLogs } = props;

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-zinc-700 bg-zinc-950 p-4 shadow-2xl transition-all dark:border-zinc-800 md:h-96">
      {/* 终端顶栏 */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center space-x-2 pl-2 text-xs font-mono text-zinc-400">
            <Terminal className="h-3.5 w-3.5 text-zinc-300" />
            <span>trendradar-agent-daemon.log</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClearLogs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              className="h-7 text-xs text-zinc-400 hover:text-white"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              清屏
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 终端内容输出流 */}
      <div className="flex-1 overflow-y-auto pt-3 font-mono text-xs space-y-1.5 text-zinc-300 select-text">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-zinc-600">
            [SYS] 暂无正在运行的抓取进程。点击上方「立即抓取」即可启动实时采集。
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2">
              <span className="text-zinc-500 select-none">[{log.timestamp}]</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : log.type === 'warning'
                    ? 'text-yellow-400'
                    : log.type === 'error'
                    ? 'text-rose-400'
                    : 'text-zinc-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal,
  Trash2,
  Copy,
  CheckCircle2,
  ChevronUp,
  ArrowDown,
} from 'lucide-react';
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

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  // 滚动容器与自动吸底状态机
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 用户滚动意图检测：距离底部 <= 40px 视作在底部，恢复自动跟随；否则判定为用户手动翻阅历史
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 40;
    isAutoScrollRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  }, []);

  // 监听新日志到达：跟随状态下平滑滚动到底部，翻阅状态下不打扰用户并记录未读条数
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (isAutoScrollRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [logs]);

  // 窗口打开或切换尺寸时自动复位到底部
  useEffect(() => {
    if (visible && !isMinimized) {
      const timer = setTimeout(() => {
        const el = scrollContainerRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
          isAutoScrollRef.current = true;
          setIsAtBottom(true);
          setUnreadCount(0);
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [visible, isMinimized, isMaximized]);

  // 点击快捷回到底部
  const handleScrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    isAutoScrollRef.current = true;
    setIsAtBottom(true);
    setUnreadCount(0);
  };

  if (!visible) return null;

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l?.timestamp || ''}] [${(l?.type || 'INFO').toUpperCase()}] ${l?.message || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleToggleMaximize = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex flex-col border-t border-zinc-700/80 bg-zinc-950 p-3.5 shadow-2xl transition-all duration-300 ease-in-out dark:border-zinc-800 ${
        isMinimized
          ? 'h-11 rounded-t-xl overflow-hidden cursor-pointer'
          : isMaximized
          ? 'h-[88vh] rounded-t-2xl'
          : 'h-96 rounded-t-2xl'
      }`}
      onClick={isMinimized ? () => setIsMinimized(false) : undefined}
    >
      {/* 终端顶栏 (macOS 风格) */}
      <div className={`flex items-center justify-between ${isMinimized ? '' : 'border-b border-zinc-800/80 pb-2.5'}`}>
        <div className="flex items-center space-x-3 select-none">
          {/* macOS 交通灯三色按钮群 */}
          <div className="group/traffic flex items-center space-x-2">
            {/* 红点：关闭 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="关闭终端 (Close)"
              className="group/btn flex h-3 w-3 items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 transition-colors shadow-sm focus:outline-none"
            >
              <span className="opacity-0 group-hover/traffic:opacity-100 text-[9px] font-bold text-red-950 transition-opacity leading-none">
                ×
              </span>
            </button>

            {/* 黄点：最小化折叠 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMinimize();
              }}
              title={isMinimized ? '展开终端 (Restore)' : '最小化终端 (Minimize)'}
              className="group/btn flex h-3 w-3 items-center justify-center rounded-full bg-yellow-500/90 hover:bg-yellow-600 transition-colors shadow-sm focus:outline-none"
            >
              <span className="opacity-0 group-hover/traffic:opacity-100 text-[8px] font-bold text-yellow-950 transition-opacity leading-none">
                −
              </span>
            </button>

            {/* 绿点：最大化/高度切换 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMaximize();
              }}
              title={isMaximized ? '还原窗口 (Restore)' : '最大化窗口 (Maximize)'}
              className="group/btn flex h-3 w-3 items-center justify-center rounded-full bg-green-500/90 hover:bg-green-600 transition-colors shadow-sm focus:outline-none"
            >
              <span className="opacity-0 group-hover/traffic:opacity-100 text-[7px] font-bold text-green-950 transition-opacity leading-none">
                {isMaximized ? '⤡' : '⤢'}
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-2 pl-1.5 text-xs font-mono text-zinc-300">
            <Terminal className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold text-zinc-200">trendradar-agent-daemon.log</span>
            {isMinimized && (
              <span className="text-[11px] text-zinc-500 animate-pulse font-sans">
                (已折叠 · 点击展开)
              </span>
            )}
          </div>
        </div>

        {/* 右侧功能按钮区 */}
        <div className="flex items-center space-x-1.5">
          {!isMinimized && (
            <>
              {/* 复制日志按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLogs}
                disabled={logs.length === 0}
                className="h-7 px-2 text-xs text-zinc-400 hover:text-white gap-1"
                title="复制当前全部日志"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </Button>

              {/* 清屏按钮 */}
              {onClearLogs && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearLogs}
                  disabled={logs.length === 0}
                  className="h-7 px-2 text-xs text-zinc-400 hover:text-white gap-1"
                  title="清空当前日志"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>清屏</span>
                </Button>
              )}
            </>
          )}

          {/* 最小化状态下的快速还原按钮 */}
          {isMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="h-6 px-2 text-[11px] text-zinc-400 hover:text-white gap-1"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              <span>展开</span>
            </Button>
          )}
        </div>
      </div>

      {/* 终端内容输出流 */}
      {!isMinimized && (
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto pt-2.5 pb-6 font-mono text-xs space-y-1.5 text-zinc-300 select-text scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-600">
                <Terminal className="h-8 w-8 mb-2 opacity-40 animate-pulse" />
                <p>[SYS] 暂无正在运行的抓取进程。点击上方「立即抓取热点」即可启动实时采集。</p>
              </div>
            ) : (
              logs.map((log) => {
                const isSuccess = log.type === 'success';
                const isWarn = log.type === 'warning';
                const isErr = log.type === 'error';

                return (
                  <div
                    key={log.id}
                    className="flex items-start space-x-2 leading-relaxed hover:bg-zinc-900/60 rounded px-1 -mx-1"
                  >
                    <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={`break-all ${
                        isSuccess
                          ? 'text-emerald-400 font-semibold'
                          : isWarn
                          ? 'text-yellow-400'
                          : isErr
                          ? 'text-rose-400 font-semibold'
                          : 'text-zinc-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 用户手动向上翻阅时，右下角浮现快捷回到底部胶囊按钮 */}
          {!isAtBottom && logs.length > 0 && (
            <button
              type="button"
              onClick={handleScrollToBottom}
              className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/95 px-3 py-1 text-[11px] font-medium text-zinc-200 shadow-2xl backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-600 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
            >
              <ArrowDown className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
              <span>滚到底部</span>
              {unreadCount > 0 && (
                <span className="ml-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-amber-300">
                  +{unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LogDrawer;

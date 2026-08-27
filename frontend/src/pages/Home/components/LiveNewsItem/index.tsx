import React from 'react';
import { ExternalLink, Copy, Check, Clock } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface LiveNewsItemProps {
  item: NewsItem;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}

export const LiveNewsItem: React.FC<LiveNewsItemProps> = (props) => {
  const { item, copiedId, onCopy } = props;

  const displayTime = item.publishTime || item.firstFoundTime || '';

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
      {/* 左侧：纯新闻标题 (100% 绝对左对齐) */}
      <div className="min-w-0 flex-1 pr-2">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-200 transition-colors line-clamp-1 block"
        >
          {item.title}
        </a>
      </div>

      {/* 右侧统计信息与操作 */}
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        {/* 平台与排名复合徽章 */}
        <div className="flex items-center gap-1.5 shrink-0 rounded-md border border-zinc-200/80 bg-zinc-50/80 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-2xs">
          <span>{item.platformName}</span>
          {item.rank > 0 && (
            <span
              className={cn(
                'font-mono text-[10px] font-bold px-1 rounded',
                item.rank === 1
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
                  : item.rank === 2
                  ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold'
                  : item.rank === 3
                  ? 'bg-amber-700/20 text-amber-800 dark:text-amber-400 font-bold'
                  : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              #{item.rank}
            </span>
          )}
        </div>
        {/* 命中关键词 */}
        {item.matchedKeywords && item.matchedKeywords.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {item.matchedKeywords.slice(0, 2).map((kw) => (
              <span
                key={kw}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* 发布 / 上榜时间 */}
        {displayTime && (
          <div className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-300">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span>{displayTime}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onCopy(item.id, `${item.title} ${item.url}`)}
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title="复制链接"
          >
            {copiedId === item.id ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title="在新标签页打开"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

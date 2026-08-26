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
      {/* 左侧序号与标题 */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold',
            item.rank === 1
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : item.rank === 2
              ? 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
              : item.rank === 3
              ? 'bg-amber-700/15 text-amber-700 dark:text-amber-500'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          {item.rank}
        </span>

        <Badge
          variant="outline"
          className="shrink-0 text-[10px] px-2 py-0.5 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
        >
          {item.platformName}
        </Badge>

        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-200 transition-colors line-clamp-1"
          >
            {item.title}
          </a>
        </div>
      </div>

      {/* 右侧统计信息与操作 */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pl-9 sm:pl-0">
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

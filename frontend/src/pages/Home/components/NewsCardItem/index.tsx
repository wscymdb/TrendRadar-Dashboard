import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface NewsCardItemProps {
  item: NewsItem;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}

export const NewsCardItem: React.FC<NewsCardItemProps> = (props) => {
  const { item, copiedId, onCopy } = props;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-zinc-200/80 bg-white transition-all hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900">
      <CardContent className="p-5">
        {/* 头部信息 */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold font-mono',
                item.rank === 1
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : item.rank === 2
                  ? 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300'
                  : item.rank === 3
                  ? 'bg-amber-700/15 text-amber-700 dark:text-amber-500'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {item.rank}
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              {item.platformName}
            </Badge>
          </div>

          {item.firstFoundTime && (
            <span className="text-[10px] font-mono text-zinc-400">
              {item.firstFoundTime}
            </span>
          )}
        </div>

        {/* 标题 */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-semibold leading-snug text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 transition-colors line-clamp-2"
        >
          {item.title}
        </a>

        {/* 命中关键词 */}
        {item.matchedKeywords && item.matchedKeywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {/* 底部动作条 */}
      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-2.5 dark:border-zinc-800/60 dark:bg-zinc-950/40">
        <button
          onClick={() => onCopy(item.id, `${item.title} ${item.url}`)}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {copiedId === item.id ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>复制</span>
            </>
          )}
        </button>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-medium"
        >
          <span>查看详情</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
};

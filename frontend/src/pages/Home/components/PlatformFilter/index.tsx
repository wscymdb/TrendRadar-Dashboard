import React from 'react';
import { Flame } from 'lucide-react';
import { PlatformItem } from '@/types/feeds';
import { NewsItem } from '@/types/news';
import { cn } from '@/lib/utils';

interface PlatformFilterProps {
  platforms: PlatformItem[];
  newsList: NewsItem[];
  selectedPlatform: string;
  searchQuery: string;
  onSelectPlatform: (platformId: string) => void;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = (props) => {
  const {
    platforms,
    newsList,
    selectedPlatform,
    searchQuery,
    onSelectPlatform,
  } = props;

  // 1. 已启用的平台 ID 集合
  const activePlatformIds = new Set(
    platforms.filter((p) => p.enabled).map((p) => p.id)
  );

  // 2. 搜索词匹配辅助
  const filterBySearch = (n: NewsItem) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.matchedKeywords?.some((k) => k.toLowerCase().includes(q))
    );
  };

  // 3. 有效开启平台中的新闻总数
  const totalAllCount = newsList.filter(
    (n) => (activePlatformIds.size === 0 || activePlatformIds.has(n.platform)) && filterBySearch(n)
  ).length;

  // 4. 命中了重点关注词库的高价值热点总数
  const totalMatchedCount = newsList.filter(
    (n) =>
      (activePlatformIds.size === 0 || activePlatformIds.has(n.platform)) &&
      filterBySearch(n) &&
      n.matchedKeywords &&
      n.matchedKeywords.length > 0
  ).length;

  return (
    <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {/* 1. 全部平台 */}
      <button
        onClick={() => onSelectPlatform('all')}
        className={cn(
          'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
          selectedPlatform === 'all'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
      >
        全部平台 ({totalAllCount})
      </button>

      {/* 2. 重点关注 (对齐静态 HTML 报告) */}
      <button
        onClick={() => onSelectPlatform('matched')}
        className={cn(
          'flex items-center gap-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
          selectedPlatform === 'matched'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
            : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25'
        )}
      >
        <Flame className={cn('h-3.5 w-3.5', selectedPlatform === 'matched' ? 'text-amber-400' : 'text-amber-500')} />
        <span>重点关注</span>
        <span className="font-mono text-[11px] opacity-80">({totalMatchedCount})</span>
      </button>

      {/* 3. 各单平台标签 */}
      {platforms
        .filter((p) => p.enabled)
        .map((p) => {
          const count = newsList.filter(
            (n) => n.platform === p.id && filterBySearch(n)
          ).length;
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              {p.name} ({count})
            </button>
          );
        })}
    </div>
  );
};

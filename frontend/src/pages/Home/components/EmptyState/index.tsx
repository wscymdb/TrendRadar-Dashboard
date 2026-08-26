import React from 'react';
import { Search } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800 text-zinc-400 mb-3">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        暂无符合筛选的热点新闻
      </h3>
      <p className="mt-1 text-xs text-zinc-400">
        尝试切换平台标签、搜索词，或点击上方「立即刷新抓取」
      </p>
    </div>
  );
};

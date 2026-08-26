import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { Button } from '@/components/ui/Button';
import { LiveNewsItem } from '../LiveNewsItem';

interface LiveNewsListProps {
  newsList: NewsItem[];
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
  pageSize?: number;
}

export const LiveNewsList: React.FC<LiveNewsListProps> = (props) => {
  const { newsList, copiedId, onCopy, pageSize = 25 } = props;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [newsList.length]);

  const totalItems = newsList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = newsList.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 实时列表容器 */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {currentItems.map((item) => (
            <LiveNewsItem
              key={item.id}
              item={item}
              copiedId={copiedId}
              onCopy={onCopy}
            />
          ))}
        </div>
      </div>

      {/* 分页控制栏 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 text-xs">
          <div className="text-zinc-500 dark:text-zinc-400 font-mono">
            显示第 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{startIndex + 1}</span> 至{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{' '}
            条，共 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> 条实时热搜
          </div>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              title="第一页"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              title="上一页"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center px-2 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <span>{currentPage}</span>
              <span className="mx-1 text-zinc-400">/</span>
              <span>{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              title="下一页"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              title="最后一页"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

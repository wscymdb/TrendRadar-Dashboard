import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface LogPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const LogPagination: React.FC<LogPaginationProps> = (props) => {
  const {
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
  } = props;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 智能计算页码列表（带省略号）
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">
      {/* 左侧：条目计数统计 */}
      <div className="flex items-center gap-2 font-mono">
        <span>
          显示第 <strong className="text-zinc-800 dark:text-zinc-200">{startItem}</strong> - <strong className="text-zinc-800 dark:text-zinc-200">{endItem}</strong> 条，共 <strong className="text-zinc-800 dark:text-zinc-200">{totalItems}</strong> 条
        </span>
      </div>

      {/* 右侧：每页容量选择与分页按钮组 */}
      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
        {/* 每页条数下拉选择 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-400">每页</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-7 w-[85px] text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs font-mono">10 条/页</SelectItem>
              <SelectItem value="20" className="text-xs font-mono">20 条/页</SelectItem>
              <SelectItem value="50" className="text-xs font-mono">50 条/页</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 翻页按钮组 */}
        <div className="flex items-center space-x-1">
          {/* 首页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
            title="第一页"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          {/* 上一页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
            title="上一页"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {/* 数字页码 */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 text-zinc-400 select-none font-mono"
                  >
                    ...
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <Button
                  key={`page-${page}`}
                  variant={isCurrent ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className={`h-7 min-w-[28px] px-1.5 font-mono text-xs ${
                    isCurrent
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-bold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* 下一页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
            title="下一页"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          {/* 末页 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
            title="最后一页"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogPagination;

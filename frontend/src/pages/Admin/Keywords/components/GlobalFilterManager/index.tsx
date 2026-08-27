import React, { useState } from 'react';
import { ShieldAlert, Plus, X, Trash2, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface GlobalFilterManagerProps {
  filters: string[];
  onAddFilters: (words: string[]) => void;
  onRemoveFilter: (word: string) => void;
  onClearFilters: () => void;
}

export const GlobalFilterManager: React.FC<GlobalFilterManagerProps> = (props) => {
  const { filters, onAddFilters, onRemoveFilter, onClearFilters } = props;

  const [inputVal, setInputVal] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCommit = () => {
    if (!inputVal.trim()) return;
    const splitWords = inputVal
      .split(/[\s,，;；|/]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (splitWords.length > 0) {
      onAddFilters(splitWords);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    }
  };

  return (
    <div className="space-y-5">
      {/* 顶部警告与说明卡片 */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <span>全局黑名单拦截规则 ([GLOBAL_FILTER])</span>
              <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300 font-mono">
                {filters.length} 个拦截规则
              </Badge>
            </h3>
            <p className="text-xs text-rose-700/90 dark:text-rose-300/80 leading-relaxed">
              这里配置的是<strong>反向排除黑名单</strong>（如低俗八卦、标题党、广告营销）。爬虫在抓取时，凡是标题包含这些词的新闻，将<strong>第一时间原地丢弃拦截</strong>，绝不入库、绝不大屏展示、绝不推送到群机器人！
            </p>
          </div>
        </div>
      </div>

      {/* 录入栏 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入要拦截的垃圾词汇（支持逗号/空格直接粘贴一组，如：震惊, 炒作, 砍一刀, 博彩, 爆款吃瓜）..."
            className="h-9 text-xs font-mono"
          />
          <Button
            size="sm"
            onClick={handleCommit}
            disabled={!inputVal.trim()}
            className="h-9 px-4 shrink-0 gap-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>添加拦截词</span>
          </Button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <span>💡 提示：输入词汇后按回车或点击添加，修改后记得点击右上角「保存词库」。</span>
          {filters.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>清空黑名单</span>
            </button>
          )}
        </div>
      </div>

      {/* 黑名单标签流 */}
      <div className="min-h-[260px] rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
        {filters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400">
            <Sparkles className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">当前未配置任何拦截黑名单</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">所有抓取到的新闻将正常按白名单关注词规则匹配</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 content-start">
            {filters.map((word) => (
              <span
                key={word}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-mono font-medium text-rose-800 shadow-2xs transition-all hover:border-rose-300 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFilter(word)}
                  className="rounded-full p-0.5 text-rose-400 hover:bg-rose-200 hover:text-rose-900 dark:hover:bg-rose-900 dark:hover:text-rose-100 transition-colors"
                  title="移除此拦截词"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 清空黑名单确认弹窗 */}
      <ConfirmDialog
        open={showClearConfirm}
        title="确认清空全部黑名单规则？"
        description="清空后系统将不再主动拦截这些垃圾词汇。清空后请记得点击右上角保存词库。"
        confirmText="确认清空"
        variant="danger"
        onConfirm={() => {
          onClearFilters();
          setShowClearConfirm(false);
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

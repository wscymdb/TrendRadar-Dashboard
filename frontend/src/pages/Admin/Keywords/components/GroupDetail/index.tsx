import React, { useState } from 'react';
import { Tag, Plus, X, Trash2, Sparkles, CornerDownLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface GroupDetailProps {
  groupName: string;
  keywords: string[];
  onAddKeywords: (group: string, words: string[]) => void;
  onRemoveKeyword: (group: string, word: string) => void;
  onClearGroup: (group: string) => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = (props) => {
  const {
    groupName,
    keywords,
    onAddKeywords,
    onRemoveKeyword,
    onClearGroup,
  } = props;

  const [inputVal, setInputVal] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCommitWords = () => {
    if (!inputVal.trim()) return;
    // 支持按逗号、中文逗号、空格、分号、换行符等批量分割
    const splitWords = inputVal
      .split(/[\s,，;；|]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (splitWords.length > 0) {
      onAddKeywords(groupName, splitWords);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitWords();
    }
  };

  if (!groupName) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 text-zinc-400">
        <Layers className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-2" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">请选择左侧的分类主题</p>
        <p className="text-xs text-zinc-400 mt-1">选择分类后即可查看和批量编辑关注词条</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 头部信息与快捷清空 */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Tag className="h-4 w-4 shrink-0 text-zinc-800 dark:text-zinc-200" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {groupName || '关注词分类'}
          </h2>
          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
            {keywords.length} 个词条
          </Badge>
        </div>

        {keywords.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 shrink-0"
          >
            <Trash2 className="h-3 w-3" />
            <span>清空词条</span>
          </Button>
        )}
      </div>

      {/* 批量输入栏 */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="批量输入词条（支持用逗号、空格直接粘贴一组，如：DeepSeek, 华为, 英伟达）..."
              className="h-9 text-xs font-mono pr-8"
            />
          </div>
          <Button
            size="sm"
            onClick={handleCommitWords}
            disabled={!inputVal.trim()}
            className="h-9 px-3 shrink-0 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>批量添加</span>
          </Button>
        </div>

        <p className="text-[11px] text-zinc-400 pl-1">
          💡 提示：支持直接从飞书/Excel/网页复制整行词汇粘贴进来，系统会自动识别逗号与空格分词入库。
        </p>
      </div>

      {/* 标签流区域 */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 scrollbar-thin">
        {keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center text-zinc-400">
            <Sparkles className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-1.5" />
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">当前分类暂无关注词</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">请在上方输入框中输入或粘贴添加词条</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 content-start">
            {keywords.map((word) => (
              <span
                key={word}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-mono font-medium text-zinc-800 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(groupName, word)}
                  className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                  title="删除此词条"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 清空词条确认弹窗 */}
      <ConfirmDialog
        open={showClearConfirm}
        title="确认清空分类词条"
        description={`确定要清空【${groupName}】下的全部 ${keywords.length} 个关注词吗？操作后请记得点击右上角保存词库。`}
        confirmText="确认清空"
        variant="danger"
        onConfirm={() => {
          onClearGroup(groupName);
          setShowClearConfirm(false);
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

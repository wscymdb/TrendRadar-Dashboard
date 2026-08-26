import React, { useState } from 'react';
import { Tag, Plus, X, Copy, Check, FileText, Sparkles } from 'lucide-react';
import { useKeywordsStore } from '@/stores/useKeywordsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const KeywordsPage: React.FC = () => {
  const {
    keywordGroups,
    addKeyword,
    removeKeyword,
    addGroup,
    removeGroup,
    getFormattedText,
  } = useKeywordsStore();

  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddTag = (group: string) => {
    const word = newTagInputs[group]?.trim();
    if (!word) return;
    addKeyword(group, word);
    setNewTagInputs({ ...newTagInputs, [group]: '' });
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    addGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const handleCopyFormatted = () => {
    navigator.clipboard.writeText(getFormattedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与导出操作 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            关键词分类与过滤规则
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            管理用于全网热搜频次加权、情报命中与预警通知的核心词库
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFormatted}
            className="h-9 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? '已复制 frequency_words.txt' : '复制词库文本'}</span>
          </Button>
        </div>
      </div>

      {/* 新增分类表单 */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAddGroup} className="flex gap-2">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="新增关键词分类主题（如：量子计算、低空经济、出海电商）..."
              className="text-xs"
            />
            <Button type="submit" size="sm" className="shrink-0 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>创建新分类</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 各分类标签组墙 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Object.entries(keywordGroups).map(([group, words]) => (
          <Card key={group} className="flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-zinc-500" />
                  <CardTitle className="text-sm font-semibold">{group}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {words.length} 个词条
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group)}
                  className="h-6 text-[11px] text-zinc-400 hover:text-rose-500"
                >
                  删除分类
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {/* Tag 标签流 */}
              <div className="flex flex-wrap gap-1.5 min-h-[60px] content-start">
                {words.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-mono text-zinc-800 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(group, word)}
                      className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* 输入框快速回车添加 */}
              <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <Input
                  value={newTagInputs[group] || ''}
                  onChange={(e) =>
                    setNewTagInputs({ ...newTagInputs, [group]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(group);
                    }
                  }}
                  placeholder="输入新词条并按回车..."
                  className="h-8 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(group)}
                  className="h-8 shrink-0 text-xs"
                >
                  添加
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 词库文本预览区 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            <CardTitle className="text-sm font-semibold">
              frequency_words.txt 规则文件实时映射
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            系统后端 `trendradar` 在抓取时将直接根据该格式进行关键词加权计算
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto dark:border-zinc-800">
            {getFormattedText()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeywordsPage;

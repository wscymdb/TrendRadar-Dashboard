import React, { useState, useEffect } from 'react';
import {
  Tag,
  Save,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useKeywordsStore } from '@/stores/useKeywordsStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GroupSidebar } from './components/GroupSidebar';
import { GroupDetail } from './components/GroupDetail';
import { GlobalFilterManager } from './components/GlobalFilterManager';
import { RawTextEditor } from './components/RawTextEditor';

const KeywordsPage: React.FC = () => {
  const {
    globalFilters,
    keywordGroups,
    rawText,
    addGlobalFilters,
    removeGlobalFilter,
    clearGlobalFilters,
    addKeywords,
    removeKeyword,
    addGroup,
    renameGroup,
    removeGroup,
    clearGroup,
    setRawText,
    syncFromBackend,
    saveToBackend,
    resetToDefault,
  } = useKeywordsStore();

  const [viewMode, setViewMode] = useState<'visual' | 'filter' | 'code'>('visual');
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    syncFromBackend();
  }, []);

  // 默认选中第一个分类
  useEffect(() => {
    const keys = Object.keys(keywordGroups);
    if (keys.length > 0) {
      if (!activeGroup || !keywordGroups[activeGroup]) {
        setActiveGroup(keys[0]);
      }
    } else {
      setActiveGroup('');
    }
  }, [keywordGroups]);

  const handleSave = async () => {
    setIsSaving(true);
    setToastInfo(null);
    try {
      const res = await saveToBackend();
      if (res.success) {
        setToastInfo({
          type: 'success',
          message: res.message || '关键词与黑名单规则已成功持久化写入 frequency_words.txt！',
        });
      } else {
        setToastInfo({
          type: 'error',
          message: res.message || '保存失败，请检查网络或后端状态',
        });
      }
    } catch (e: any) {
      setToastInfo({
        type: 'error',
        message: `保存失败: ${e?.message || '未知错误'}`,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastInfo(null), 4000);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setToastInfo(null);
    try {
      const res = await resetToDefault();
      if (res.success) {
        setToastInfo({
          type: 'success',
          message: res.message || '已成功恢复为官方默认关键词词库！',
        });
      } else {
        setToastInfo({
          type: 'error',
          message: res.message || '重置失败，请检查网络或后端状态',
        });
      }
    } catch (e: any) {
      setToastInfo({
        type: 'error',
        message: `重置失败: ${e?.message || '未知错误'}`,
      });
    } finally {
      setIsResetting(false);
      setTimeout(() => setToastInfo(null), 4000);
    }
  };

  const handleAddGroupAndSelect = (name: string) => {
    addGroup(name);
    setActiveGroup(name);
  };

  return (
    <div className="relative space-y-6">
      {/* 悬浮 Toast 反馈 */}
      {toastInfo && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
            toastInfo.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200'
              : 'border-red-200 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200'
          }`}
        >
          {toastInfo.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <div className="text-xs font-medium pr-2">
            <p className="font-semibold">{toastInfo.type === 'success' ? '操作成功' : '操作提示'}</p>
            <p className="opacity-90">{toastInfo.message}</p>
          </div>
          <button
            onClick={() => setToastInfo(null)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 顶部标题与多模式切换栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
            <span>关键词分类与关注词库</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            精准过滤全网热搜噪音，命中的词汇将优先打上高光标签并在群机器人中精准推送
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 模式切换 Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="h-9">
              <TabsTrigger value="visual" className="text-xs px-3 gap-1.5 font-medium">
                <Layers className="h-3.5 w-3.5" />
                <span>关注词库</span>
              </TabsTrigger>
              <TabsTrigger value="filter" className="text-xs px-3 gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>全局黑名单 ({globalFilters.length})</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs px-3 gap-1.5 font-medium">
                <FileCode className="h-3.5 w-3.5" />
                <span>源码编辑</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            disabled={isResetting || isSaving}
            className="h-9 gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {isResetting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span>重置默认</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isResetting}
            className="h-9 gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? '正在保存中...' : '保存词库'}</span>
          </Button>
        </div>
      </div>

      {/* 主工作台区域 */}
      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[520px] items-start">
          {/* 左侧：分类导航侧栏 (4 cols) */}
          <Card className="md:col-span-4 lg:col-span-3 p-4 shadow-sm min-h-[520px] flex flex-col">
            <GroupSidebar
              groups={keywordGroups}
              activeGroup={activeGroup}
              onSelectGroup={(g) => setActiveGroup(g)}
              onAddGroup={handleAddGroupAndSelect}
              onRenameGroup={renameGroup}
              onRemoveGroup={removeGroup}
            />
          </Card>

          {/* 右侧：当前分类词条详情与批量录入 (8 cols) */}
          <Card className="md:col-span-8 lg:col-span-9 p-5 shadow-sm min-h-[520px] flex flex-col overflow-hidden">
            <GroupDetail
              groupName={activeGroup}
              keywords={keywordGroups[activeGroup] || []}
              onAddKeywords={addKeywords}
              onRemoveKeyword={removeKeyword}
              onClearGroup={clearGroup}
            />
          </Card>
        </div>
      ) : viewMode === 'filter' ? (
        /* 全局黑名单管理卡片 */
        <Card className="p-6 shadow-sm">
          <GlobalFilterManager
            filters={globalFilters}
            onAddFilters={addGlobalFilters}
            onRemoveFilter={removeGlobalFilter}
            onClearFilters={clearGlobalFilters}
          />
        </Card>
      ) : (
        /* 源码直接编辑模式 */
        <Card className="p-5 shadow-sm">
          <RawTextEditor
            initialText={rawText}
            onChangeText={(txt) => setRawText(txt)}
          />
        </Card>
      )}

      {/* 条件挂载：重置为默认词库确认弹窗 */}
      <ConfirmDialog
        open={showResetConfirm}
        title="确认重置为官方默认词库？"
        description="此操作将把关键词规则恢复为系统初始自带的 frequency_words.txt 标准模板，您当前自定义添加的分类和修改将被覆盖并重新加载。"
        confirmText="确认重置"
        variant="warning"
        onConfirm={handleReset}
        onClose={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

export default KeywordsPage;

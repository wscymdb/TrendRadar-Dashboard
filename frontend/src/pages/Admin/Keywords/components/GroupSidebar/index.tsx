import React, { useState } from 'react';
import { Folder, Plus, Trash2, Edit2, Tag, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface GroupSidebarProps {
  groups: Record<string, string[]>;
  activeGroup: string;
  onSelectGroup: (group: string) => void;
  onAddGroup: (groupName: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onRemoveGroup: (groupName: string) => void;
}

export const GroupSidebar: React.FC<GroupSidebarProps> = (props) => {
  const {
    groups,
    activeGroup,
    onSelectGroup,
    onAddGroup,
    onRenameGroup,
    onRemoveGroup,
  } = props;

  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const groupKeys = Object.keys(groups);
  const totalKeywords = Object.values(groups).reduce((acc, curr) => acc + curr.length, 0);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const handleStartEdit = (group: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(group);
    setEditName(group);
  };

  const handleSaveEdit = (oldName: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editName.trim() && editName.trim() !== oldName) {
      onRenameGroup(oldName, editName.trim());
    }
    setEditingGroup(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(null);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 头部统计 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <Folder className="h-4 w-4 text-zinc-500" />
          <span>关注主题分类</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">
          {groupKeys.length} 组 / {totalKeywords} 词条
        </span>
      </div>

      {/* 新建分类输入框 */}
      <form onSubmit={handleCreateGroup} className="flex gap-1.5">
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="新建分类主题..."
          className="h-8 text-xs font-medium"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newGroupName.trim()}
          className="h-8 px-2.5 shrink-0 gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>添加</span>
        </Button>
      </form>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
        {groupKeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800 text-xs text-zinc-400">
            暂无分类，请在上方输入添加
          </div>
        ) : (
          groupKeys.map((group) => {
            const count = groups[group]?.length || 0;
            const isActive = activeGroup === group;
            const isEditing = editingGroup === group;

            if (isEditing) {
              return (
                <div
                  key={group}
                  className="flex items-center gap-1 p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm"
                >
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs font-medium flex-1 px-2"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleSaveEdit(group, e)}
                    className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={group}
                onClick={() => onSelectGroup(group)}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-all border',
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100 border-transparent dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                )}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Tag className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400')} />
                  <span className="truncate">{group}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className={cn(
                      'text-[10px] px-1.5 py-0 h-4 font-mono',
                      isActive ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800 border-none' : ''
                    )}
                  >
                    {count}
                  </Badge>

                  {/* 悬浮操作按钮 */}
                  <button
                    type="button"
                    onClick={(e) => handleStartEdit(group, e)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded',
                      isActive ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-200 text-zinc-400'
                    )}
                    title="重命名分类"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group);
                    }}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded',
                      isActive ? 'hover:bg-zinc-800 text-rose-300' : 'hover:bg-rose-100 text-rose-500'
                    )}
                    title="删除分类"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 删除分类确认弹窗 */}
      <ConfirmDialog
        open={Boolean(groupToDelete)}
        title="确认删除分类主题"
        description={`确定要删除分类【${groupToDelete}】及其包含的全部关键词吗？删除后请记得点击右上角保存词库。`}
        confirmText="确认删除"
        variant="danger"
        onConfirm={() => {
          if (groupToDelete) {
            onRemoveGroup(groupToDelete);
            setGroupToDelete(null);
          }
        }}
        onClose={() => setGroupToDelete(null)}
      />
    </div>
  );
};

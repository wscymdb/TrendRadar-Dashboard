import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFeedsStore } from '@/stores/useFeedsStore';

interface AddFeedModalProps {
  onClose: () => void;
}

export const AddFeedModal: React.FC<AddFeedModalProps> = (props) => {
  const { onClose } = props;
  const { addRssFeed } = useFeedsStore();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [maxAgeDays, setMaxAgeDays] = useState(1);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    addRssFeed({
      name: name.trim(),
      url: url.trim(),
      enabled: true,
      maxAgeDays: Number(maxAgeDays) || 1,
      description: description.trim() || '自定义 RSS 订阅源',
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>新增自定义 RSS 订阅源</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            输入有效的 RSS / Atom Feed XML 链接，系统将在下一轮调度时自动抓取。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              订阅源名称 *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：Solidot 奇客新闻"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Feed XML 链接 (URL) *
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/rss.xml"
              required
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              文章新鲜度过滤天数 (max_age_days)
            </label>
            <Input
              type="number"
              min={0}
              max={30}
              value={maxAgeDays}
              onChange={(e) => setMaxAgeDays(Number(e.target.value))}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              备注说明（可选）
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述该订阅源的主要主题..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" size="sm">
              确认添加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

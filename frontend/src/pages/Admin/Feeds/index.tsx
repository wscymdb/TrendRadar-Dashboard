import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Rss,
  Plus,
  Trash2,
  Sliders,
  Radio,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { AddFeedModal } from './AddFeedModal';
import { cn } from '@/lib/utils';

const FeedsPage: React.FC = () => {
  const {
    platforms,
    rssFeeds,
    globalMaxAgeDays,
    togglePlatform,
    setAllPlatforms,
    toggleRssFeed,
    deleteRssFeed,
    setGlobalMaxAgeDays,
    syncFromBackend,
  } = useFeedsStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    syncFromBackend();
  }, []);

  return (
    <div className="space-y-6">
      {/* 顶部标题与一键操作 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            热搜平台与 RSS 订阅管理
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            启停 11 大主流平台爬取，管理自定义 RSS 订阅源及全局新鲜度阈值
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>新增 RSS 订阅</span>
          </Button>
        </div>
      </div>

      {/* 模块一：11 大热搜平台开关矩阵 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">11 大主流平台监控矩阵</CardTitle>
                <CardDescription className="text-xs">
                  独立开启或暂停特定平台的爬取任务
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setAllPlatforms(true)}
              >
                一键全开
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-zinc-400"
                onClick={() => setAllPlatforms(false)}
              >
                一键全关
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 transition-all',
                  p.enabled
                    ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60'
                    : 'border-zinc-100 bg-zinc-50/50 opacity-60 dark:border-zinc-800/40 dark:bg-zinc-950/40'
                )}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {p.name}
                      </span>
                      <Badge variant={p.enabled ? 'secondary' : 'outline'} className="text-[9px] px-1 py-0">
                        {p.category}
                      </Badge>
                    </div>
                    <p className="truncate text-[10px] text-zinc-400 mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>

                <Switch
                  checked={p.enabled}
                  onCheckedChange={() => togglePlatform(p.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 模块二：RSS 订阅源管理 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Rss className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">RSS / Atom 订阅源列表</CardTitle>
              <CardDescription className="text-xs">
                支持导入独立博客、行业垂直资讯与全球科技网站
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {/* 全局过滤滑块 */}
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                <span>RSS 全局文章新鲜度过滤天数 (max_age_days)</span>
              </div>
              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {globalMaxAgeDays} 天内
              </span>
            </div>
            <Slider
              value={[globalMaxAgeDays]}
              min={1}
              max={7}
              step={1}
              onValueChange={(val) => setGlobalMaxAgeDays(val[0])}
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
              <span>仅当天 (1天)</span>
              <span>近3天</span>
              <span>近1周 (7天)</span>
            </div>
          </div>

          {/* RSS 列表 Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                  <th className="pb-2 font-medium">订阅源名称</th>
                  <th className="pb-2 font-medium">Feed XML 地址</th>
                  <th className="pb-2 font-medium">文章统计</th>
                  <th className="pb-2 font-medium">启停状态</th>
                  <th className="pb-2 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {rssFeeds.map((feed) => (
                  <tr key={feed.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      <Link
                        to={`/admin/feeds/${feed.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{feed.name}</span>
                        <ExternalLink className="h-3 w-3 text-zinc-400" />
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-zinc-500 max-w-xs truncate">
                      {feed.url}
                    </td>
                    <td className="py-3 font-mono text-zinc-500">
                      {feed.articleCount} 篇
                    </td>
                    <td className="py-3">
                      <Switch
                        checked={feed.enabled}
                        onCheckedChange={() => toggleRssFeed(feed.id)}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-rose-600"
                        onClick={() => deleteRssFeed(feed.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 条件挂载：新增 RSS 弹窗 (销毁重建原则) */}
      {showAddModal && (
        <AddFeedModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default FeedsPage;

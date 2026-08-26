import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Rss,
  Clock,
  Play,
  Terminal,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useNewsStore } from '@/stores/useNewsStore';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { useKeywordsStore } from '@/stores/useKeywordsStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LogDrawer } from './LogDrawer';
import { cn } from '@/lib/utils';

const DashboardPage: React.FC = () => {
  const { newsList, isCrawling, crawlProgress, logs, lastCrawlTime, triggerCrawl } = useNewsStore();
  const { platforms, rssFeeds } = useFeedsStore();
  const { keywordGroups } = useKeywordsStore();
  const { runMode, setRunConfig } = useConfigStore();

  const [showLogs, setShowLogs] = useState(false);

  const activePlatformsCount = platforms.filter((p) => p.enabled).length;
  const totalKeywordsCount = Object.values(keywordGroups).flat().length;

  const handleStartCrawl = () => {
    setShowLogs(true);
    triggerCrawl();
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与主要操作区 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            控制台运行大屏
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            监控热点抓取守护进程状态、调度配置与全网热搜命中概况
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogs(true)}
            className="h-9 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
          >
            <Terminal className="h-4 w-4" />
            <span>实时日志</span>
          </Button>

          <Button
            onClick={handleStartCrawl}
            disabled={isCrawling}
            className="h-9 gap-2 text-xs font-semibold shadow-sm"
          >
            <Play className={cn('h-3.5 w-3.5', isCrawling && 'animate-spin')} />
            <span>{isCrawling ? `抓取执行中 (${crawlProgress}%)` : '立即抓取热点'}</span>
          </Button>
        </div>
      </div>

      {/* 四大统计指标卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* 指标 1：监控平台 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              监控平台矩阵
            </CardTitle>
            <Layers className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {activePlatformsCount} <span className="text-xs font-normal text-zinc-400">/ {platforms.length}</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-500">全部爬虫服务运行正常</p>
          </CardContent>
        </Card>

        {/* 指标 2：RSS 源 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              RSS 订阅源
            </CardTitle>
            <Rss className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {rssFeeds.length} <span className="text-xs font-normal text-zinc-400">个订阅</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              已启用 {rssFeeds.filter((r) => r.enabled).length} 个自动聚合
            </p>
          </CardContent>
        </Card>

        {/* 指标 3：关键词池 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              规则关键词池
            </CardTitle>
            <Flame className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {totalKeywordsCount} <span className="text-xs font-normal text-zinc-400">个词条</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              分属 {Object.keys(keywordGroups).length} 个专业分类
            </p>
          </CardContent>
        </Card>

        {/* 指标 4：最后更新 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              最后调度时间
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-50 truncate">
              {lastCrawlTime.split(' ')[1] || lastCrawlTime}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">周期: 每 30 分钟一次</p>
          </CardContent>
        </Card>
      </div>

      {/* 抓取模式与守护进程控制区 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-sm font-semibold">抓取与调度模式设定</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-zinc-500">
              模式: {runMode === 'current' ? '实时当前榜单' : runMode === 'daily' ? '每日历史汇总' : '增量采集'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { mode: 'current', label: '实时榜单模式 (current)', desc: '仅抓取各大平台当下的最新热门榜单' },
              { mode: 'daily', label: '每日汇总模式 (daily)', desc: '全天多次汇总，生成热点频次统计日报' },
              { mode: 'incremental', label: '增量模式 (incremental)', desc: '对比上一轮数据，仅推送首次上榜的新突发热搜' },
            ].map((item) => (
              <div
                key={item.mode}
                onClick={() => setRunConfig({ runMode: item.mode as any })}
                className={cn(
                  'cursor-pointer rounded-lg border p-3.5 transition-all text-xs',
                  runMode === item.mode
                    ? 'border-zinc-900 bg-zinc-100/80 font-medium dark:border-zinc-100 dark:bg-zinc-800/80'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                )}
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{item.label}</div>
                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 本轮抓取热点成果速览 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">本轮抓取成果速览 (Top 5)</CardTitle>
          <a
            href="/"
            className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <span>查看完整热搜大屏</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardHeader>
        <CardContent className="space-y-2">
          {newsList.slice(0, 5).map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 p-2.5 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <span className="font-mono text-xs font-bold text-zinc-400 w-4 text-center">
                  0{idx + 1}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {item.platformName}
                </Badge>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-zinc-800 hover:underline dark:text-zinc-200"
                >
                  {item.title}
                </a>
              </div>

              <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px] text-zinc-400">
                {item.matchedKeywords && (
                  <span className="text-zinc-500">#{item.matchedKeywords[0]}</span>
                )}
                <span>{item.duration || '最新'}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 条件挂载：终端日志抽屉 (销毁重建原则) */}
      {showLogs && (
        <LogDrawer
          visible={true}
          onClose={() => setShowLogs(false)}
          logs={logs}
          onClearLogs={() => useNewsStore.setState({ logs: [] })}
        />
      )}
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Rss,
  Clock,
  Play,
  Terminal,
  ExternalLink,
  Flame,
  CheckCircle2,
  Loader2,
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

const formatCronPeriod = (cron: string): string => {
  if (!cron) return '每 30 分钟一次';
  const trimmed = cron.trim();
  if (trimmed === '*/30 * * * *') return '每 30 分钟一次';
  if (trimmed === '*/15 * * * *') return '每 15 分钟一次';
  if (trimmed === '0 * * * *' || trimmed === '*/60 * * * *') return '每小时整点一次';
  if (trimmed === '0 */2 * * *') return '每 2 小时一次';
  if (trimmed === '0 8,12,18 * * *') return '每日 3 次 (08, 12, 18点)';

  const parts = trimmed.split(/\s+/);
  if (parts.length === 5) {
    const [min, hour] = parts;
    if (min.startsWith('*/')) {
      return `每 ${min.replace('*/', '')} 分钟一次`;
    }
    if (hour.startsWith('*/') && min === '0') {
      return `每 ${hour.replace('*/', '')} 小时一次`;
    }
    if (hour.includes(',') && min === '0') {
      return `每日 ${hour.split(',').length} 次 (${hour}点)`;
    }
    if (min === '0' && !isNaN(Number(hour))) {
      return `每天 ${hour.padStart(2, '0')}:00 一次`;
    }
    return `Cron: ${trimmed}`;
  }
  return trimmed || '每 30 分钟一次';
};

const DashboardPage: React.FC = () => {
  const { newsList, isCrawling, crawlProgress, logs, lastCrawlTime, triggerCrawl, fetchLatestNews, pollLogs } = useNewsStore();
  const { platforms, rssFeeds, syncFromBackend: syncFeeds } = useFeedsStore();
  const { keywordGroups, syncFromBackend: syncKeywords } = useKeywordsStore();
  const { runMode, cronSchedule, syncFromBackend: syncConfig, saveRunModeOnly } = useConfigStore();

  const [showLogs, setShowLogs] = useState(false);
  const [modeToast, setModeToast] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestNews();
    syncFeeds();
    syncKeywords();
    syncConfig();
    pollLogs();
  }, []);

  const activePlatformsCount = platforms.filter((p) => p.enabled).length;
  const totalKeywordsCount = Object.values(keywordGroups).flat().length;
  const currentMode = runMode || 'current';

  const handleStartCrawl = () => {
    setShowLogs(true);
    triggerCrawl();
  };

  const handleModeSelect = async (mode: 'current' | 'daily' | 'incremental') => {
    try {
      await saveRunModeOnly(mode);
      const modeLabels: Record<string, string> = {
        current: '实时当前榜单模式',
        daily: '每日历史汇总模式',
        incremental: '增量模式',
      };
      setModeToast(`已将抓取策略切换并保存为: ${modeLabels[mode] || mode}`);
      setTimeout(() => setModeToast(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* 优雅的模式切换 Toast 提示 */}
      {modeToast && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-2.5 text-xs text-emerald-900 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{modeToast}</span>
        </div>
      )}

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
            className="h-9 gap-2 text-xs font-semibold shadow-sm transition-all"
          >
            {isCrawling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>抓取执行中...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>立即抓取热点</span>
              </>
            )}
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
            <p className="mt-1 text-[11px] text-zinc-400">
              周期: {formatCronPeriod(cronSchedule)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 热点推送与分析策略设定 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-zinc-500" />
              <div>
                <CardTitle className="text-sm font-semibold">热点推送与分析策略</CardTitle>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-zinc-500">
              当前策略: {currentMode === 'current' ? '实时榜单' : currentMode === 'daily' ? '每日汇总' : '增量对比'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                mode: 'current',
                label: '实时榜单模式 (current)',
                badge: '推荐日常',
                badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                desc: '抓取各大平台当下的最新 Top 榜单并即刻分发。',
                cronTip: '💡 搭配建议：每 15~60 分钟巡检一次',
              },
              {
                mode: 'daily',
                label: '每日汇总模式 (daily)',
                badge: '全天日报',
                badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                desc: '全天多次汇总，生成热点频次统计与霸榜深度简报。',
                cronTip: '💡 搭配建议：每天定点 1~3 次 (如 18:00)',
              },
              {
                mode: 'incremental',
                label: '增量模式 (incremental)',
                badge: '突发防刷屏',
                badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                desc: '自动对比上一轮，仅预警首次上榜的全新突发热点。',
                cronTip: '💡 搭配建议：每 10~15 分钟高频哨兵',
              },
            ].map((item) => {
              const isActive = currentMode === item.mode;
              return (
                <div
                  key={item.mode}
                  onClick={() => handleModeSelect(item.mode as any)}
                  className={cn(
                    'cursor-pointer rounded-lg border p-3.5 transition-all text-xs relative select-none flex flex-col justify-between gap-2.5',
                    isActive
                      ? 'border-zinc-900 bg-zinc-100/90 font-medium dark:border-zinc-100 dark:bg-zinc-800 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-900/40'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.2 rounded border font-normal', item.badgeColor)}>
                          {item.badge}
                        </span>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                      )}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">{item.desc}</div>
                  </div>

                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50 font-mono">
                    {item.cronTip}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 本轮抓取热点成果速览 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm font-semibold">热搜情报成果速览 (Top 5)</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {newsList.length} 条有效
            </Badge>
          </div>
          <a
            href="/"
            className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <span>查看完整热搜大屏</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardHeader>
        <CardContent className="space-y-2">
          {newsList
            .filter((item) => {
              const activeIds = new Set(platforms.filter((p) => p.enabled).map((p) => p.id));
              return activeIds.size === 0 || activeIds.has(item.platform);
            })
            .slice(0, 5)
            .map((item, idx) => (
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

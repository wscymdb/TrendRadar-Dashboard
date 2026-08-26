import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { useNewsStore } from '@/stores/useNewsStore';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

const HomePage: React.FC = () => {
  const { newsList, isCrawling, triggerCrawl, lastCrawlTime } = useNewsStore();
  const { platforms } = useFeedsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'embedded'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 过滤新闻
  const filteredNews = newsList.filter((item) => {
    const matchPlatform =
      selectedPlatform === 'all' || item.platform === selectedPlatform;
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matchedKeywords?.some((k) =>
        k.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchPlatform && matchSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 顶部 Hero 区域 */}
      <div className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:backdrop-blur-sm sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono border-zinc-200 dark:border-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                实时情报雷达
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                上次抓取: {lastCrawlTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              全网热点新闻与 AI 智能大屏
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              聚合今日头条、微博、知乎、B站、华尔街见闻等 11 大主流平台与 RSS 核心情报
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => triggerCrawl()}
              disabled={isCrawling}
              className="gap-2 font-medium"
            >
              <RefreshCw className={cn('h-4 w-4', isCrawling && 'animate-spin')} />
              <span>{isCrawling ? '正在抓取中...' : '立即刷新抓取'}</span>
            </Button>
          </div>
        </div>

        {/* 搜索与视图切换 */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 pt-5 dark:border-zinc-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索关键词（如：DeepSeek, A股, 芯片）..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'cards' | 'embedded')}>
              <TabsList className="h-8">
                <TabsTrigger value="cards" className="text-xs px-3">
                  <Flame className="mr-1 h-3.5 w-3.5" />
                  精选卡片
                </TabsTrigger>
                <TabsTrigger value="embedded" className="text-xs px-3">
                  <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
                  日报大屏
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <>
          {/* 平台分类过滤标签 */}
          <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                selectedPlatform === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              全部平台 ({newsList.length})
            </button>

            {platforms
              .filter((p) => p.enabled)
              .map((p) => {
                const count = newsList.filter((n) => n.platform === p.id).length;
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={cn(
                      'flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
          </div>

          {/* 新闻卡片网格列表 */}
          {filteredNews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500">未找到匹配的热点内容，请尝试其他关键词或刷新抓取</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <Card
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden border-zinc-200/90 transition-all hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    {/* 卡片头部信息 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold font-mono',
                            item.rank === 1
                              ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                              : item.rank <= 3
                              ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                              : 'text-zinc-400'
                          )}
                        >
                          {item.rank}
                        </span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">
                          {item.platformName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {item.isNew && (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[10px] py-0 px-1">
                            NEW
                          </Badge>
                        )}
                        {item.heat && (
                          <span className="font-mono text-[11px] text-zinc-400">
                            🔥 {item.heat}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 新闻标题 */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold leading-snug text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
                    >
                      {item.title}
                    </a>

                    {/* 匹配关键词标签 */}
                    {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.matchedKeywords.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 底部操作与持续时间 */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 text-[11px] text-zinc-400 dark:border-zinc-800/80">
                      <span>持续: {item.duration || '本轮新增'}</span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(item.id, `${item.title} ${item.url}`)}
                          className="flex items-center space-x-1 text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="复制标题与链接"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedId === item.id ? '已复制' : '复制'}</span>
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-0.5 text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        /* 日报大屏内嵌视图 */
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60">
            <span className="font-mono">HTML 可视化日报报告预览</span>
            <a
              href="/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <span>独立新窗口打开</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <iframe
            src="/index.html"
            title="TrendRadar HTML Report"
            className="h-[750px] w-full border-0 bg-white"
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;

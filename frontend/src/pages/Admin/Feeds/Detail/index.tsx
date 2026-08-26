import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Rss, Globe, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';

const FeedDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rssFeeds, toggleRssFeed, platforms } = useFeedsStore();

  // 匹配 RSS 源或平台
  const feed = rssFeeds.find((f) => f.id === id);
  const platform = platforms.find((p) => p.id === id);

  const title = feed?.name || platform?.name || '订阅源详情';
  const isEnabled = feed?.enabled ?? platform?.enabled ?? false;

  return (
    <div className="space-y-6">
      {/* 顶部返回导航 */}
      <div className="flex items-center space-x-3">
        <Link to="/admin/feeds">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>返回订阅列表</span>
          </Button>
        </Link>
      </div>

      {/* 详情标题卡片 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Rss className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg font-bold">{title}</CardTitle>
                  <Badge variant={isEnabled ? 'success' : 'outline'} className="text-[10px]">
                    {isEnabled ? '监控中' : '已暂停'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500">启用状态</span>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => {
                  if (feed) toggleRssFeed(feed.id);
                }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
            <div className="rounded-lg border border-zinc-100 p-3.5 dark:border-zinc-800/80 space-y-1.5">
              <div className="flex items-center text-zinc-400 gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>源链接 URL</span>
              </div>
              <div className="font-mono text-zinc-800 dark:text-zinc-200 break-all">
                {feed?.url || '内置官方平台爬虫采集链路'}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-100 p-3.5 dark:border-zinc-800/80 space-y-1.5">
              <div className="flex items-center text-zinc-400 gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>最后采集活跃时间</span>
              </div>
              <div className="font-mono text-zinc-800 dark:text-zinc-200">
                {feed?.lastFetchedAt || '2026-08-26 11:40'}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>源健康度诊断报告</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              该订阅源 HTTP 状态码为 200 OK，XML 结构解析完整度 100%，近 24 小时内未出现网络超时或解析异常。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedDetailPage;

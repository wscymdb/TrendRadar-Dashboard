import React from "react";
import { Flame, Tag, Globe, Sparkles, Layers } from "lucide-react";
import { PlatformItem } from "@/types/feeds";
import { NewsItem } from "@/types/news";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

export type FilterDimension = "topics" | "platforms";

interface FilterBarProps {
  dimension: FilterDimension;
  onDimensionChange: (dim: FilterDimension) => void;
  platforms: PlatformItem[];
  newsList: NewsItem[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  selectedPlatform: string;
  onSelectPlatform: (platformId: string) => void;
  searchQuery: string;
}

export const FilterBar: React.FC<FilterBarProps> = (props) => {
  const {
    dimension,
    onDimensionChange,
    platforms,
    newsList,
    selectedTopic,
    onSelectTopic,
    selectedPlatform,
    onSelectPlatform,
    searchQuery,
  } = props;

  // 1. 已启用的平台 ID 集合
  const activePlatformIds = new Set(
    platforms.filter((p) => p.enabled).map((p) => p.id),
  );

  // 2. 搜索词过滤辅助
  const filterBySearch = (n: NewsItem) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.matchedKeywords?.some((k) => k.toLowerCase().includes(q))
    );
  };

  // 3. 有效新闻列表
  const validNews = newsList.filter(
    (n) =>
      (activePlatformIds.size === 0 || activePlatformIds.has(n.platform)) &&
      filterBySearch(n),
  );

  // 4. 统计动态命中的主题标签及其频次 (按热度倒序，绝对排除黑名单过滤词如震惊)
  const topicCountMap: Record<string, number> = {};
  let totalMatchedCount = 0;

  for (const item of validNews) {
    const validCleanKeywords = (item.matchedKeywords || []).filter(
      (kw) => kw && !['震惊', '博彩', '过滤', '标题党'].includes(kw)
    );

    if (validCleanKeywords.length > 0) {
      totalMatchedCount += 1;
      for (const kw of validCleanKeywords) {
        topicCountMap[kw] = (topicCountMap[kw] || 0) + 1;
      }
    }
  }

  // 排序高频主题标签列表
  const sortedTopics = Object.entries(topicCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  return (
    <div className="mb-6 space-y-3">
      {/* 第一行：维度切换器 (按关注主题聚合 vs 按平台渠道查看) */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center space-x-2">
          <Tabs
            value={dimension}
            onValueChange={(val) => onDimensionChange(val as FilterDimension)}
          >
            <TabsList className="h-8 bg-zinc-100 dark:bg-zinc-800/80 p-0.5">
              <TabsTrigger
                value="topics"
                className="text-xs px-3 gap-1.5 font-medium"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>按标签</span>
              </TabsTrigger>
              <TabsTrigger
                value="platforms"
                className="text-xs px-3 gap-1.5 font-medium"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>按平台渠道</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
          {dimension === "topics"
            ? `共聚合 ${sortedTopics.length} 个关注主题 · ${totalMatchedCount} 条重点热搜`
            : `共监控 ${platforms.filter((p) => p.enabled).length} 个平台 · ${validNews.length} 条热搜`}
        </div>
      </div>

      {/* 第二行：胶囊标签滑动栏 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
        {dimension === "topics" ? (
          /* ================= 主题标签聚合模式 (对齐原版 HTML) ================= */
          <>
            {/* 全部重点 */}
            <button
              onClick={() => onSelectTopic("all")}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0",
                selectedTopic === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25",
              )}
            >
              <Flame
                className={cn(
                  "h-3.5 w-3.5",
                  selectedTopic === "all" ? "text-amber-400" : "text-amber-500",
                )}
              />
              <span>全部重点</span>
              <span className="font-mono text-[11px] opacity-80">
                ({totalMatchedCount})
              </span>
            </button>

            {/* 各动态主题标签 */}
            {sortedTopics.map(({ topic, count }) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => onSelectTopic(topic)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0",
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  <Tag className="h-3 w-3 text-zinc-400" />
                  <span>{topic}</span>
                  <span className="font-mono text-[11px] opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}

            {sortedTopics.length === 0 && (
              <span className="text-xs text-zinc-400 font-mono py-1">
                当前批次暂未匹配到关键词库中的主题
              </span>
            )}
          </>
        ) : (
          /* ================= 平台渠道模式 ================= */
          <>
            {/* 全部平台 */}
            <button
              onClick={() => onSelectPlatform("all")}
              className={cn(
                "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0",
                selectedPlatform === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              全部平台 ({validNews.length})
            </button>

            {/* 各单平台 */}
            {platforms
              .filter((p) => p.enabled)
              .map((p) => {
                const count = validNews.filter(
                  (n) => n.platform === p.id,
                ).length;
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlatform(p.id)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    )}
                  >
                    {p.name} ({count})
                  </button>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

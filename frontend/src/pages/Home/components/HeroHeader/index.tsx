import React from "react";
import { Search, RefreshCw, Flame, Archive, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface HeroHeaderProps {
  lastCrawlTime: string;
  isCrawling: boolean;
  searchQuery: string;
  viewMode: "cards" | "history";
  availableDates: string[];
  selectedDate: string;
  onSearchChange: (query: string) => void;
  onTriggerCrawl: () => void;
  onTabChange: (mode: string) => void;
  onDateChange: (date: string) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = (props) => {
  const {
    lastCrawlTime,
    isCrawling,
    searchQuery,
    viewMode,
    availableDates,
    selectedDate,
    onSearchChange,
    onTriggerCrawl,
    onTabChange,
    onDateChange,
  } = props;

  return (
    <div className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:backdrop-blur-sm sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-xs font-mono border-zinc-200 dark:border-zinc-800"
            >
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
            聚合今日头条、微博、知乎、B站、华尔街见闻等 11 大主流平台与 RSS
            核心情报
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onTriggerCrawl}
            disabled={isCrawling}
            className="gap-2 font-medium"
          >
            <RefreshCw
              className={cn("h-4 w-4", isCrawling && "animate-spin")}
            />
            <span>{isCrawling ? "正在抓取中..." : "立即刷新抓取"}</span>
          </Button>
        </div>
      </div>

      {/* 搜索与视图切换 */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 pt-5 dark:border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索关键词（如：DeepSeek, A股, 芯片）..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* 历史数据专属：历史日期选择器 */}
          {viewMode === "history" && (
            availableDates.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <Select value={selectedDate} onValueChange={onDateChange}>
                  <SelectTrigger className="h-8 w-[160px] text-xs font-mono border-zinc-200 dark:border-zinc-800">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <SelectValue placeholder="选择历史日期" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {availableDates.map((date) => (
                      <SelectItem
                        key={date}
                        value={date}
                        className="text-xs font-mono"
                      >
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-xs text-zinc-400 font-mono px-2">
                暂无历史归档
              </span>
            )
          )}

          {/* 实时热点 VS 历史数据 Tabs */}
          <Tabs value={viewMode} onValueChange={onTabChange}>
            <TabsList className="h-8">
              <TabsTrigger value="cards" className="text-xs px-3 gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                <span>实时热点</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs px-3 gap-1.5">
                <Archive className="h-3.5 w-3.5" />
                <span>历史数据</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

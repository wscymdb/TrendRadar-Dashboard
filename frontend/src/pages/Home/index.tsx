import React, { useState, useEffect } from 'react';
import { useNewsStore } from '@/stores/useNewsStore';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { HeroHeader } from './components/HeroHeader';
import { PlatformFilter } from './components/PlatformFilter';
import { LiveNewsList } from './components/LiveNewsList';
import { HistoryNewsList } from './components/HistoryNewsList';
import { EmptyState } from './components/EmptyState';

const HomePage: React.FC = () => {
  const {
    newsList,
    availableDates,
    selectedDate,
    setSelectedDate,
    fetchDates,
    setViewScope,
    isCrawling,
    triggerCrawl,
    lastCrawlTime,
    fetchLatestNews,
  } = useNewsStore();
  const { platforms, syncFromBackend: syncFeeds } = useFeedsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'history'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 初始化加载数据和可用历史日期列表
  useEffect(() => {
    fetchLatestNews();
    fetchDates();
    syncFeeds();
  }, []);

  // 切换视图模式：实时热点 (current) vs 历史数据 (history)
  const handleTabChange = (mode: string) => {
    const targetMode = mode as 'cards' | 'history';
    setViewMode(targetMode);
    if (targetMode === 'cards') {
      setViewScope('current');
    } else {
      setViewScope('history');
    }
  };

  // 当前已启用的平台 ID 集合
  const activePlatformIds = new Set(
    platforms.filter((p) => p.enabled).map((p) => p.id)
  );

  // 严格联动过滤：排除已禁用平台、单平台筛选、搜索词匹配
  const filteredNews = newsList.filter((item) => {
    if (activePlatformIds.size > 0 && !activePlatformIds.has(item.platform)) {
      return false;
    }
    // 平台或重点关注过滤
    const matchPlatform =
      selectedPlatform === 'all'
        ? true
        : selectedPlatform === 'matched'
        ? Boolean(item.matchedKeywords && item.matchedKeywords.length > 0)
        : item.platform === selectedPlatform;
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
      {/* 顶部 Hero 区域与搜索/视图切换/日期选择 */}
      <HeroHeader
        lastCrawlTime={lastCrawlTime}
        isCrawling={isCrawling}
        searchQuery={searchQuery}
        viewMode={viewMode}
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSearchChange={setSearchQuery}
        onTriggerCrawl={triggerCrawl}
        onTabChange={handleTabChange}
        onDateChange={setSelectedDate}
      />

      {/* 平台分类过滤标签栏 */}
      <PlatformFilter
        platforms={platforms}
        newsList={newsList}
        selectedPlatform={selectedPlatform}
        searchQuery={searchQuery}
        onSelectPlatform={setSelectedPlatform}
      />

      {/* 内容区域：统一采用极简高级 List 列表形式 */}
      {filteredNews.length === 0 ? (
        <EmptyState />
      ) : viewMode === 'cards' ? (
        <LiveNewsList
          newsList={filteredNews}
          copiedId={copiedId}
          onCopy={handleCopy}
        />
      ) : (
        <HistoryNewsList
          newsList={filteredNews}
          copiedId={copiedId}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
};

export default HomePage;

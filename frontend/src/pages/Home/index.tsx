import React, { useState, useEffect } from 'react';
import { useNewsStore } from '@/stores/useNewsStore';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { HeroHeader } from './components/HeroHeader';
import { FilterBar, FilterDimension } from './components/FilterBar';
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
  const [dimension, setDimension] = useState<FilterDimension>('topics'); // 默认对齐原版：关注主题聚合模式
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
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

  // 联动过滤逻辑：按主题聚合 or 按平台渠道
  const filteredNews = newsList.filter((item) => {
    if (activePlatformIds.size > 0 && !activePlatformIds.has(item.platform)) {
      return false;
    }

    // 1. 维度过滤
    let matchDimension = true;
    if (dimension === 'topics') {
      if (selectedTopic === 'all') {
        // 主题模式下默认只展示命中了关注关键词的高价值热搜 (对齐静态 HTML current.html)
        matchDimension = Boolean(item.matchedKeywords && item.matchedKeywords.length > 0);
      } else {
        matchDimension = Boolean(
          item.matchedKeywords && item.matchedKeywords.includes(selectedTopic)
        );
      }
    } else {
      if (selectedPlatform === 'all') {
        matchDimension = true;
      } else if (selectedPlatform === 'matched') {
        matchDimension = Boolean(item.matchedKeywords && item.matchedKeywords.length > 0);
      } else {
        matchDimension = item.platform === selectedPlatform;
      }
    }

    // 2. 搜索词匹配
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matchedKeywords?.some((k) =>
        k.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchDimension && matchSearch;
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

      {/* 双维度过滤栏 (关注主题聚合 vs 平台渠道全盘) */}
      <FilterBar
        dimension={dimension}
        onDimensionChange={setDimension}
        platforms={platforms}
        newsList={newsList}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        searchQuery={searchQuery}
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

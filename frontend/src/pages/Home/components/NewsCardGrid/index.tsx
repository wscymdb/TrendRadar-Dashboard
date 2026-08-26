import React from 'react';
import { NewsItem } from '@/types/news';
import { NewsCardItem } from '../NewsCardItem';

interface NewsCardGridProps {
  newsList: NewsItem[];
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}

export const NewsCardGrid: React.FC<NewsCardGridProps> = (props) => {
  const { newsList, copiedId, onCopy } = props;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {newsList.map((item) => (
        <NewsCardItem
          key={item.id}
          item={item}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};

export const REFRESH_INTERVAL_OPTIONS = [
  { label: '1 秒 (极速)', value: 1000 },
  { label: '3 秒 (推荐)', value: 3000 },
  { label: '5 秒 (节能)', value: 5000 },
  { label: '暂停', value: 0 },
];

export const formatSecondsToUptime = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds < 0) return '0 秒';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0 || days > 0) parts.push(`${hours} 小时`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} 分`);
  parts.push(`${seconds} 秒`);

  return parts.join(' ');
};

export const getStatusColor = (percent: number): {
  text: string;
  badge: string;
  bg: string;
  border: string;
} => {
  if (percent >= 90) {
    return {
      text: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      bg: 'bg-red-500',
      border: 'border-red-300 dark:border-red-500/30',
    };
  }
  if (percent >= 75) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      bg: 'bg-amber-500',
      border: 'border-amber-300 dark:border-amber-500/30',
    };
  }
  return {
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    bg: 'bg-emerald-500',
    border: 'border-emerald-300 dark:border-emerald-500/30',
  };
};

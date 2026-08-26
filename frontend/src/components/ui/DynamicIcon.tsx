import React from 'react';
import * as Icons from 'lucide-react';
import { RouteIcon } from '@/types/route';
import { cn } from '@/lib/utils';

interface DynamicIconProps {
  icon?: RouteIcon;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ icon, className, size = 16 }) => {
  if (!icon) {
    return <Icons.Circle className={cn('h-4 w-4 opacity-50', className)} size={size} />;
  }

  // 1. 如果本身是 React 组件
  if (typeof icon !== 'string') {
    const Component = icon;
    return <Component className={className} />;
  }

  // 2. 如果是字符串，从 lucide-react 中动态匹配
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[icon];

  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  // 3. 安全降级
  return <Icons.FileText className={cn('opacity-70', className)} size={size} />;
};

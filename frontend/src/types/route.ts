import React from 'react';

/**
 * 路由图标类型：
 * 1. React 组件类型 (如: LayoutDashboard)
 * 2. 字符串类型 (必须为 lucide-react 导出的图标名，如: 'LayoutDashboard', 'Rss', 'Settings')
 */
export type RouteIcon = React.ComponentType<{ className?: string }> | string;

export interface RouteMeta {
  title: string;
  path: string;
  order?: number;
  icon?: RouteIcon;
  hideInMenu?: boolean;
  layout?: 'home' | 'admin' | 'none';
  badge?: string | number;
  component?: React.ComponentType;
  children?: RouteMeta[];
}

export interface MenuItem {
  title: string;
  path: string;
  order: number;
  icon?: RouteIcon;
  badge?: string | number;
  children?: MenuItem[];
}

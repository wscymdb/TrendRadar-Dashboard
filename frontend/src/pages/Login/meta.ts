import { lazy } from 'react';
import { RouteMeta } from '@/types/route';

const meta: RouteMeta = {
  path: '/login',
  title: '安全登录 - TrendRadar 监控中枢',
  layout: 'none',
  hideInMenu: true,
  component: lazy(() => import('./index')),
};

export default meta;

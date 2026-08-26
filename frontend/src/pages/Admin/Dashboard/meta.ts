import { RouteMeta } from '@/types/route';
import { LayoutDashboard } from 'lucide-react';
import DashboardPage from './index';

const meta: RouteMeta = {
  title: '控制台概览',
  path: '/admin/dashboard',
  order: 1,
  icon: LayoutDashboard, // 采用 React 组件形式
  hideInMenu: false,
  layout: 'admin',
  component: DashboardPage,
};

export default meta;

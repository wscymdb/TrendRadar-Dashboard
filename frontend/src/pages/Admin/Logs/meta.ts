import { RouteMeta } from '@/types/route';
import { FileText } from 'lucide-react';
import LogsPage from './index';

const meta: RouteMeta = {
  title: '任务执行日志',
  path: '/admin/logs',
  order: 6,
  icon: FileText,
  hideInMenu: false,
  layout: 'admin',
  component: LogsPage,
};

export default meta;

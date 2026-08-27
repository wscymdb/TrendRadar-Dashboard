import { RouteMeta } from '@/types/route';
import { Settings } from 'lucide-react';
import ConfigPage from './index';

const meta: RouteMeta = {
  title: '配置中心',
  path: '/admin/config',
  order: 5,
  icon: Settings,
  hideInMenu: false,
  layout: 'admin',
  component: ConfigPage,
};

export default meta;

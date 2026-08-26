import { RouteMeta } from '@/types/route';
import { Tag } from 'lucide-react';
import KeywordsPage from './index';

const meta: RouteMeta = {
  title: '关键词管理',
  path: '/admin/keywords',
  order: 4,
  icon: Tag,
  hideInMenu: false,
  layout: 'admin',
  component: KeywordsPage,
};

export default meta;

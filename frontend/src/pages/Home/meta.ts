import { RouteMeta } from '@/types/route';
import HomePage from './index';

const meta: RouteMeta = {
  title: '热搜大屏',
  path: '/',
  order: 0,
  hideInMenu: true,
  layout: 'home',
  component: HomePage,
};

export default meta;

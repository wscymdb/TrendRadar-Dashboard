import { RouteMeta } from '@/types/route';
import FeedsPage from './index';
import FeedDetailPage from './Detail';

const meta: RouteMeta = {
  title: '平台与订阅',
  path: '/admin/feeds',
  order: 3,
  icon: 'Rss', // 采用 String 图标名称形式 (lucide-react)
  hideInMenu: false,
  layout: 'admin',
  badge: 11,
  component: FeedsPage,
  // 核心：在 children 中声明详情子路由（用于自动化注册且不在侧栏主菜单重复显示）
  children: [
    {
      path: ':id',
      title: '订阅源详情',
      hideInMenu: true,
      component: FeedDetailPage,
    },
  ],
};

export default meta;

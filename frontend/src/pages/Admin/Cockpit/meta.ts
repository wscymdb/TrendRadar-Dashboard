import React from 'react';
import { RouteMeta } from '@/types/route';
import { Activity } from 'lucide-react';
import CockpitPage from './index';

const meta: RouteMeta = {
  title: '系统驾驶舱',
  path: '/admin/cockpit',
  order: 2,
  icon: Activity,
  hideInMenu: false,
  layout: 'admin',
  component: CockpitPage as React.ComponentType,
};

export default meta;

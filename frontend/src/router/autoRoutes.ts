import React from 'react';
import { RouteMeta, MenuItem } from '@/types/route';

interface MetaModule {
  default: RouteMeta;
}

// 1. 扫描所有 pages 下的 meta.ts 文件
const metaModules = import.meta.glob<MetaModule>('/src/pages/**/meta.ts', {
  eager: true,
});

export interface FlattenedRoute {
  path: string;
  title: string;
  layout: 'home' | 'admin' | 'none';
  component: React.ComponentType;
  meta: RouteMeta;
}

/**
 * 递归拍平所有路由（包括 children 嵌套详情页），生成供 React Router 使用的路由列表
 */
function extractFlattenedRoutes(
  meta: RouteMeta,
  parentPath = '',
  defaultLayout: 'home' | 'admin' | 'none' = 'admin'
): FlattenedRoute[] {
  const layout = meta.layout || defaultLayout;
  let fullPath = meta.path;

  if (parentPath && !meta.path.startsWith('/')) {
    // 相对路径拼接
    fullPath = `${parentPath.replace(/\/$/, '')}/${meta.path.replace(/^\//, '')}`;
  }

  const results: FlattenedRoute[] = [];

  // 如果当前节点有绑定组件，注册为独立路由
  if (meta.component) {
    results.push({
      path: fullPath,
      title: meta.title,
      layout,
      component: meta.component,
      meta,
    });
  }

  // 递归解析 children 路由
  if (meta.children && meta.children.length > 0) {
    for (const child of meta.children) {
      results.push(...extractFlattenedRoutes(child, fullPath, layout));
    }
  }

  return results;
}

/**
 * 递归构建供 Sidebar 渲染的菜单树（过滤掉 hideInMenu，按 order 升序排序）
 */
function buildMenuTree(metas: RouteMeta[]): MenuItem[] {
  return metas
    .filter(
      (m) =>
        !m.hideInMenu &&
        m.layout !== 'home' &&
        m.layout !== 'none'
    )
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((m) => ({
      title: m.title,
      path: m.path,
      order: m.order ?? 99,
      icon: m.icon,
      badge: m.badge,
      children: m.children ? buildMenuTree(m.children) : undefined,
    }));
}

// 解析所有扫描到的 meta 列表
const allRootMetas: RouteMeta[] = Object.values(metaModules).map(
  (mod: MetaModule) => mod.default
);

// 输出全局路由表
export const allRoutes: FlattenedRoute[] = allRootMetas.flatMap((meta) =>
  extractFlattenedRoutes(meta)
);

// 输出后台管理侧边栏菜单树
export const adminMenuItems: MenuItem[] = buildMenuTree(allRootMetas);

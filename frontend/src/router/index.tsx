import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { allRoutes } from './autoRoutes';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { HomeNavbar } from '@/components/Layout/HomeNavbar';

// 页面 Loading 骨架
const PageLoading: React.FC = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
  </div>
);

export const AppRouter: React.FC = () => {
  // 分离前台与后台路由
  const homeRoutes = allRoutes.filter((r) => r.layout === 'home');
  const adminRoutes = allRoutes.filter((r) => r.layout === 'admin');

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* 前台路由组 (带 HomeNavbar) */}
          {homeRoutes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <div className="h-screen w-screen overflow-y-auto flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
                    <HomeNavbar />
                    <main className="flex-1">
                      <Component />
                    </main>
                  </div>
                }
              />
            );
          })}

          {/* 后台管理路由组 (嵌套在 AdminLayout 下) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {adminRoutes.map((route) => {
              const Component = route.component;
              // 移除 /admin 前缀以支持子路由嵌套
              const relativePath = route.path.replace(/^\/admin\/?/, '');
              return (
                <Route
                  key={route.path}
                  path={relativePath}
                  element={<Component />}
                />
              );
            })}
          </Route>

          {/* 兜底重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

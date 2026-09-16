import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { allRoutes } from './autoRoutes';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { HomeNavbar } from '@/components/Layout/HomeNavbar';
import { getAuthToken } from '@/api';

// 页面 Loading 骨架
const PageLoading: React.FC = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
  </div>
);

// 全站强行门禁守卫：凡未持有登录凭据者，一律拦截至 /login
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    const target = location.pathname + location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(target)}`} replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  // 分离前台、后台与全屏独立路由 (如 /login)
  const homeRoutes = allRoutes.filter((r) => r.layout === 'home');
  const adminRoutes = allRoutes.filter((r) => r.layout === 'admin');
  const noneRoutes = allRoutes.filter((r) => r.layout === 'none');

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* 全屏独立公开路由组 (如 /login，免守卫) */}
          {noneRoutes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          })}

          {/* 前台路由组 (受 AuthGuard 保护，未登录直接拦截) */}
          {homeRoutes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <AuthGuard>
                    <div className="h-screen w-screen overflow-y-auto flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
                      <HomeNavbar />
                      <main className="flex-1">
                        <Component />
                      </main>
                    </div>
                  </AuthGuard>
                }
              />
            );
          })}

          {/* 后台管理路由组 (受 AuthGuard 保护，未登录直接拦截) */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {adminRoutes.map((route) => {
              const Component = route.component;
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

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Radar,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { adminMenuItems } from '@/router/autoRoutes';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useNewsStore } from '@/stores/useNewsStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCrawling } = useNewsStore();

  // 当前匹配的菜单项
  const currentMenu = adminMenuItems.find((m) =>
    location.pathname.startsWith(m.path)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 左侧固定侧边栏 (Sidebar: 固定高度 100vh，不随右侧滚动) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out dark:border-zinc-800/80 dark:bg-zinc-900 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 侧栏顶部 Logo (固定) */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              <Radar className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                TrendRadar
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Admin Console
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 侧栏菜单导航 (自适应内部独立滚动) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium tracking-wider text-zinc-400 uppercase font-mono">
            系统导航
          </div>

          {adminMenuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-zinc-900 text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <DynamicIcon
                    icon={item.icon}
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      isActive
                        ? 'text-zinc-50 dark:text-zinc-900'
                        : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className={cn(
                      'text-[10px] h-4 px-1.5',
                      isActive &&
                        'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* 侧栏底部信息卡片 (固定) */}
        <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
              <span>运行版本</span>
              <span className="font-mono font-medium">v6.10.0</span>
            </div>
            <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              本地与生产配置同步
            </div>
          </div>
        </div>
      </aside>

      {/* 右侧区域 (固定 100vh 高度，包含固定 Header 和独立滚动 Content) */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* 顶部固定 Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* 面包屑导航 */}
            <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-mono">
              <span>管理后台</span>
              <ChevronRight className="h-3 w-3 text-zinc-400" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentMenu?.title || '控制台'}
              </span>
            </div>
          </div>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-3">
            {isCrawling && (
              <Badge
                variant="outline"
                className="text-xs text-emerald-500 animate-pulse hidden sm:inline-flex border-emerald-500/30"
              >
                <Sparkles className="mr-1 h-3 w-3 animate-spin" />
                爬取任务执行中...
              </Badge>
            )}

            <ThemeToggle />

            {/* 返回前台按钮 */}
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">返回前台主页</span>
                <span className="sm:hidden">前台</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* 核心滚动区域：仅在此处进行独立滚动 (Content Overflow Scroll) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

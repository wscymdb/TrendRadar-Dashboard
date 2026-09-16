import React from 'react';
import { Link } from 'react-router-dom';
import { Radar, Settings, Sparkles, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { useNewsStore } from '@/stores/useNewsStore';
import { removeAuthToken, Api } from '@/api';

const HomeNavbar: React.FC = (props) => {
  const {} = props;
  const { lastCrawlTime, isCrawling } = useNewsStore();

  const handleLogout = async () => {
    removeAuthToken();
    try {
      await Api.logout();
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo & 标题 */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              <Radar className="h-4 w-4 animate-spin [animation-duration:8s]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                TrendRadar
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Hot Topics Radar
              </span>
            </div>
          </Link>

          <Badge variant="outline" className="hidden sm:inline-flex border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            11大热搜监控中
          </Badge>
        </div>

        {/* 右侧状态与操作区 */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden md:flex items-center text-xs text-zinc-400 font-mono mr-1">
            {isCrawling ? (
              <span className="flex items-center text-emerald-500">
                <Sparkles className="mr-1 h-3 w-3 animate-spin" />
                正在抓取最新热搜...
              </span>
            ) : (
              <span>更新时间: {lastCrawlTime.split(' ')[1] || lastCrawlTime}</span>
            )}
          </div>

          <ThemeToggle />

          {/* 安全注销退出按钮 */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="group relative h-9 w-9 rounded-full border border-zinc-200/80 bg-white/50 text-zinc-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-rose-300/60 hover:bg-rose-500/10 hover:text-rose-600 active:scale-95 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-rose-800/60 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="sr-only">退出登录</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>退出登录</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 进入后台控制台入口 */}
          <Link to="/admin/dashboard">
            <Button size="sm" className="h-8 gap-1.5 text-xs shadow-sm">
              <Settings className="h-3.5 w-3.5" />
              <span>管理控制台</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
export { HomeNavbar };


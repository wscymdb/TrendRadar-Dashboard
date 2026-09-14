import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCcw,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Api } from '@/api';
import { CrawlHistorySession } from '@/types/crawl';
import { LogSessionItem } from './components/LogSessionItem';
import { LogDetailModal } from './components/LogDetailModal';
import { LogPagination } from './components/LogPagination';

const LogsPage: React.FC = () => {
  const [sessions, setSessions] = useState<CrawlHistorySession[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(200);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'cron' | 'manual' | 'startup'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 弹窗状态 (销毁重建原则)
  const [activeSession, setActiveSession] = useState<CrawlHistorySession | null>(null);

  // 过滤逻辑
  const filteredSessions = sessions.filter((s) => {
    if (!s) return false;
    if (statusFilter === 'success' && s.status !== 'success') return false;
    if (statusFilter === 'error' && s.status === 'success') return false;
    if (triggerFilter !== 'all' && s.triggerType !== triggerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTime = (s.startTime || '').toLowerCase().includes(q);
      const matchLogs = Array.isArray(s.logs) && s.logs.some((l) => (l?.message || '').toLowerCase().includes(q));
      if (!matchTime && !matchLogs) return false;
    }
    return true;
  });

  // 分页切片计算
  const totalFiltered = filteredSessions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(fetchHistory, 15000); // 15秒自动拉取最新历史
    return () => clearInterval(timer);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await Api.getCrawlHistory();
      if (res.success && res.data) {
        if (Array.isArray(res.data.records)) {
          setSessions(res.data.records);
        }
        if (typeof res.data.maxCapacity === 'number') {
          setMaxCapacity(res.data.maxCapacity);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const res = await Api.clearCrawlHistory();
      if (res.success) {
        setSessions([]);
        setCurrentPage(1);
      }
    } finally {
      setClearing(false);
    }
  };

  const handleStatusFilterChange = (val: 'all' | 'success' | 'error') => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleTriggerFilterChange = (val: 'all' | 'cron' | 'manual' | 'startup') => {
    setTriggerFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
            <span>任务执行日志</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            完整记录每次定时调度与手动触发的抓取批次详情、数据入库量、耗时与群机器人广播状态
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* 存储容量指示徽标 */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span>存储容量:</span>
            <strong className="text-zinc-900 dark:text-zinc-100">{sessions.length}</strong>
            <span className="text-zinc-400">/</span>
            <span>{maxCapacity} 批次</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            disabled={loading}
            className="h-9 gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={clearing || sessions.length === 0}
            className="h-9 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
          >
            {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>清空日志</span>
          </Button>
        </div>
      </div>

      {/* 筛选与搜索工具条 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* 状态筛选 */}
          <Select value={statusFilter} onValueChange={(v) => handleStatusFilterChange(v as any)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="执行状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">全部状态</SelectItem>
              <SelectItem value="success" className="text-xs">✅ 执行成功</SelectItem>
              <SelectItem value="error" className="text-xs">❌ 异常/失败</SelectItem>
            </SelectContent>
          </Select>

          {/* 触发方式筛选 */}
          <Select value={triggerFilter} onValueChange={(v) => handleTriggerFilterChange(v as any)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="触发方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">全部触发方式</SelectItem>
              <SelectItem value="cron" className="text-xs">⏰ Cron 定时调度</SelectItem>
              <SelectItem value="manual" className="text-xs">🖱️ 手动点击触发</SelectItem>
              <SelectItem value="startup" className="text-xs">🚀 启动即刻执行</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            共 {filteredSessions.length} / {sessions.length} 次批次记录
          </span>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索时间或日志关键词..."
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* 批次历史列表 */}
      {loading && sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-2" />
          <p className="text-xs text-zinc-500">正在加载任务执行日志...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
          <Radio className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            暂无符合条件的抓取任务执行记录
          </p>
          <p className="mt-1 text-[11px] text-zinc-400 max-w-sm">
            当后台 Cron 定时任务执行或您在前台点击「立即刷新抓取」后，执行记录将自动呈现在此处
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3">
            {paginatedSessions.map((session) => (
              <LogSessionItem
                key={session.id}
                session={session}
                onViewDetails={(s) => setActiveSession(s)}
              />
            ))}
          </div>

          {/* 底部高性能分页组件 */}
          {totalFiltered > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <LogPagination
                currentPage={safeCurrentPage}
                pageSize={pageSize}
                totalItems={totalFiltered}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      )}

      {/* 终端详细日志弹窗 (销毁重建原则) */}
      {activeSession && (
        <LogDetailModal
          session={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}

      {/* 清空历史记录确认弹窗 */}
      <ConfirmDialog
        open={showClearConfirm}
        title="确认清空全部执行日志"
        description="确定要清空系统中全部历史抓取执行批次记录吗？清空后将无法恢复。"
        confirmText="确认清空"
        variant="danger"
        onConfirm={handleClearHistory}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default LogsPage;

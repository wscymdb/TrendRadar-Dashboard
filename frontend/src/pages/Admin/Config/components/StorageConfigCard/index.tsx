import React, { useState } from 'react';
import { Database, Trash2, CheckCircle2, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface StorageConfigCardProps {
  autoCleanupEnabled: boolean;
  maxNewsCapacity: number;
  dataRetentionDays: number;
  onUpdate: (config: { autoCleanupEnabled?: boolean; maxNewsCapacity?: number; dataRetentionDays?: number }) => void;
  onManualCleanup: () => Promise<{ success: boolean; message: string }>;
}

const CAPACITY_PRESETS = [500, 1000, 2000, 5000];
const RETENTION_PRESETS = [7, 15, 30, 90];

export const StorageConfigCard: React.FC<StorageConfigCardProps> = (props) => {
  const {
    autoCleanupEnabled,
    maxNewsCapacity,
    dataRetentionDays,
    onUpdate,
    onManualCleanup,
  } = props;

  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);

  const handleCleanupClick = async () => {
    setCleaning(true);
    setCleanResult(null);
    try {
      const res = await onManualCleanup();
      setCleanResult(res.message);
    } catch (e: any) {
      setCleanResult(`清理失败: ${e?.message || '未知错误'}`);
    } finally {
      setCleaning(false);
      setTimeout(() => setCleanResult(null), 4000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">数据容量与生命周期管理</CardTitle>
              <CardDescription className="text-xs">
                配置单日 SQLite 数据库容量上限与跨天归档保留策略，实现自动化存储管理
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-medium">
              {autoCleanupEnabled ? '自动淘汰已开启' : '自动淘汰已暂停'}
            </span>
            <Switch
              checked={autoCleanupEnabled}
              onCheckedChange={(checked) => onUpdate({ autoCleanupEnabled: checked })}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 单日最大条数限制 */}
          <div className="space-y-2 rounded-lg border border-zinc-100 p-3.5 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                单日热搜最大容量 (条)
              </label>
              <span className="text-[10px] font-mono text-zinc-400">
                单库深度限制
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              💡 <span className="text-zinc-600 dark:text-zinc-300 font-medium">针对单天数据库：</span>限制当天单个 SQLite 数据库（如 2026-08-26.db）累计容纳的热搜上限，超出时自动淘汰最早入库的脱榜旧热点。
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={100}
                max={50000}
                value={maxNewsCapacity}
                onChange={(e) => onUpdate({ maxNewsCapacity: Number(e.target.value) || 1000 })}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {CAPACITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdate({ maxNewsCapacity: preset })}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                    maxNewsCapacity === preset
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {preset}条
                </button>
              ))}
            </div>
          </div>

          {/* 历史归档保留天数 */}
          <div className="space-y-2 rounded-lg border border-zinc-100 p-3.5 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                历史归档保留天数 (天)
              </label>
              <span className="text-[10px] font-mono text-zinc-400">
                时间跨度限制
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              💡 <span className="text-zinc-600 dark:text-zinc-300 font-medium">针对跨天归档总库：</span>限制历史归档的时间跨度，系统将自动清理超出天数的过期 .db 数据库与静态 HTML 报告文件。
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={1}
                max={365}
                value={dataRetentionDays}
                onChange={(e) => onUpdate({ dataRetentionDays: Number(e.target.value) || 30 })}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {RETENTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdate({ dataRetentionDays: preset })}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                    dataRetentionDays === preset
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {preset}天
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 手动清理操作栏 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-zinc-50/80 p-3 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span>支持按当前设定的单日容量上限与保留天数，立即对本地数据库和历史报告执行一次安全修剪。</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cleanResult && (
              <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium font-mono animate-fade-in">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                {cleanResult}
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupClick}
              disabled={cleaning}
              className="h-8 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{cleaning ? '正在清理中...' : '立即执行容量清理'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

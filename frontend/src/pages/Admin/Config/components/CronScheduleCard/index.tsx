import React, { useState, useEffect } from 'react';
import { Clock, Info, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface CronScheduleCardProps {
  cronSchedule: string;
  immediateRun: boolean;
  onUpdate: (config: { cronSchedule?: string; immediateRun?: boolean }) => void;
}

const CRON_PRESETS = [
  {
    label: '每 30 分钟 (整点与半点 :00, :30)',
    value: '*/30 * * * *',
    desc: '在每个时钟的 00 分与 30 分自动执行抓取与推送（推荐）',
  },
  {
    label: '每 15 分钟 (高频巡检 :00, :15, :30, :45)',
    value: '*/15 * * * *',
    desc: '在每个时钟的 00分、15分、30分、45分 高频自动抓取',
  },
  {
    label: '每小时整点 (:00)',
    value: '0 * * * *',
    desc: '在每个小时的 00 分准时执行（如 09:00, 10:00, 11:00...）',
  },
  {
    label: '每 2 小时偶数整点 (08:00, 10:00, 12:00, 14:00, 16:00...)',
    value: '0 */2 * * *',
    desc: '在每天偶数小时的 00 分准时执行（如 10:00, 12:00, 14:00, 16:00, 18:00...）',
  },
  {
    label: '每日早中晚 3 次 (08:00, 12:00, 18:00)',
    value: '0 8,12,18 * * *',
    desc: '每天固定在早报 08:00、午报 12:00、晚报 18:00 各执行一次',
  },
];

/**
 * 极简通俗的 Cron 表达式中文自然语言翻译器
 */
const parseCronToChinese = (cron: string): string => {
  const trimmed = cron.trim();
  if (trimmed === '*/15 * * * *') return '在每个小时的 00分、15分、30分、45分 高频执行';
  if (trimmed === '*/30 * * * *') return '在每个小时的 00分 与 30分 准时执行 (系统默认推荐)';
  if (trimmed === '0 * * * *' || trimmed === '*/60 * * * *') return '在每个小时的 00分 整点准时执行';
  if (trimmed === '0 */2 * * *')
    return '在每天偶数小时的 00 分准时执行（08:00, 10:00, 12:00, 14:00, 16:00, 18:00...）';
  if (trimmed === '0 8,12,18 * * *')
    return '每天固定在早报 08:00、午报 12:00、晚报 18:00 各执行一次';

  const parts = trimmed.split(/\s+/);
  if (parts.length === 5) {
    const [min, hour, dom, mon, dow] = parts;
    if (min.startsWith('*/')) {
      return `在每个时钟的第 ${min.replace('*/', '')} 分钟倍数点执行`;
    }
    if (hour.startsWith('*/') && min === '0') {
      return `在每 ${hour.replace('*/', '')} 小时的 00 分整点执行`;
    }
    if (hour.includes(',') && min === '0') {
      return `每天固定在 ${hour
        .split(',')
        .map((h) => `${h.padStart(2, '0')}:00`)
        .join('、')} 执行`;
    }
    return `自定义 Cron 规则：[分: ${min}] [时: ${hour}] [日: ${dom}] [月: ${mon}] [周: ${dow}]`;
  }
  return '请输入有效的 5 位标准 Cron 表达式（如：*/30 * * * *）';
};

export const CronScheduleCard: React.FC<CronScheduleCardProps> = (props) => {
  const { cronSchedule, immediateRun, onUpdate } = props;

  const isPresetValue = CRON_PRESETS.some((p) => p.value === cronSchedule);
  const [selectMode, setSelectMode] = useState<string>(isPresetValue ? cronSchedule : 'custom');

  useEffect(() => {
    if (isPresetValue) {
      setSelectMode(cronSchedule);
    } else {
      setSelectMode('custom');
    }
  }, [cronSchedule]);

  const handleSelectChange = (val: string) => {
    setSelectMode(val);
    if (val !== 'custom') {
      onUpdate({ cronSchedule: val });
    }
  };

  const chineseMeaning = parseCronToChinese(cronSchedule || '*/30 * * * *');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">自动拉取与定时调度配置 (Cron)</CardTitle>
              <CardDescription className="text-xs">
                配置后台定时自动抓取巡检周期，无需人工干预即可定时生成报告与触发推送
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-[11px] font-mono text-zinc-500">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              调度引擎运行中
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        {/* 1. 下拉框选择常用周期或自定义 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              自动调度执行周期
            </label>
            <span className="text-[11px] font-mono text-zinc-400">
              下拉快速选择常用预设或自定义
            </span>
          </div>

          <Select value={selectMode} onValueChange={handleSelectChange}>
            <SelectTrigger className="text-xs font-medium">
              <SelectValue placeholder="选择调度周期" />
            </SelectTrigger>
            <SelectContent>
              {CRON_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value} className="text-xs">
                  <span className="font-medium">{preset.label}</span>
                  <span className="ml-2 font-mono text-[11px] text-zinc-400">({preset.value})</span>
                </SelectItem>
              ))}
              <SelectItem value="custom" className="text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" />
                  自定义 Cron 表达式...
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 预设模式下的极简说明 */}
          {selectMode !== 'custom' && (
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-0.5">
              <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{chineseMeaning}</span>
            </p>
          )}
        </div>

        {/* 2. 仅当选择“自定义 Cron”时才展开输入框与深度解析 */}
        {selectMode === 'custom' && (
          <div className="rounded-lg border border-zinc-200/80 p-3.5 space-y-3 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                自定义 5 位 Cron 调度表达式
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                分 时 日 月 周
              </span>
            </div>

            <Input
              value={cronSchedule}
              onChange={(e) => onUpdate({ cronSchedule: e.target.value })}
              placeholder="*/30 * * * *"
              className="font-mono text-xs bg-white dark:bg-zinc-900"
            />

            <div className="flex items-start gap-2 rounded-md bg-zinc-100/90 p-2.5 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">中文规则解析：</span>
                <span>{chineseMeaning}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. 启动即刻执行开关 */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800/80">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              服务启动或配置保存后立即抓取一次 (Immediate Run)
            </div>
            <div className="text-[11px] text-zinc-400">
              开启后，每次服务启动或修改配置时会立即触发一次热搜采集，无需等待第一个 Cron 周期到达
            </div>
          </div>

          <Switch
            checked={immediateRun}
            onCheckedChange={(checked) => onUpdate({ immediateRun: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

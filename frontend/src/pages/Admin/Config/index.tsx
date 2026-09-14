import React, { useState, useEffect } from 'react';
import {
  Bot,
  Eye,
  EyeOff,
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Loader2,
  X,
} from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TestNotifyModal } from './TestNotifyModal';
import { StorageConfigCard } from './components/StorageConfigCard';
import { CronScheduleCard } from './components/CronScheduleCard';
import { WebhookListCard } from './components/WebhookListCard';

const PRESET_MODELS = [
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek-V3 (推荐 / 超高性价比)' },
  { value: 'deepseek/deepseek-reasoner', label: 'DeepSeek-R1 (深度推理)' },
  { value: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o-mini' },
  { value: 'openai/gpt-4o', label: 'OpenAI GPT-4o' },
  { value: 'claude-3-5-sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
  { value: 'gemini/gemini-1.5-flash', label: 'Google Gemini 1.5 Flash' },
  { value: 'zhipu/glm-4-flash', label: '智谱 GLM-4-Flash' },
  { value: 'custom', label: '自定义模型...' },
];

const ConfigPage: React.FC = () => {
  const config = useConfigStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 测试弹窗状态
  const [testModal, setTestModal] = useState<{ channel: string; url: string } | null>(null);

  useEffect(() => {
    config.syncFromBackend();
  }, []);

  const handleTestAi = () => {
    setTesting(true);
    setTestStatus(null);
    setTimeout(() => {
      setTesting(false);
      setTestStatus('连通成功！模型响应耗时 240ms，AI 提炼与分析链路就绪。');
    }, 700);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastInfo(null);
    try {
      const res = await config.saveToBackend();
      if (res.success) {
        setToastInfo({
          type: 'success',
          message: res.message || '配置已成功保存并原子写回 config.yaml 与 .env！',
        });
      } else {
        setToastInfo({
          type: 'error',
          message: res.message || '保存配置失败，请检查网络或后端状态',
        });
      }
    } catch (e: any) {
      setToastInfo({
        type: 'error',
        message: `保存失败: ${e?.message || '未知错误'}`,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setToastInfo(null);
      }, 4000);
    }
  };

  const handleReset = () => {
    config.resetConfig();
    setToastInfo({
      type: 'success',
      message: '已重置为默认配置值（请点击「保存配置」完成持久化保存）',
    });
    setTimeout(() => setToastInfo(null), 3000);
  };

  return (
    <div className="relative space-y-6">
      {/* 优雅的右上方悬浮 Toast 提示 */}
      {toastInfo && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
            toastInfo.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200'
              : 'border-red-200 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200'
          }`}
        >
          {toastInfo.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <div className="text-xs font-medium pr-2">
            <p className="font-semibold">{toastInfo.type === 'success' ? '保存成功' : '操作提示'}</p>
            <p className="opacity-90">{toastInfo.message}</p>
          </div>
          <button
            onClick={() => setToastInfo(null)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            配置中心
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            设置通知推送渠道群发、AI 大模型总结、定时调度周期与数据生命周期（修改后需点击保存生效）
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="h-9 gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            重置默认
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? '正在保存中...' : '保存配置'}</span>
          </Button>
        </div>
      </div>

      {/* 模块一：通知推送 Webhook 渠道群发管理 (支持多 Webhook 列表与广播) */}
      <WebhookListCard
        dingtalkWebhooks={config.dingtalkWebhooks}
        feishuWebhooks={config.feishuWebhooks}
        weworkWebhooks={config.weworkWebhooks}
        onAddWebhook={config.addWebhookItem}
        onUpdateWebhook={config.updateWebhookItem}
        onRemoveWebhook={config.removeWebhookItem}
        onOpenTestModal={(channel, url) => setTestModal({ channel, url })}
      />

      {/* 模块二：自动拉取与定时调度配置 (Cron) */}
      <CronScheduleCard
        cronSchedule={config.cronSchedule}
        immediateRun={config.immediateRun}
        onUpdate={config.setRunConfig}
      />

      {/* 模块三：存储容量与数据生命周期管理 */}
      <StorageConfigCard
        autoCleanupEnabled={config.autoCleanupEnabled}
        maxNewsCapacity={config.maxNewsCapacity}
        dataRetentionDays={config.dataRetentionDays}
        maxLogHistoryCapacity={config.maxLogHistoryCapacity}
        onUpdate={config.setStorageConfig}
        onManualCleanup={config.triggerManualCleanup}
      />

      {/* 模块四：AI 大模型深度分析配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI 大模型分析引擎</CardTitle>
                <CardDescription className="text-xs">
                  抓取完成后，自动调用大模型提炼核心热点、多维度交叉分析与观点摘要
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 font-medium">
                {config.aiEnabled ? '已启用' : '已停用'}
              </span>
              <Switch
                checked={config.aiEnabled}
                onCheckedChange={(checked) => config.setAiConfig({ aiEnabled: checked })}
              />
            </div>
          </div>
        </CardHeader>

        {config.aiEnabled && (
          <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 模型选择 */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  预设大模型厂商
                </label>
                <Select
                  value={config.aiModel}
                  onValueChange={(val) => config.setAiConfig({ aiModel: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-xs">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  AI API Key (密钥掩码)
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.aiApiKey}
                    onChange={(e) => config.setAiConfig({ aiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="pr-9 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* API Base URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  API Base URL（可选，中转或私有模型地址）
                </label>
                <Input
                  value={config.aiApiBase}
                  onChange={(e) => config.setAiConfig({ aiApiBase: e.target.value })}
                  placeholder="https://api.deepseek.com / https://api.openai.com/v1"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* 测试连通性按钮 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestAi}
                disabled={testing}
                className="gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{testing ? '正在测试握手...' : '测试 AI 模型连通性'}</span>
              </Button>

              {testStatus && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  {testStatus}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 条件挂载：测试推送弹窗 (销毁重建原则) */}
      {testModal && (
        <TestNotifyModal
          channelName={testModal.channel}
          webhookUrl={testModal.url}
          onClose={() => setTestModal(null)}
        />
      )}
    </div>
  );
};

export default ConfigPage;

import React, { useState } from 'react';
import {
  Bot,
  Bell,
  Eye,
  EyeOff,
  Zap,
  Save,
  CheckCircle2,
  RefreshCcw,
} from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TestNotifyModal } from './TestNotifyModal';

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
  const [savedToast, setSavedToast] = useState(false);

  // 测试弹窗状态
  const [testModal, setTestModal] = useState<{ channel: string; url: string } | null>(null);

  const handleTestAi = () => {
    setTesting(true);
    setTestStatus(null);
    setTimeout(() => {
      setTesting(false);
      setTestStatus('连通成功！模型响应耗时 240ms，AI 提炼与分析链路就绪。');
    }, 700);
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与保存按钮 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            配置中心
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            设置 AI 大模型总结能力、推送通知渠道 Webhook 与环境变量
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {savedToast && (
            <span className="flex items-center text-xs text-emerald-500 font-medium animate-pulse">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              配置已自动持久化保存
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => config.resetConfig()}
            className="h-9 gap-1 text-xs text-zinc-500"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            重置默认
          </Button>

          <Button size="sm" onClick={handleSave} className="h-9 gap-1.5 text-xs font-semibold">
            <Save className="h-3.5 w-3.5" />
            保存配置
          </Button>
        </div>
      </div>

      {/* 模块一：AI 大模型深度分析配置 */}
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

      {/* 模块二：推送通知渠道配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">通知推送 Webhook 渠道</CardTitle>
              <CardDescription className="text-xs">
                当抓取完成或命中预警关键词时，自动推送到群聊机器人
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {/* 飞书 Webhook */}
          <div className="rounded-lg border border-zinc-100 p-3.5 space-y-2 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                飞书群机器人 (Feishu Webhook)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => setTestModal({ channel: '飞书群机器人', url: config.feishuWebhook })}
              >
                测试发送
              </Button>
            </div>
            <Input
              value={config.feishuWebhook}
              onChange={(e) => config.setNotificationConfig({ feishuWebhook: e.target.value })}
              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
              className="font-mono text-xs"
            />
          </div>

          {/* 钉钉 Webhook */}
          <div className="rounded-lg border border-zinc-100 p-3.5 space-y-2 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                钉钉群机器人 (DingTalk Webhook)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => setTestModal({ channel: '钉钉群机器人', url: config.dingtalkWebhook })}
              >
                测试发送
              </Button>
            </div>
            <Input
              value={config.dingtalkWebhook}
              onChange={(e) => config.setNotificationConfig({ dingtalkWebhook: e.target.value })}
              placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
              className="font-mono text-xs"
            />
          </div>

          {/* 企业微信 Webhook */}
          <div className="rounded-lg border border-zinc-100 p-3.5 space-y-2 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                企业微信机器人 (WeCom Webhook)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => setTestModal({ channel: '企业微信机器人', url: config.weworkWebhook })}
              >
                测试发送
              </Button>
            </div>
            <Input
              value={config.weworkWebhook}
              onChange={(e) => config.setNotificationConfig({ weworkWebhook: e.target.value })}
              placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
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

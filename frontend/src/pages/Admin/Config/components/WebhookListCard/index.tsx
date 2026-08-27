import React, { useState } from 'react';
import { Bell, Plus, Trash2, Send, CheckCircle2, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { WebhookItem } from '@/types/config';
import { cn } from '@/lib/utils';

interface WebhookListCardProps {
  dingtalkWebhooks: WebhookItem[];
  feishuWebhooks: WebhookItem[];
  weworkWebhooks: WebhookItem[];
  onAddWebhook: (channel: 'dingtalk' | 'feishu' | 'wework') => void;
  onUpdateWebhook: (channel: 'dingtalk' | 'feishu' | 'wework', id: string, patch: Partial<WebhookItem>) => void;
  onRemoveWebhook: (channel: 'dingtalk' | 'feishu' | 'wework', id: string) => void;
  onOpenTestModal: (channelName: string, url: string) => void;
}

export const WebhookListCard: React.FC<WebhookListCardProps> = (props) => {
  const {
    dingtalkWebhooks,
    feishuWebhooks,
    weworkWebhooks,
    onAddWebhook,
    onUpdateWebhook,
    onRemoveWebhook,
    onOpenTestModal,
  } = props;

  const [activeTab, setActiveTab] = useState<'dingtalk' | 'feishu' | 'wework'>('dingtalk');

  const currentList =
    activeTab === 'dingtalk'
      ? dingtalkWebhooks
      : activeTab === 'feishu'
      ? feishuWebhooks
      : weworkWebhooks;

  const channelMeta = {
    dingtalk: {
      name: '钉钉群机器人 (DingTalk)',
      placeholder: 'https://oapi.dingtalk.com/robot/send?access_token=...',
      tip: '支持添加多个钉钉群机器人 Webhook。系统抓取到热点后将并行推送到列表中的所有群聊。',
      keywordTip: '安全设置建议：在钉钉机器人安全设置中勾选【自定义关键词】，输入「热点」或「TrendRadar」即可正常接收。',
    },
    feishu: {
      name: '飞书群机器人 (Feishu)',
      placeholder: 'https://open.feishu.cn/open-apis/bot/v2/hook/...',
      tip: '支持添加多个飞书群 Webhook。推送将以富文本卡片格式广播发送。',
      keywordTip: '',
    },
    wework: {
      name: '企业微信群机器人 (WeCom)',
      placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
      tip: '支持添加多个企业微信群 Webhook。推送将以 Markdown 格式广播发送。',
      keywordTip: '',
    },
  };

  const meta = channelMeta[activeTab];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">通知推送 Webhook 渠道群发管理</CardTitle>
              <CardDescription className="text-xs">
                支持为每个平台配置多个群机器人 Webhook，实现不同部门与群组的并行广播推送
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'dingtalk' | 'feishu' | 'wework')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="dingtalk" className="text-xs px-2.5 gap-1.5">
                  <span>钉钉群</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                    {dingtalkWebhooks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="feishu" className="text-xs px-2.5 gap-1.5">
                  <span>飞书群</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                    {feishuWebhooks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="wework" className="text-xs px-2.5 gap-1.5">
                  <span>企业微信</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                    {weworkWebhooks.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-medium">
            已配置 {currentList.length} 个 {meta.name.split(' ')[0]}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddWebhook(activeTab)}
            className="h-8 gap-1.5 text-xs font-medium border-dashed border-zinc-300 dark:border-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>添加 {meta.name.split(' ')[0]}</span>
          </Button>
        </div>

        {/* Webhook 列表 */}
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <Radio className="h-7 w-7 text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              尚未添加任何 {meta.name.split(' ')[0]} Webhook
            </p>
            <p className="mt-1 text-[11px] text-zinc-400 max-w-sm">
              点击上方「添加」按钮输入群机器人的 Webhook 地址，即可开启全自动热点广播推送
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200/80 p-3.5 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-1/3 min-w-[140px]">
                    <span className="text-[11px] font-mono text-zinc-400">#{index + 1}</span>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        onUpdateWebhook(activeTab, item.id, { name: e.target.value })
                      }
                      placeholder="群备注名称 (如: 研发热点群)"
                      className="h-8 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenTestModal(`${meta.name.split(' ')[0]} (${item.name || `群 #${index + 1}`})`, item.url)}
                      disabled={!item.url}
                      className="h-7 px-2.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 gap-1"
                    >
                      <Send className="h-3 w-3" />
                      <span>测试发送</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveWebhook(activeTab, item.id)}
                      className="h-7 px-2 text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    value={item.url}
                    onChange={(e) =>
                      onUpdateWebhook(activeTab, item.id, { url: e.target.value })
                    }
                    placeholder={meta.placeholder}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部贴心提示 */}
        <div className="rounded-lg bg-zinc-50 p-3 text-[11px] text-zinc-500 dark:bg-zinc-950/60 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>{meta.tip}</span>
          </p>
          {meta.keywordTip && (
            <p className="text-zinc-400 dark:text-zinc-500 pl-5">
              💡 {meta.keywordTip}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

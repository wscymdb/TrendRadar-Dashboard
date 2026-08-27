import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Api } from '@/api';

interface TestNotifyModalProps {
  channelName: string;
  webhookUrl: string;
  onClose: () => void;
}

export const TestNotifyModal: React.FC<TestNotifyModalProps> = (props) => {
  const { channelName, webhookUrl, onClose } = props;
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<boolean | null>(null);
  const [resultMsg, setResultMsg] = useState<string>('');

  const handleSendTest = async () => {
    setSending(true);
    setSentSuccess(null);
    setResultMsg('');
    const res = await Api.testWebhook(channelName, webhookUrl);
    setSending(false);
    setSentSuccess(res.success);
    setResultMsg(res.message || (res.success ? '测试消息已成功触发投递！' : '投递失败，请检查网络或 Webhook URL 是否有效。'));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>发送测试消息到 {channelName}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            模拟向配置的 Webhook 发送一条包含【热点】关键词的 TrendRadar 测试消息。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950 text-xs">
            <div className="text-[11px] text-zinc-400 mb-1">目标 Webhook 地址:</div>
            <div className="font-mono text-zinc-700 dark:text-zinc-300 break-all">
              {webhookUrl || '（未输入 Webhook 地址，请先在配置框中填入 URL）'}
            </div>
          </div>

          {/* 模拟卡片预览 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                📢 TrendRadar 热点速报 [测试]
              </span>
              <Badge variant="outline" className="text-[10px]">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">
              🎉 恭喜！{channelName} 推送通道已成功连通。当系统抓取到符合规则的热点时，将自动推送卡片到当前群聊。
            </p>
          </div>

          {sentSuccess !== null && (
            <div
              className={`flex items-start space-x-2 rounded-lg p-2.5 text-xs ${
                sentSuccess
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}
            >
              {sentSuccess ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">
                {resultMsg}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            关闭
          </Button>
          <Button
            size="sm"
            onClick={handleSendTest}
            disabled={sending}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{sending ? '正在投递...' : '立即发送测试'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

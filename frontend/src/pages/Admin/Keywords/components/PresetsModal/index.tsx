import React, { useState } from 'react';
import { Sparkles, Check, Download, Layers } from 'lucide-react';
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

interface PresetsModalProps {
  onApplyPreset: (groups: Record<string, string[]>) => void;
  onClose: () => void;
}

const PRESET_PACKS = [
  {
    id: 'tech_ai',
    title: '🤖 科技前沿与 AI 大模型',
    desc: '覆盖 DeepSeek、OpenAI、芯片算力、具身智能与大模型生态',
    groups: {
      '人工智能与大模型': [
        'DeepSeek',
        'OpenAI',
        'ChatGPT',
        'Claude',
        '大模型',
        'AGI',
        '算力',
        '英伟达',
        'GPU',
        'Kimi',
        '智谱',
        'MiniMax',
        '具身智能',
        '文生图',
        'Sora',
      ],
      '半导体与前沿硬件': [
        '芯片',
        '光刻机',
        '台积电',
        '华为',
        '中芯国际',
        'ASML',
        '存储芯片',
        'HBM',
        '人形机器人',
      ],
    },
  },
  {
    id: 'finance_macro',
    title: '📈 宏观金融与 A 股资本市场',
    desc: '覆盖货币政策、A股指数、美联储动向与宏观经济指标',
    groups: {
      '金融与资本市场': [
        'A股',
        '上证指数',
        '创业板',
        '北向资金',
        '央行',
        '降息',
        '降准',
        '美联储',
        '非农',
        '通胀',
        '国债',
        '人民币汇率',
      ],
    },
  },
  {
    id: 'ev_consumer',
    title: '🚗 新能源汽车与消费电子',
    desc: '覆盖造车新势力、智能座舱、固态电池与智能手机',
    groups: {
      '新能源与智能汽车': [
        '特斯拉',
        '比亚迪',
        '小米汽车',
        '华为汽车',
        '智驾',
        'FSD',
        '固态电池',
        '自动驾驶',
      ],
      '智能消费电子': [
        '苹果',
        'iPhone',
        'Mate70',
        '折叠屏',
        'VisionPro',
        'XR',
      ],
    },
  },
];

export const PresetsModal: React.FC<PresetsModalProps> = (props) => {
  const { onApplyPreset, onClose } = props;
  const [selectedPacks, setSelectedPacks] = useState<string[]>(['tech_ai']);

  const handleToggle = (id: string) => {
    if (selectedPacks.includes(id)) {
      setSelectedPacks(selectedPacks.filter((p) => p !== id));
    } else {
      setSelectedPacks([...selectedPacks, id]);
    }
  };

  const handleConfirm = () => {
    const merged: Record<string, string[]> = {};
    for (const pack of PRESET_PACKS) {
      if (selectedPacks.includes(pack.id)) {
        for (const [g, words] of Object.entries(pack.groups)) {
          if (!merged[g]) merged[g] = [];
          for (const w of words) {
            if (!merged[g].includes(w)) merged[g].push(w);
          }
        }
      }
    }
    onApplyPreset(merged);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>载入行业关注词库预设包</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            选择推荐的行业词库模版，一键合并追加到您当前的关注词库中。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {PRESET_PACKS.map((pack) => {
            const isChecked = selectedPacks.includes(pack.id);
            const totalWords = Object.values(pack.groups).reduce((a, b) => a + b.length, 0);

            return (
              <div
                key={pack.id}
                onClick={() => handleToggle(pack.id)}
                className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/90 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {pack.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {totalWords} 词条
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {pack.desc}
                  </p>
                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white transition-all ${
                    isChecked
                      ? 'border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={selectedPacks.length === 0}
            className="h-8 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>导入所选预设包</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

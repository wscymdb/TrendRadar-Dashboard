import React, { useState, useEffect } from 'react';
import { FileCode, Info, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RawTextEditorProps {
  initialText: string;
  onChangeText: (text: string) => void;
}

export const RawTextEditor: React.FC<RawTextEditorProps> = (props) => {
  const { initialText, onChangeText } = props;
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onChangeText(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = text.split('\n').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <FileCode className="h-4 w-4 text-zinc-500" />
          <span>config/frequency_words.txt 源码直接编辑</span>
          <span className="text-[11px] text-zinc-400 font-mono font-normal">
            ({lineCount} 行代码)
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2.5 text-xs text-zinc-600 dark:text-zinc-400 gap-1"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? '已复制' : '复制代码'}</span>
        </Button>
      </div>

      <div className="relative rounded-xl border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-800 shadow-inner">
        <textarea
          value={text}
          onChange={handleChange}
          rows={16}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-xs text-zinc-200 outline-none resize-y leading-relaxed scrollbar-thin selection:bg-zinc-700"
          placeholder="# === 分类名称 ===&#10;关键词1 关键词2 关键词3"
        />
      </div>

      <div className="rounded-lg bg-zinc-50 p-3 text-[11px] text-zinc-500 dark:bg-zinc-950/60 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
        <p className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>格式说明：</span>
        </p>
        <p className="pl-5">
          • 使用 <code className="font-mono text-zinc-800 dark:text-zinc-200"># === 分类名称 ===</code> 作为分组标题；
        </p>
        <p className="pl-5">
          • 下一行使用空格或换行罗列该分类下的关键词；修改后切换回可视化视图会自动同步解析！
        </p>
      </div>
    </div>
  );
};

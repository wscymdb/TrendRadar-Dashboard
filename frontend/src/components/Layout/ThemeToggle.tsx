import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/Button';

interface WaveEffect {
  id: number;
  x: number;
  y: number;
  targetIsDark: boolean;
}

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [wave, setWave] = useState<WaveEffect | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // 如果当前是 dark，即将切换为 light；反之即将切换为 dark
    const targetIsDark = theme !== 'dark';

    // 1. 触发全屏极客流光冲击波
    setWave({
      id: Date.now(),
      x,
      y,
      targetIsDark,
    });

    // 2. 激活全局色彩平滑流动层
    document.documentElement.classList.add('theme-transitioning');

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    // 3. 切换核心主题
    toggleTheme();

    transitionTimerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 700);
  };

  return (
    <>
      {/* 🌌 使用 createPortal 穿透至 document.body 顶层：双层赛博深蓝慢漫极光水波 */}
      {createPortal(
        <AnimatePresence>
          {wave && (
            <div
              key={wave.id}
              className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden"
            >
              {/* 第一重：主极光扩散冲击波 (清晰肉眼可见、慢速席卷全屏) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.1 }}
                animate={{
                  opacity: [0, 0.85, 0.75, 0.4, 0],
                  scale: [0.1, 1.2, 2.2, 3.2, 4.2],
                }}
                transition={{
                  duration: wave.targetIsDark ? 1.4 : 0.9,
                  times: [0, 0.15, 0.45, 0.75, 1],
                  ease: 'easeInOut',
                }}
                onAnimationComplete={() => setWave(null)}
                className="absolute rounded-full blur-3xl"
                style={{
                  left: wave.x - 400,
                  top: wave.y - 400,
                  width: 800,
                  height: 800,
                  background: wave.targetIsDark
                    ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(99, 102, 241, 0.6) 30%, rgba(147, 51, 234, 0.35) 55%, transparent 75%)'
                    : 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.5) 30%, rgba(254, 240, 138, 0.2) 60%, transparent 75%)',
                }}
              />

              {/* 第二重：外圈柔和极光光雾拖尾 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{
                  opacity: [0, 0.5, 0.3, 0],
                  scale: [0.2, 1.5, 2.8, 4.0],
                }}
                transition={{
                  duration: wave.targetIsDark ? 1.6 : 1.0,
                  times: [0, 0.2, 0.6, 1],
                  ease: 'easeOut',
                  delay: 0.08,
                }}
                className="absolute rounded-full blur-[90px]"
                style={{
                  left: wave.x - 500,
                  top: wave.y - 500,
                  width: 1000,
                  height: 1000,
                  background: wave.targetIsDark
                    ? 'radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(139, 92, 246, 0.25) 50%, transparent 80%)'
                    : 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 80%)',
                }}
              />
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="group relative h-9 w-9 overflow-hidden rounded-full border border-zinc-200/80 bg-white/50 text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-zinc-300 hover:shadow-md active:scale-95 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:shadow-indigo-500/10"
        title={theme === 'dark' ? '切换为浅色晨曦模式' : '切换为极客深邃夜景'}
      >
        {/* 动态光环底衬 */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0.2, rotate: -180, opacity: 0, filter: 'blur(4px)' }}
              animate={{ scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.2, rotate: 180, opacity: 0, filter: 'blur(4px)' }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 20,
              }}
              className="relative flex items-center justify-center text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            >
              <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-2 w-2 text-amber-300" />
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0.2, rotate: 180, opacity: 0, filter: 'blur(4px)' }}
              animate={{ scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.2, rotate: -180, opacity: 0, filter: 'blur(4px)' }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 20,
              }}
              className="relative flex items-center justify-center text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            >
              <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-2 w-2 text-indigo-400" />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">切换主题</span>
      </Button>
    </>
  );
};

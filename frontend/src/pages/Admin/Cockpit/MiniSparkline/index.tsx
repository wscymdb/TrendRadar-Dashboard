import React, { useMemo } from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'blue';
  height?: number;
  min?: number;
  max?: number;
  unit?: string;
  showCurrentBadge?: boolean;
}

const COLOR_MAP = {
  emerald: {
    stroke: '#10b981',
    fillStart: 'rgba(16, 185, 129, 0.22)',
    fillEnd: 'rgba(16, 185, 129, 0.0)',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  },
  cyan: {
    stroke: '#06b6d4',
    fillStart: 'rgba(6, 182, 212, 0.22)',
    fillEnd: 'rgba(6, 182, 212, 0.0)',
    badge: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20',
  },
  violet: {
    stroke: '#8b5cf6',
    fillStart: 'rgba(139, 92, 246, 0.22)',
    fillEnd: 'rgba(139, 92, 246, 0.0)',
    badge: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20',
  },
  amber: {
    stroke: '#f59e0b',
    fillStart: 'rgba(245, 158, 11, 0.22)',
    fillEnd: 'rgba(245, 158, 11, 0.0)',
    badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  },
  blue: {
    stroke: '#3b82f6',
    fillStart: 'rgba(59, 130, 246, 0.22)',
    fillEnd: 'rgba(59, 130, 246, 0.0)',
    badge: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  },
};

const MiniSparkline: React.FC<MiniSparklineProps> = (props) => {
  const {
    data = [],
    color = 'cyan',
    height = 64,
    min: forcedMin,
    max: forcedMax,
    unit = '',
    showCurrentBadge = true,
  } = props;

  const currentVal = data.length > 0 ? data[data.length - 1] : 0;
  const colorTheme = COLOR_MAP[color] || COLOR_MAP.cyan;
  const gradientId = useMemo(() => `sparkline-grad-${color}-${Math.random().toString(36).substring(2, 7)}`, [color]);

  const { pathD, areaD, lastPoint } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pathD: '', areaD: '', lastPoint: null };
    }

    const width = 300;
    const paddingY = 6;
    const effectiveHeight = height - paddingY * 2;

    const dataMin = forcedMin !== undefined ? forcedMin : Math.min(...data);
    const dataMax = forcedMax !== undefined ? forcedMax : Math.max(...data);
    const range = dataMax - dataMin === 0 ? 1 : dataMax - dataMin;

    const points = data.map((val, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * width;
      const normalized = (val - dataMin) / range;
      const y = height - paddingY - normalized * effectiveHeight;
      return { x, y };
    });

    if (points.length === 1) {
      const p = points[0];
      return {
        pathD: `M 0 ${p.y} L ${width} ${p.y}`,
        areaD: `M 0 ${p.y} L ${width} ${p.y} L ${width} ${height} L 0 ${height} Z`,
        lastPoint: p,
      };
    }

    // 生成平滑贝塞尔曲线
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const area = `${d} L ${width} ${height} L 0 ${height} Z`;
    const lastP = points[points.length - 1];

    return { pathD: d, areaD: area, lastPoint: lastP };
  }, [data, height, forcedMin, forcedMax]);

  return (
    <div className="relative w-full overflow-hidden">
      {showCurrentBadge && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-mono tracking-wider text-[10px] uppercase">
            实时波动曲线 (60s)
          </span>
          <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border ${colorTheme.badge}`}>
            {currentVal.toFixed(1)} {unit}
          </span>
        </div>
      )}
      <div className="relative w-full" style={{ height }}>
        {/* 背景微网格标线 */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 dark:opacity-15">
          <div className="w-full border-b border-zinc-300 dark:border-zinc-500 border-dashed" />
          <div className="w-full border-b border-zinc-300 dark:border-zinc-500 border-dashed" />
          <div className="w-full border-b border-zinc-300 dark:border-zinc-500 border-dashed" />
        </div>

        <svg
          viewBox={`0 0 300 ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorTheme.fillStart} />
              <stop offset="100%" stopColor={colorTheme.fillEnd} />
            </linearGradient>
          </defs>

          {/* 填充面积 */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#${gradientId})`}
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* 核心折线 */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={colorTheme.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 ease-out drop-shadow-sm"
            />
          )}

          {/* 曲线末端发光脉冲点 */}
          {lastPoint && (
            <g>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="4"
                fill={colorTheme.stroke}
                className="animate-ping opacity-60"
              />
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="3"
                fill="#ffffff"
                stroke={colorTheme.stroke}
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default MiniSparkline;

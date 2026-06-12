import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

type Props = {
  steps: number;
  goal: number;
  streak: number;
  size?: number;
  stroke?: number;
};

const fmt = (n: number) => n.toLocaleString();

export function ProgressRing({ steps, goal, streak, size = 280, stroke = 16 }: Props) {
  const pct = Math.min(1, Math.max(0, steps / goal));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const hit = pct >= 1;
  const pctLabel = `${Math.round(pct * 100)}% DONE`;

  const strokeColor = hit ? '#d4ff3a' : '#d4ff3a';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#1a1d24" fill="none" strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={strokeColor}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#ring-glow)"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center select-none gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20">
          <Flame className="size-3.5 text-lime-400" />
          <span className="text-xs font-bold tracking-widest text-lime-400">
            {streak}-DAY STREAK
          </span>
        </div>
        <div className="text-6xl font-extrabold tabular-nums text-ice-100 leading-none">
          {fmt(steps)}
        </div>
        <div className="text-xs font-medium tracking-[0.2em] text-ink-300">
          STEPS / {fmt(goal)}
        </div>
        <div className="mt-1 px-3 py-1 rounded-full bg-ink-800/80 border border-ink-700/50">
          <span className="text-xs font-bold tracking-wider text-ice-100">{pctLabel}</span>
        </div>
      </div>
    </div>
  );
}

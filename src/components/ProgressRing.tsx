import { motion } from 'framer-motion';

type Props = {
  steps: number;
  goal: number;
  size?: number;
  stroke?: number;
};

const fmt = (n: number) => n.toLocaleString();

export function ProgressRing({ steps, goal, size = 260, stroke = 22 }: Props) {
  const pct = Math.min(1, Math.max(0, steps / goal));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const hit = pct >= 1;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="currentColor" strokeOpacity="0.12" fill="none" strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={hit ? '#f59e0b' : 'url(#ring-grad)'}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <div className="text-5xl font-bold tabular-nums">{fmt(steps)}</div>
        <div className="text-sm opacity-70 mt-1">of {fmt(goal)} steps</div>
      </div>
    </div>
  );
}

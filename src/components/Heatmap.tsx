import { motion } from 'framer-motion';
import { monthGrid } from '../lib/dates';

type Props = {
  year: number;
  monthIndex0: number;
  goal: number;
  entries: Record<string, number>;
  startDate: string;
  today: string;
  onPick: (iso: string) => void;
};

function pctClasses(pct: number): string {
  if (pct >= 1)    return 'bg-lime-400 text-ink-900 shadow-glow-lime-soft';
  if (pct >= 0.75) return 'bg-lime-400/70 text-ink-900';
  if (pct >= 0.5)  return 'bg-lime-400/40 text-ice-100';
  if (pct >= 0.25) return 'bg-lime-400/20 text-ice-100';
  return 'bg-ink-800/70 text-ink-300';
}

const DOW = ['S','M','T','W','T','F','S'];

export function Heatmap({ year, monthIndex0, goal, entries, startDate, today, onPick }: Props) {
  const cells = monthGrid(year, monthIndex0);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-[10px] font-bold tracking-widest text-ink-500 text-center">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(({ iso, inMonth }) => {
          const steps = entries[iso] ?? 0;
          const pct = steps / goal;
          const before = iso < startDate;
          const isToday = iso === today;
          const dayNum = parseInt(iso.slice(8, 10), 10);
          return (
            <motion.button
              key={iso}
              whileTap={{ scale: 0.94 }}
              onClick={() => onPick(iso)}
              className={[
                'aspect-square rounded-xl text-xs font-semibold flex items-center justify-center border border-ink-800/50',
                inMonth ? '' : 'opacity-25',
                before ? 'opacity-30 bg-ink-800/40 text-ink-500 border-transparent' : pctClasses(pct),
                isToday ? 'ring-2 ring-lime-400' : '',
              ].join(' ')}
            >
              {dayNum}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

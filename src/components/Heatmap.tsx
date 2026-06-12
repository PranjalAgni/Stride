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

function pctClass(pct: number): string {
  if (pct >= 1)    return 'bg-mint-500 text-white';
  if (pct >= 0.75) return 'bg-mint-300';
  if (pct >= 0.5)  return 'bg-mint-200';
  if (pct >= 0.25) return 'bg-mint-100';
  return 'bg-white/60 dark:bg-ink-900/40';
}

const DOW = ['S','M','T','W','T','F','S'];

export function Heatmap({ year, monthIndex0, goal, entries, startDate, today, onPick }: Props) {
  const cells = monthGrid(year, monthIndex0);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-xs opacity-50 text-center">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
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
                'aspect-square rounded-xl text-xs flex items-center justify-center font-medium',
                inMonth ? '' : 'opacity-30',
                before ? 'opacity-30' : pctClass(pct),
                isToday ? 'ring-2 ring-mint-500' : '',
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

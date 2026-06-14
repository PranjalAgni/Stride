import { Pencil } from 'lucide-react';
import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const FULL_DOW = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
];

function formatHeaderDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function dayOfWeek(iso: string): string {
  return FULL_DOW[fromISO(iso).getDay()];
}

type Status = { label: string; color: string };
function status(steps: number, goal: number): Status {
  if (steps === 0) return { label: 'Not logged', color: 'text-ink-300' };
  if (steps >= goal) return { label: 'Met', color: 'text-lime-400 font-semibold' };
  return { label: 'Missed', color: 'text-red-400' };
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave: _onSave }: Props) {
  const s = status(steps, goal);
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-extrabold text-ice-100">Selected Day</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {formatHeaderDate(iso)}
        </div>
      </div>
      <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {dayOfWeek(iso)}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-5xl font-extrabold tabular-nums text-ice-100 truncate">
              {steps.toLocaleString()}
            </span>
            <span className="text-sm text-ink-300">steps</span>
          </div>
          <button
            type="button"
            aria-label="Edit steps"
            className="size-10 rounded-full bg-ink-900/60 border border-ink-700/60 grid place-items-center text-ice-100 hover:text-lime-400 transition-colors shrink-0"
          >
            <Pencil className="size-4" strokeWidth={2.25} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-700/60 flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(212,255,58,0.6)]" />
          <span className="text-ink-300">
            Goal: {goal.toLocaleString()} <span className="text-ink-500">•</span>{' '}
            <span className={s.color}>{s.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

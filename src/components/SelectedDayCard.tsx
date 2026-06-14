import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function formatHeaderDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave }: Props) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-extrabold text-ice-100">Selected Day</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {formatHeaderDate(iso)}
        </div>
      </div>
      <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
        {/* body filled in next task */}
      </div>
    </div>
  );
}

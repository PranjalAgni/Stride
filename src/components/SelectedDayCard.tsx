import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
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

function parseDraft(raw: string): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(steps));
  const s = status(steps, goal);

  const enterEdit = () => {
    setDraft(String(steps));
    setIsEditing(true);
  };
  const cancel = () => {
    setDraft(String(steps));
    setIsEditing(false);
  };
  const save = () => {
    onSave(iso, parseDraft(draft));
    setIsEditing(false);
  };

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
          {isEditing ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              autoFocus
              aria-label="Steps"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-40 bg-transparent text-5xl font-extrabold tabular-nums text-ice-100 border-b border-ink-700/60 outline-none focus:border-lime-400/60"
            />
          ) : (
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-5xl font-extrabold tabular-nums text-ice-100 truncate">
                {steps.toLocaleString()}
              </span>
              <span className="text-sm text-ink-300">steps</span>
            </div>
          )}

          {isEditing ? (
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                aria-label="Save"
                onClick={save}
                className="size-10 rounded-full bg-lime-400 text-ink-900 grid place-items-center shadow-[0_0_10px_rgba(212,255,58,0.35)] hover:bg-lime-300 transition-colors"
              >
                <Check className="size-5" strokeWidth={3} />
              </button>
              <button
                type="button"
                aria-label="Cancel"
                onClick={cancel}
                className="size-10 rounded-full bg-ink-900/60 border border-ink-700/60 grid place-items-center text-ink-300 hover:text-ice-100 transition-colors"
              >
                <X className="size-5" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Edit steps"
              onClick={enterEdit}
              className="size-10 rounded-full bg-ink-900/60 border border-ink-700/60 grid place-items-center text-ice-100 hover:text-lime-400 transition-colors shrink-0"
            >
              <Pencil className="size-4" strokeWidth={2.25} />
            </button>
          )}
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

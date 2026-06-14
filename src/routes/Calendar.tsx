import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { SelectedDayCard } from '../components/SelectedDayCard';
import { fromISO, monthGrid, toISO, todayISO } from '../lib/dates';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const fmt = (n: number) => n.toLocaleString();

export default function Calendar() {
  const navigate = useNavigate();
  const today = todayISO();
  const todayDate = fromISO(today);
  const { entries, setSteps } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(entries, today);

  const [view, setView] = useState({
    year: todayDate.getFullYear(),
    monthIndex: todayDate.getMonth(),
  });
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const cells = useMemo(
    () => monthGrid(view.year, view.monthIndex),
    [view.year, view.monthIndex],
  );

  const stats = useMemo(() => {
    const startOfMonth = toISO(new Date(view.year, view.monthIndex, 1));
    const endOfMonth = toISO(new Date(view.year, view.monthIndex + 1, 0));
    const upTo = today < endOfMonth ? today : endOfMonth;

    let total = 0;
    let daysCounted = 0;
    let goalMet = 0;

    for (const cell of cells) {
      if (!cell.inMonth) continue;
      if (cell.iso > upTo) continue;
      if (cell.iso < settings.startDate) continue;
      const steps = entries[cell.iso] ?? 0;
      total += steps;
      daysCounted += 1;
      if (steps >= settings.goal) goalMet += 1;
    }

    // previous month total for the % change
    const prevDate = new Date(view.year, view.monthIndex - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();
    const prevCells = monthGrid(prevYear, prevMonth);
    let prevTotal = 0;
    for (const cell of prevCells) {
      if (!cell.inMonth) continue;
      if (cell.iso < settings.startDate) continue;
      prevTotal += entries[cell.iso] ?? 0;
    }

    const avg = daysCounted > 0 ? Math.round(total / daysCounted) : 0;
    const pctVsPrev =
      prevTotal > 0
        ? Math.round(((total - prevTotal) / prevTotal) * 100)
        : null;

    return {
      total,
      avg,
      goalMet,
      daysCounted,
      pctVsPrev,
      prevMonthShort: MONTHS_SHORT[prevMonth],
      startOfMonth,
    };
  }, [cells, entries, settings.goal, settings.startDate, today, view]);

  const goPrevMonth = () => {
    setSelectedIso(null);
    setView((v) => {
      const d = new Date(v.year, v.monthIndex - 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  };
  const goNextMonth = () => {
    setSelectedIso(null);
    setView((v) => {
      const d = new Date(v.year, v.monthIndex + 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  };

  return (
    <div className="pb-6">
      <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-ink-800">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-ice-100 hover:text-lime-400 transition-colors"
        >
          <ArrowLeft className="size-6" strokeWidth={2.25} />
        </button>
        <h1 className="text-xl font-extrabold text-ice-100 tracking-tight">
          Calendar
        </h1>
        <button
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="text-ink-300 hover:text-ice-100 transition-colors"
        >
          <UserCircle2 className="size-7" strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-5 pt-5 space-y-5">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrevMonth}
            aria-label="Previous month"
            className="size-10 rounded-full border border-ink-700/60 grid place-items-center text-ice-100 hover:bg-ink-800/60 transition-colors"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} />
          </button>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-ice-100 tracking-tight">
              {MONTHS[view.monthIndex]} {view.year}
            </div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300 mt-1">
              ACTIVE STREAK: {streak.current} DAYS
            </div>
          </div>
          <button
            onClick={goNextMonth}
            aria-label="Next month"
            className="size-10 rounded-full border border-ink-700/60 grid place-items-center text-ice-100 hover:bg-ink-800/60 transition-colors"
          >
            <ChevronRight className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="rounded-3xl bg-[#0B1122] border border-ink-700/60 p-4">
          <div className="grid grid-cols-7 gap-1 mb-3 text-center text-[11px] font-bold tracking-widest text-ink-300">
            {DOW.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {cells.map(({ iso, inMonth }) => {
              const steps = entries[iso] ?? 0;
              const isToday = iso === today;
              const isFuture = iso > today;
              const beforeStart = iso < settings.startDate;
              const met = !isFuture && !beforeStart && steps >= settings.goal;
              const restDay = !isFuture && !beforeStart && !met && steps === 0;
              const missed = !isFuture && !beforeStart && !met && steps > 0;
              const dayNum = parseInt(iso.slice(8, 10), 10);
              const isPastSelectableDay = inMonth && !isFuture && !beforeStart;
              const isSelected = selectedIso === iso;

              const cellClasses = `relative size-9 grid place-items-center rounded-xl text-base font-semibold tabular-nums ${
                isToday || isSelected
                  ? 'bg-ink-900/80 border border-ice-300/70 text-ice-100 shadow-[0_0_10px_rgba(143,200,255,0.35)]'
                  : ''
              } ${
                !inMonth || isFuture || beforeStart
                  ? 'text-ink-500'
                  : 'text-ice-100'
              }`;

              return (
                <div key={iso} className="flex flex-col items-center gap-1.5">
                  {isToday ? (
                    <button
                      type="button"
                      aria-label="Clear selection"
                      onClick={() => setSelectedIso(null)}
                      className={cellClasses}
                    >
                      {dayNum}
                      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(143,200,255,0.8)]" />
                    </button>
                  ) : isPastSelectableDay ? (
                    <button
                      type="button"
                      aria-label={`Select ${iso}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelectedIso((cur) => (cur === iso ? null : iso))
                      }
                      className={cellClasses}
                    >
                      {dayNum}
                    </button>
                  ) : (
                    <div className={cellClasses}>{dayNum}</div>
                  )}
                  <DayDot
                    inMonth={inMonth}
                    isFuture={isFuture}
                    beforeStart={beforeStart}
                    met={met}
                    restDay={restDay}
                    missed={missed}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 px-4 py-3 flex items-center justify-around text-xs text-ink-300">
          <LegendItem variant="met" label="Goal Met" />
          <LegendItem variant="rest" label="Rest Day" />
          <LegendItem variant="missed" label="Missed" />
        </div>

        {selectedIso ? (
          <SelectedDayCard
            key={selectedIso}
            iso={selectedIso}
            steps={entries[selectedIso] ?? 0}
            goal={settings.goal}
            onSave={setSteps}
          />
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-ice-100 mb-3">
              Monthly Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="TOTAL STEPS"
                value={fmt(stats.total)}
                footer={
                  stats.pctVsPrev !== null ? (
                    <span className="text-lime-400 font-semibold">
                      {stats.pctVsPrev >= 0 ? '+' : ''}
                      {stats.pctVsPrev}% vs {stats.prevMonthShort}
                    </span>
                  ) : null
                }
              />
              <StatCard
                label="AVG STEPS"
                value={fmt(stats.avg)}
                footer={
                  stats.avg >= settings.goal ? (
                    <span className="text-lime-400 font-semibold">
                      Above goal
                    </span>
                  ) : (
                    <span className="text-ink-300 font-semibold">
                      Goal: {fmt(settings.goal)}
                    </span>
                  )
                }
              />
            </div>

            <div className="mt-3 rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
              <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
                DAYS GOAL MET
              </div>
              <div className="mt-1 text-4xl font-extrabold text-ice-100 tabular-nums">
                {stats.goalMet} / {stats.daysCounted} Days
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type DotProps = {
  inMonth: boolean;
  isFuture: boolean;
  beforeStart: boolean;
  met: boolean;
  restDay: boolean;
  missed: boolean;
};
function DayDot({
  inMonth,
  isFuture,
  beforeStart,
  met,
  restDay,
  missed,
}: DotProps) {
  if (!inMonth || isFuture || beforeStart) {
    return <span className="size-1.5 rounded-full bg-transparent" />;
  }
  if (met) {
    return (
      <span className="size-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(212,255,58,0.6)]" />
    );
  }
  if (restDay) {
    return <span className="size-2 rounded-full bg-ink-500/70" />;
  }
  if (missed) {
    return <span className="size-2 rounded-full border border-ink-300/70" />;
  }
  return <span className="size-1.5 rounded-full bg-transparent" />;
}

function LegendItem({
  variant,
  label,
}: {
  variant: 'met' | 'rest' | 'missed';
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      {variant === 'met' && (
        <span className="size-2.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(212,255,58,0.6)]" />
      )}
      {variant === 'rest' && (
        <span className="size-2.5 rounded-full bg-ink-500/70" />
      )}
      {variant === 'missed' && (
        <span className="size-2.5 rounded-full border border-ink-300/70" />
      )}
      <span>{label}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
      <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold text-ice-100 tabular-nums">
        {value}
      </div>
      {footer && <div className="mt-2 text-xs">{footer}</div>}
    </div>
  );
}

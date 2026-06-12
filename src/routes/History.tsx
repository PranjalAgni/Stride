import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Footprints, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { addDays, fromISO, todayISO, weekStartingMonday } from '../lib/dates';

const fmt = (n: number) => n.toLocaleString();

const DOW_LABEL = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const FULL_DAY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
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

function formatLongDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function dayLabel(iso: string, today: string): string {
  if (iso === today) return 'Today';
  if (iso === addDays(today, -1)) return 'Yesterday';
  return FULL_DAY[fromISO(iso).getDay()];
}

export default function History() {
  const today = todayISO();
  const { entries } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(entries, today);

  const weekIsos = useMemo(() => weekStartingMonday(today), [today]);
  const weekTotal = useMemo(
    () => weekIsos.reduce((sum, iso) => sum + (entries[iso] ?? 0), 0),
    [weekIsos, entries],
  );

  const recentDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  }, [today]);

  return (
    <div className="pb-6">
      <Header />

      <div className="px-5 pt-5 space-y-5">
        <Section label="STREAK STATS">
          <div className="rounded-2xl border border-lime-400/30 bg-[#0B1122] p-4 shadow-glow-lime-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-ink-300">Current Streak</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tabular-nums text-ice-100">
                    {streak.current}
                  </span>
                  <span className="text-base font-semibold text-ice-100">
                    days
                  </span>
                </div>
              </div>
              <div className="size-9 rounded-full bg-lime-400/10 border border-lime-400/30 grid place-items-center">
                <Zap
                  className="size-4 text-lime-400"
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4 divide-y divide-ink-700/60">
            <Row
              label="Best Streak"
              value={`${streak.longest} days`}
              valueColor="text-ice-100"
            />
            <Row
              label="Total Steps (Week)"
              value={fmt(weekTotal)}
              valueColor="text-lime-400"
            />
          </div>
        </Section>

        <Section
          label="WEEKLY GOAL PROGRESS"
          right={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-bold text-ice-100 hover:text-lime-400 transition-colors"
            >
              Full Calendar <ArrowRight className="size-4" />
            </button>
          }
          title={
            <span>
              <span className="text-ice-100">Target: {fmt(settings.goal)}</span>
              <span className="text-ink-300"> / day</span>
            </span>
          }
        >
          <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
            <div className="grid grid-cols-7 gap-2 text-center">
              {DOW_LABEL.map((d) => (
                <div
                  key={d}
                  className="text-[10px] font-bold tracking-widest text-ink-300"
                >
                  {d}
                </div>
              ))}
              {weekIsos.map((iso) => {
                const steps = entries[iso] ?? 0;
                const isToday = iso === today;
                const isFuture = iso > today;
                const met = !isFuture && steps >= settings.goal;
                const beforeStart = iso < settings.startDate;
                return (
                  <DayPill
                    key={iso}
                    isToday={isToday}
                    isFuture={isFuture}
                    met={met}
                    beforeStart={beforeStart}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex justify-center gap-5 text-xs text-ink-300">
              <Legend variant="solid" color="bg-lime-400" label="Goal Met" />
              <Legend
                variant="solid"
                color="bg-ink-700 border border-ink-500/40"
                label="Rest Day"
              />
              <Legend variant="dashed" label="Upcoming" />
            </div>
          </div>
        </Section>

        <Section label="RECENT HISTORY">
          <div className="space-y-2.5">
            {recentDays.map((iso) => {
              const steps = entries[iso] ?? 0;
              const beforeStart = iso < settings.startDate;
              const logged = steps > 0;
              const met = steps >= settings.goal;
              const overPct = met
                ? Math.round((steps / settings.goal - 1) * 100)
                : 0;

              return (
                <motion.div
                  key={iso}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-3 flex items-center gap-3"
                >
                  <div
                    className={`size-12 rounded-xl grid place-items-center shrink-0 ${
                      logged && !beforeStart
                        ? 'bg-lime-400/10'
                        : 'bg-ink-900/60'
                    }`}
                  >
                    <Footprints
                      className={`size-6 ${
                        logged && !beforeStart
                          ? met
                            ? 'text-lime-400'
                            : 'text-lime-400/70'
                          : 'text-ink-500'
                      }`}
                      strokeWidth={2.25}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-ice-100 leading-tight">
                      {dayLabel(iso, today)}
                    </div>
                    <div className="text-xs text-ink-300 mt-0.5">
                      {formatLongDate(iso)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {beforeStart ? (
                      <div className="text-xs text-ink-500">Before start</div>
                    ) : (
                      <>
                        <div
                          className={`text-xl font-extrabold tabular-nums ${
                            met ? 'text-lime-400' : 'text-ice-100'
                          }`}
                        >
                          {logged ? fmt(steps) : '—'}
                        </div>
                        <div
                          className={`text-[11px] font-medium ${
                            met
                              ? 'text-ink-300'
                              : !logged
                                ? 'text-ink-500'
                                : 'text-red-400'
                          }`}
                        >
                          {met
                            ? `+${overPct}% over goal`
                            : !logged
                              ? 'Not logged'
                              : 'Missed goal'}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

type SectionProps = {
  label: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  title?: React.ReactNode;
};
function Section({ label, children, right, title }: SectionProps) {
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {label}
        </div>
        {right}
      </div>
      {title && <div className="mb-3 text-lg font-extrabold">{title}</div>}
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-ink-300">{label}</span>
      <span className={`text-base font-extrabold tabular-nums ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

type LegendProps =
  | { variant: 'solid'; color: string; label: string }
  | { variant: 'dashed'; label: string };
function Legend(props: LegendProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {props.variant === 'solid' ? (
        <span className={`size-2.5 rounded-full ${props.color}`} />
      ) : (
        <span className="size-2.5 rounded-full border border-dashed border-ink-500/70" />
      )}
      <span>{props.label}</span>
    </div>
  );
}

type DayPillProps = {
  isToday: boolean;
  isFuture: boolean;
  met: boolean;
  beforeStart: boolean;
};
function DayPill({ isToday, isFuture, met, beforeStart }: DayPillProps) {
  if (met) {
    return (
      <div className="size-10 mx-auto rounded-full bg-lime-400 grid place-items-center text-ink-900">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="size-10 mx-auto rounded-full border-2 border-ice-300 bg-ink-900 grid place-items-center text-[9px] font-extrabold tracking-wider text-ice-300 shadow-[0_0_10px_rgba(143,200,255,0.4)]">
        TODAY
      </div>
    );
  }

  if (isFuture) {
    return (
      <div className="size-10 mx-auto rounded-full border border-dashed border-ink-500/70 grid place-items-center">
        <span className="size-1 rounded-full bg-ink-500/70" />
      </div>
    );
  }

  // Past day: not met (or before challenge start). Solid pill, distinct from card bg.
  return (
    <div
      className={`size-10 mx-auto rounded-full border grid place-items-center ${
        beforeStart
          ? 'bg-ink-900/80 border-ink-700/60'
          : 'bg-ink-700 border-ink-500/40'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          beforeStart ? 'bg-ink-500/70' : 'bg-green-500/70'
        }`}
      />
    </div>
  );
}

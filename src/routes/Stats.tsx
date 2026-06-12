import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
} from 'recharts';
import { BadgeGrid } from '../components/BadgeGrid';
import { useEntries } from '../hooks/useEntries';
import { useStreak } from '../hooks/useStreak';
import { addDays, todayISO } from '../lib/dates';
import { computeUnlocks } from '../lib/badges';

function avg(xs: number[]) {
  if (xs.length === 0) return 0;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
}

export default function Stats() {
  const today = todayISO();
  const { entries } = useEntries();
  const streak = useStreak(today);
  const unlockedIds = computeUnlocks(streak.longest);

  const last30 = useMemo(() => {
    const out: { date: string; steps: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const iso = addDays(today, -i);
      out.push({ date: iso.slice(5), steps: entries[iso] ?? 0 });
    }
    return out;
  }, [entries, today]);

  const last12Weeks = useMemo(() => {
    const out: { week: string; avg: number }[] = [];
    for (let w = 11; w >= 0; w--) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = addDays(today, -(w * 7 + d));
        days.push(entries[iso] ?? 0);
      }
      out.push({ week: `${w}w`, avg: avg(days) });
    }
    return out;
  }, [entries, today]);

  const allValues = Object.values(entries);
  const stats = {
    avg7:  avg(last30.slice(-7).map(d => d.steps)),
    avg30: avg(last30.map(d => d.steps)),
    best:  allValues.reduce((a, b) => Math.max(a, b), 0),
    total: allValues.reduce((a, b) => a + b, 0),
  };

  return (
    <div className="px-5 pt-8 space-y-6 pb-6">
      <div className="grid grid-cols-2 gap-3">
        <Card label="7-day avg"  value={stats.avg7.toLocaleString()} />
        <Card label="30-day avg" value={stats.avg30.toLocaleString()} />
        <Card label="Best day"   value={stats.best.toLocaleString()} />
        <Card label="Total"      value={stats.total.toLocaleString()} />
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 opacity-80">Last 30 days</h3>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <LineChart data={last30}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 opacity-80">Last 12 weeks (avg/day)</h3>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={last12Weeks}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="week" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="avg" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 opacity-80">Badges</h3>
        <BadgeGrid unlockedIds={unlockedIds} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
      <div className="text-xs opacity-60">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

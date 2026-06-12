import { useState } from 'react';
import { Header } from '../components/Header';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSettings } from '../hooks/useSettings';
import { useEntries } from '../hooks/useEntries';
import { todayISO } from '../lib/dates';

export default function Settings() {
  const { settings, update } = useSettings();
  const { clearAll } = useEntries();
  const [confirmReset, setConfirmReset] = useState(false);

  const goalError = settings.goal < 1000 ? 'Goal must be at least 1,000' : null;
  const today = todayISO();

  return (
    <div className="pb-6">
      <Header />
      <div className="px-5 pt-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-ice-100">Settings</h1>

        <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4">
          <label className="text-[10px] font-bold tracking-[0.2em] text-ink-300">DAILY GOAL</label>
          <input
            type="number"
            inputMode="numeric"
            value={settings.goal}
            onChange={(e) => update({ goal: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-ice-100 outline-none mt-1"
          />
          {goalError && <div className="text-xs text-lime-400 mt-1">{goalError}</div>}
        </div>

        <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4">
          <label className="text-[10px] font-bold tracking-[0.2em] text-ink-300">CHALLENGE START DATE</label>
          <input
            type="date"
            value={settings.startDate}
            max={today}
            onChange={(e) => update({ startDate: e.target.value })}
            className="w-full bg-transparent text-base text-ice-100 outline-none mt-1"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4">
          <label className="text-[10px] font-bold tracking-[0.2em] text-ink-300">THEME</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['light','dark','system'] as const).map(t => (
              <button
                key={t}
                onClick={() => update({ theme: t })}
                className={`rounded-xl py-2 capitalize text-sm font-semibold transition-colors ${
                  settings.theme === t
                    ? 'bg-lime-400 text-ink-900'
                    : 'bg-ink-900 border border-ink-700/60 text-ink-300'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setConfirmReset(true)}
          className="w-full rounded-2xl bg-ink-800/70 border border-red-500/30 text-red-400 py-3 font-bold"
        >Reset all data</button>

        <ConfirmDialog
          open={confirmReset}
          title="Reset all data?"
          body="This will delete all logged steps and unlock history. This cannot be undone."
          confirmLabel="Yes, reset"
          onConfirm={() => { clearAll(); localStorage.removeItem('dailysteps:meta'); setConfirmReset(false); }}
          onCancel={() => setConfirmReset(false)}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
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
    <div className="px-5 pt-8 space-y-5">
      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Daily goal</label>
        <input
          type="number"
          inputMode="numeric"
          value={settings.goal}
          onChange={(e) => update({ goal: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none"
        />
        {goalError && <div className="text-xs text-peach-500 mt-1">{goalError}</div>}
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Challenge start date</label>
        <input
          type="date"
          value={settings.startDate}
          max={today}
          onChange={(e) => update({ startDate: e.target.value })}
          className="w-full bg-transparent text-base outline-none"
        />
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Theme</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['light','dark','system'] as const).map(t => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`rounded-2xl py-2 capitalize ${
                settings.theme === t ? 'bg-mint-400 text-white' : 'bg-ink-50 dark:bg-ink-950'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setConfirmReset(true)}
        className="w-full rounded-3xl bg-peach-100 text-peach-500 py-3 font-semibold"
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
  );
}

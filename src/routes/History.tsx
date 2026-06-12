import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Heatmap } from '../components/Heatmap';
import { DayDetailSheet } from '../components/DayDetailSheet';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { todayISO } from '../lib/dates';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function History() {
  const today = todayISO();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const { entries, setSteps, clearDay } = useEntries();
  const { settings } = useSettings();

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const next = () => {
    const isCurrent = year === now.getFullYear() && month === now.getMonth();
    if (isCurrent) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-2 rounded-xl bg-white/60 dark:bg-ink-900/60">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="p-2 rounded-xl bg-white/60 dark:bg-ink-900/60">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <Heatmap
        year={year} monthIndex0={month}
        goal={settings.goal}
        entries={entries}
        startDate={settings.startDate}
        today={today}
        onPick={setSelected}
      />

      <DayDetailSheet
        iso={selected}
        steps={selected ? (entries[selected] ?? 0) : 0}
        goal={settings.goal}
        onSave={setSteps}
        onClear={clearDay}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

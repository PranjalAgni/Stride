import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
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

  const isCurrent = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="pb-6">
      <Header />
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold text-ice-100">History</h1>

        <div className="mt-5 flex items-center justify-between mb-4">
          <button
            onClick={prev}
            aria-label="Previous month"
            className="size-10 grid place-items-center rounded-xl bg-ink-800/70 border border-ink-700/60 text-ice-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold text-ice-100">{MONTHS[month]} {year}</h2>
          <button
            onClick={next}
            disabled={isCurrent}
            aria-label="Next month"
            className="size-10 grid place-items-center rounded-xl bg-ink-800/70 border border-ink-700/60 text-ice-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
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
    </div>
  );
}

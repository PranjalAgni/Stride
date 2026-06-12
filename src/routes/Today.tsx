import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../components/ProgressRing';
import { StreakChip } from '../components/StreakChip';
import { QuickAddRow } from '../components/QuickAddRow';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { todayISO } from '../lib/dates';
import { pickEncouragement } from '../lib/messages';

export default function Today() {
  const today = todayISO();
  const { entries, addSteps, setSteps } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(today);
  const { vibrate } = useHaptics();

  const stepsToday = entries[today] ?? 0;
  const progress = stepsToday / settings.goal;
  const message = useMemo(() => pickEncouragement(progress, today), [progress, today]);

  const [celebrated, setCelebrated] = useLocalStorage<{ celebratedDates: string[] }>(
    'dailysteps:meta',
    { celebratedDates: [] },
  );

  const [fire, setFire] = useState(false);
  const wasBelow = useRef(stepsToday < settings.goal);
  useEffect(() => {
    const isAtOrAbove = stepsToday >= settings.goal;
    const alreadyCelebrated = celebrated.celebratedDates.includes(today);
    if (isAtOrAbove && wasBelow.current && !alreadyCelebrated) {
      setFire(true);
      setCelebrated({ celebratedDates: [...celebrated.celebratedDates, today] });
      setTimeout(() => setFire(false), 1200);
    }
    wasBelow.current = !isAtOrAbove;
  }, [stepsToday, settings.goal, celebrated, setCelebrated, today]);

  const [custom, setCustom] = useState('');

  const onAdd = (n: number) => {
    addSteps(today, n);
    vibrate(10);
  };

  const onAddCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isFinite(n) || n === 0) return;
    addSteps(today, n);
    setCustom('');
    vibrate(10);
  };

  const onClearToday = () => setSteps(today, 0);

  return (
    <div className="px-5 pt-8 flex flex-col items-center gap-6">
      <CelebrationBurst fire={fire} />

      <StreakChip dayOfChallenge={streak.dayOfChallenge} streak={streak.current} />

      <ProgressRing steps={stepsToday} goal={settings.goal} />

      <motion.p
        key={message.text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base font-medium opacity-80 text-center"
      >
        {message.text}
      </motion.p>

      <div className="w-full">
        <QuickAddRow onAdd={onAdd} />
      </div>

      <div className="w-full flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom amount"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 rounded-2xl bg-white/70 dark:bg-ink-900/60 backdrop-blur px-4 py-3 outline-none focus:ring-2 focus:ring-mint-300"
        />
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onAddCustom}
          className="rounded-2xl bg-mint-400 text-white px-5 py-3 font-semibold shadow"
        >
          Add
        </motion.button>
      </div>

      <button
        onClick={onClearToday}
        className="text-xs opacity-50 underline-offset-2 hover:underline"
      >
        Clear today
      </button>
    </div>
  );
}

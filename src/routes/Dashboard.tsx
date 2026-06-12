import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '../components/Header';
import { ProgressRing } from '../components/ProgressRing';
import { QuickAddRow } from '../components/QuickAddRow';
import { EncouragementCard } from '../components/EncouragementCard';
import { StatTiles } from '../components/StatTiles';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { addDays, todayISO } from '../lib/dates';
import { pickEncouragement } from '../lib/messages';

const HEADLINES: Record<string, string> = {
  early: "Let's get moving",
  mid:   "Keep it up!",
  late:  "Almost there!",
  done:  "Goal smashed!",
};

export default function Dashboard() {
  const today = todayISO();
  const { entries, addSteps } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(today);
  const { vibrate } = useHaptics();

  const stepsToday = entries[today] ?? 0;
  const progress = stepsToday / settings.goal;

  const message = useMemo(() => pickEncouragement(progress, today), [progress, today]);
  const headline = HEADLINES[message.band];

  const activeMinutes = Math.round(stepsToday / 100);
  const weekGoal = settings.goal * 7;
  const weekSteps = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += entries[addDays(today, -i)] ?? 0;
    return sum;
  }, [entries, today]);

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

  const onAdd = (n: number) => {
    addSteps(today, n);
    vibrate(10);
  };

  return (
    <div className="pb-6">
      <Header />
      <CelebrationBurst fire={fire} />

      <div className="flex justify-center pt-4 pb-6">
        <ProgressRing steps={stepsToday} goal={settings.goal} streak={streak.current} />
      </div>

      <div className="px-5 space-y-5">
        <QuickAddRow onAdd={onAdd} />

        <EncouragementCard steps={stepsToday} goal={settings.goal} headline={headline} />

        <StatTiles
          activeMinutes={activeMinutes}
          weekSteps={weekSteps}
          weekGoal={weekGoal}
        />
      </div>
    </div>
  );
}

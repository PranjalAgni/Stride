import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useEntries } from './useEntries';
import { useStreak } from './useStreak';
import { badgeStatuses, type BadgeStats, type BadgeStatus } from '../lib/badges';
import { todayISO } from '../lib/dates';

const KEY = 'dailysteps:badges';

type Earned = Record<string, string>;  // badge id -> ISO earned date

export function useBadgeUnlocks() {
  const { entries } = useEntries();
  const streak = useStreak(entries);
  const [earned, setEarned] = useLocalStorage<Earned>(KEY, {});

  const stats: BadgeStats = useMemo(() => {
    const values = Object.values(entries);
    return {
      longestStreak: streak.longest,
      bestDaySteps: values.reduce((a, b) => Math.max(a, b), 0),
      lifetimeSteps: values.reduce((a, b) => a + b, 0),
    };
  }, [entries, streak.longest]);

  const statuses: BadgeStatus[] = useMemo(() => badgeStatuses(stats), [stats]);

  // First-time unlock recording: stamp today's ISO when a badge first crosses its threshold.
  useEffect(() => {
    const today = todayISO();
    const newly: Earned = {};
    for (const s of statuses) {
      if (s.unlocked && !earned[s.def.id]) newly[s.def.id] = today;
    }
    if (Object.keys(newly).length > 0) {
      setEarned(prev => ({ ...prev, ...newly }));
    }
  }, [statuses, earned, setEarned]);

  const unlockedCount = statuses.filter(s => s.unlocked).length;

  return {
    statuses,
    earned,
    unlockedCount,
    totalCount: statuses.length,
    stats,
  };
}

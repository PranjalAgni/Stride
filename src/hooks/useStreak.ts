import { useMemo } from 'react';
import { type Entries } from './useEntries';
import { useSettings } from './useSettings';
import { computeStreak } from '../lib/streak';
import { todayISO } from '../lib/dates';

export function useStreak(entries: Entries, today: string = todayISO()) {
  const { settings } = useSettings();
  return useMemo(() => {
    return computeStreak(
      entries,
      { goal: settings.goal, startDate: settings.startDate },
      today,
    );
  }, [entries, settings.goal, settings.startDate, today]);
}

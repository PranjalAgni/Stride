import { useMemo } from 'react';
import { useEntries } from './useEntries';
import { useSettings } from './useSettings';
import { computeStreak } from '../lib/streak';
import { todayISO } from '../lib/dates';

export function useStreak(today: string = todayISO()) {
  const { entries } = useEntries();
  const { settings } = useSettings();
  return useMemo(
    () => computeStreak(entries, { goal: settings.goal, startDate: settings.startDate }, today),
    [entries, settings.goal, settings.startDate, today],
  );
}

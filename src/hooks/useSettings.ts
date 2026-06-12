import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { todayISO } from '../lib/dates';

export type Settings = {
  goal: number;
  startDate: string;
  theme: 'light' | 'dark' | 'system';
};

const KEY = 'dailysteps:settings';

export function defaultSettings(): Settings {
  return { goal: 7500, startDate: todayISO(), theme: 'dark' };
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(KEY, defaultSettings());
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch })),
    [setSettings],
  );
  return { settings, update };
}

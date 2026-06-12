import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { todayISO } from '../lib/dates';

export type Settings = {
  goal: number;
  startDate: string;
  theme: 'light' | 'dark' | 'system';
  name: string;
  notifications: boolean;
};

const KEY = 'dailysteps:settings';

export function defaultSettings(): Settings {
  return {
    goal: 7500,
    startDate: todayISO(),
    theme: 'dark',
    name: 'Friend',
    notifications: false,
  };
}

export function useSettings() {
  const [stored, setSettings] = useLocalStorage<Partial<Settings>>(KEY, defaultSettings());
  // Merge with defaults so older saved settings without new fields still work.
  const settings: Settings = { ...defaultSettings(), ...stored };
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch })),
    [setSettings],
  );
  return { settings, update };
}

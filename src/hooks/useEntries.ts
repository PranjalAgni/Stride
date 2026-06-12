import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Entries = Record<string, number>;
const KEY = 'dailysteps:entries';

export function useEntries() {
  const [entries, setEntries] = useLocalStorage<Entries>(KEY, {});

  const addSteps = useCallback(
    (iso: string, n: number) => {
      setEntries((prev) => {
        const cur = prev[iso] ?? 0;
        const next = Math.max(0, Math.floor(cur + n));
        return { ...prev, [iso]: next };
      });
    },
    [setEntries],
  );

  const setSteps = useCallback(
    (iso: string, n: number) => {
      setEntries((prev) => ({ ...prev, [iso]: Math.max(0, Math.floor(n)) }));
    },
    [setEntries],
  );

  const clearDay = useCallback(
    (iso: string) => {
      setEntries((prev) => {
        const { [iso]: _omit, ...rest } = prev;
        return rest;
      });
    },
    [setEntries],
  );

  const clearAll = useCallback(() => setEntries({}), [setEntries]);

  return { entries, addSteps, setSteps, clearDay, clearAll };
}

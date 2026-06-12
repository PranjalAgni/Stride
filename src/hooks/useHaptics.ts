import { useCallback } from 'react';

export function useHaptics() {
  const vibrate = useCallback((ms: number = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch { /* ignore */ }
    }
  }, []);
  return { vibrate };
}

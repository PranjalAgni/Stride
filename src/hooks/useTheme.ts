import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && sysDark);
      root.classList.toggle('dark', dark);
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);
}

import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEntries } from './useEntries';
import { useSettings } from './useSettings';
import { useStreak } from './useStreak';

describe('useStreak', () => {
  beforeEach(() => localStorage.clear());

  it('reflects current streak from entries + settings', () => {
    const today = '2026-06-12';
    const { result: settings } = renderHook(() => useSettings());
    act(() => settings.current.update({ goal: 7500, startDate: '2026-06-01' }));

    const { result: entries } = renderHook(() => useEntries());
    act(() => entries.current.setSteps('2026-06-10', 7500));
    act(() => entries.current.setSteps('2026-06-11', 7500));

    const { result: streak } = renderHook(() => useStreak(today));
    expect(streak.current.current).toBe(2);
    expect(streak.current.dayOfChallenge).toBe(12);
  });
});

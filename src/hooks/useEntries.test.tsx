import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEntries } from './useEntries';

describe('useEntries', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useEntries());
    expect(result.current.entries).toEqual({});
  });

  it('addSteps accumulates non-negative integers', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.addSteps('2026-06-12', 1000));
    expect(result.current.entries['2026-06-12']).toBe(1500);
  });

  it('addSteps clamps the day total to >= 0', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.addSteps('2026-06-12', -1000));
    expect(result.current.entries['2026-06-12']).toBe(0);
  });

  it('setSteps overwrites the day', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.setSteps('2026-06-12', 9000));
    expect(result.current.entries['2026-06-12']).toBe(9000);
  });

  it('clearDay removes the entry', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.setSteps('2026-06-12', 9000));
    act(() => result.current.clearDay('2026-06-12'));
    expect(result.current.entries['2026-06-12']).toBeUndefined();
  });

  it('clearAll empties everything', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.setSteps('2026-06-12', 9000));
    act(() => result.current.clearAll());
    expect(result.current.entries).toEqual({});
  });
});

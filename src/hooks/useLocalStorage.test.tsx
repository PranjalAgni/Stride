import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns the initial value when nothing stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', { n: 1 }));
    expect(result.current[0]).toEqual({ n: 1 });
  });

  it('persists writes', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem('k')!)).toBe(42);
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('k', JSON.stringify({ x: 'hi' }));
    const { result } = renderHook(() => useLocalStorage('k', { x: 'default' }));
    expect(result.current[0]).toEqual({ x: 'hi' });
  });

  it('falls back to initial when stored value is corrupt JSON', () => {
    localStorage.setItem('k', '{not json');
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('supports updater function', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1));
    act(() => result.current[1]((prev: number) => prev + 1));
    expect(result.current[0]).toBe(2);
  });
});

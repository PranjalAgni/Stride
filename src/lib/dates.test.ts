import { describe, it, expect } from 'vitest';
import { todayISO, toISO, fromISO, daysBetween, addDays, monthGrid, weekStartingMonday } from './dates';

describe('dates', () => {
  it('todayISO returns YYYY-MM-DD format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('toISO formats a Date as YYYY-MM-DD in local time', () => {
    expect(toISO(new Date(2026, 5, 12))).toBe('2026-06-12');
  });

  it('fromISO parses YYYY-MM-DD as local-midnight Date', () => {
    const d = fromISO('2026-06-12');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(12);
  });

  it('daysBetween counts inclusive day deltas', () => {
    expect(daysBetween('2026-06-12', '2026-06-12')).toBe(0);
    expect(daysBetween('2026-06-12', '2026-06-15')).toBe(3);
    expect(daysBetween('2026-06-15', '2026-06-12')).toBe(-3);
  });

  it('addDays returns ISO strings', () => {
    expect(addDays('2026-06-12', 1)).toBe('2026-06-13');
    expect(addDays('2026-06-12', -2)).toBe('2026-06-10');
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('weekStartingMonday returns 7 ISO strings, Monday-Sunday', () => {
    // 2026-06-12 is a Friday; Monday of that week is 2026-06-08, Sunday 2026-06-14
    const w = weekStartingMonday('2026-06-12');
    expect(w).toEqual([
      '2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14',
    ]);
  });

  it('weekStartingMonday on a Monday returns same date as first', () => {
    const w = weekStartingMonday('2026-06-08'); // Monday
    expect(w[0]).toBe('2026-06-08');
    expect(w).toHaveLength(7);
  });

  it('monthGrid returns 6 weeks x 7 days for a month, with iso + inMonth', () => {
    const grid = monthGrid(2026, 5); // June 2026
    expect(grid).toHaveLength(42);
    const allInJune = grid.filter(c => c.inMonth);
    expect(allInJune).toHaveLength(30);
    expect(grid[0].iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

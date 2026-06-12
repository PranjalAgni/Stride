import { describe, it, expect } from 'vitest';
import { computeStreak } from './streak';

describe('computeStreak', () => {
  const goal = 7500;
  const startDate = '2026-06-01';

  it('returns 0 when no entries exist', () => {
    expect(computeStreak({}, { goal, startDate }, '2026-06-12').current).toBe(0);
  });

  it('counts consecutive days at or above goal ending yesterday when today not yet hit', () => {
    const entries = {
      '2026-06-09': 7500,
      '2026-06-10': 8000,
      '2026-06-11': 7501,
      '2026-06-12': 1000,
    };
    expect(computeStreak(entries, { goal, startDate }, '2026-06-12').current).toBe(3);
  });

  it('includes today when today is already at goal', () => {
    const entries = {
      '2026-06-10': 7500,
      '2026-06-11': 7500,
      '2026-06-12': 7500,
    };
    expect(computeStreak(entries, { goal, startDate }, '2026-06-12').current).toBe(3);
  });

  it('breaks the streak when a past day is below goal', () => {
    const entries = {
      '2026-06-10': 7500,
      '2026-06-11': 100,
      '2026-06-12': 8000,
    };
    expect(computeStreak(entries, { goal, startDate }, '2026-06-12').current).toBe(1);
  });

  it('does not count days before startDate', () => {
    const entries = {
      '2026-05-30': 9000,
      '2026-05-31': 9000,
      '2026-06-01': 7500,
      '2026-06-02': 7500,
    };
    expect(computeStreak(entries, { goal, startDate: '2026-06-01' }, '2026-06-02').current).toBe(2);
  });

  it('computes longest streak across history', () => {
    const entries = {
      '2026-06-01': 7500,
      '2026-06-02': 7500,
      '2026-06-03': 7500,
      '2026-06-04': 100,
      '2026-06-05': 7500,
      '2026-06-06': 7500,
    };
    expect(computeStreak(entries, { goal, startDate: '2026-06-01' }, '2026-06-06').longest).toBe(3);
  });

  it('computes day-of-challenge', () => {
    expect(
      computeStreak({}, { goal, startDate: '2026-06-01' }, '2026-06-12').dayOfChallenge,
    ).toBe(12);
  });
});

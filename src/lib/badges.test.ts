import { describe, it, expect } from 'vitest';
import { BADGE_DEFS, badgeStatuses, computeUnlocks, progressLabel } from './badges';

describe('BADGE_DEFS', () => {
  it('contains streak, best-day, and lifetime kinds', () => {
    const kinds = new Set(BADGE_DEFS.map(b => b.kind));
    expect(kinds.has('streak')).toBe(true);
    expect(kinds.has('best-day')).toBe(true);
    expect(kinds.has('lifetime')).toBe(true);
  });

  it('every badge has a unique id', () => {
    const ids = BADGE_DEFS.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('computeUnlocks (streak only, back-compat)', () => {
  it('returns ids of streak badges whose threshold <= longestStreak', () => {
    expect(computeUnlocks(0)).toEqual([]);
    expect(computeUnlocks(3)).toEqual(['streak-3']);
    expect(computeUnlocks(15)).toEqual(['streak-3', 'streak-7', 'streak-14']);
    expect(computeUnlocks(200)).toEqual([
      'streak-3', 'streak-7', 'streak-14', 'streak-30', 'streak-60', 'streak-100',
    ]);
  });
});

describe('badgeStatuses', () => {
  it('marks unlocked when current >= threshold', () => {
    const stats = { longestStreak: 14, bestDaySteps: 10500, lifetimeSteps: 250_000 };
    const byId = Object.fromEntries(badgeStatuses(stats).map(s => [s.def.id, s]));
    expect(byId['streak-7'].unlocked).toBe(true);
    expect(byId['streak-14'].unlocked).toBe(true);
    expect(byId['streak-30'].unlocked).toBe(false);
    expect(byId['best-10k'].unlocked).toBe(true);
    expect(byId['best-15k'].unlocked).toBe(false);
    expect(byId['total-100k'].unlocked).toBe(true);
    expect(byId['total-500k'].unlocked).toBe(false);
  });

  it('exposes current value capped sensibly toward threshold display', () => {
    const stats = { longestStreak: 5, bestDaySteps: 0, lifetimeSteps: 0 };
    const byId = Object.fromEntries(badgeStatuses(stats).map(s => [s.def.id, s]));
    expect(byId['streak-7'].current).toBe(5);
  });
});

describe('progressLabel', () => {
  it('formats streak as "current/threshold DAYS"', () => {
    const def = BADGE_DEFS.find(b => b.id === 'streak-30')!;
    expect(progressLabel(def, 10)).toBe('10/30 DAYS');
  });

  it('caps current at threshold', () => {
    const def = BADGE_DEFS.find(b => b.id === 'streak-7')!;
    expect(progressLabel(def, 9999)).toBe('7/7 DAYS');
  });

  it('formats lifetime totals with commas', () => {
    const def = BADGE_DEFS.find(b => b.id === 'total-100k')!;
    expect(progressLabel(def, 85_210)).toBe('85,210 / 100,000');
  });
});

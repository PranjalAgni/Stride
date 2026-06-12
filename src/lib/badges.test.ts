import { describe, it, expect } from 'vitest';
import { BADGE_DEFS, computeUnlocks } from './badges';

describe('badges', () => {
  it('defines milestone badges in ascending order', () => {
    const ds = BADGE_DEFS.map(b => b.streakDays);
    expect(ds).toEqual([3, 7, 14, 30, 60, 100]);
  });

  it('unlocks all badges with streak <= currentStreak', () => {
    expect(computeUnlocks(0)).toEqual([]);
    expect(computeUnlocks(3)).toEqual(['streak-3']);
    expect(computeUnlocks(15)).toEqual(['streak-3','streak-7','streak-14']);
    expect(computeUnlocks(200)).toEqual(['streak-3','streak-7','streak-14','streak-30','streak-60','streak-100']);
  });
});

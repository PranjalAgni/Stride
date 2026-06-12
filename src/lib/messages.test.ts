import { describe, it, expect } from 'vitest';
import { pickEncouragement } from './messages';

describe('pickEncouragement', () => {
  it('uses early band below 25%', () => {
    expect(pickEncouragement(0).band).toBe('early');
    expect(pickEncouragement(0.24).band).toBe('early');
  });
  it('uses mid band 25-75%', () => {
    expect(pickEncouragement(0.25).band).toBe('mid');
    expect(pickEncouragement(0.74).band).toBe('mid');
  });
  it('uses late band 75-99%', () => {
    expect(pickEncouragement(0.75).band).toBe('late');
    expect(pickEncouragement(0.99).band).toBe('late');
  });
  it('uses done band at >=100%', () => {
    expect(pickEncouragement(1).band).toBe('done');
    expect(pickEncouragement(1.5).band).toBe('done');
  });
  it('returns a non-empty message', () => {
    expect(pickEncouragement(0.5).text.length).toBeGreaterThan(0);
  });
  it('is deterministic per (band, dateSeed)', () => {
    const a = pickEncouragement(0.5, '2026-06-12');
    const b = pickEncouragement(0.5, '2026-06-12');
    expect(a.text).toBe(b.text);
  });
});

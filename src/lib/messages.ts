export type Band = 'early' | 'mid' | 'late' | 'done';

const POOL: Record<Band, string[]> = {
  early: [
    "Let's get moving.",
    "Lace up — first steps matter.",
    "A short walk would feel great right now.",
  ],
  mid: [
    "Halfway there!",
    "You're crushing it.",
    "Momentum is yours.",
  ],
  late: [
    "Almost there — one more walk!",
    "So close. You've got this.",
    "Push through — final stretch!",
  ],
  done: [
    "Goal hit. You're a legend.",
    "Crushed it. Take a bow.",
    "Day complete. Beautiful work.",
  ],
};

function bandFor(progress: number): Band {
  if (progress >= 1) return 'done';
  if (progress >= 0.75) return 'late';
  if (progress >= 0.25) return 'mid';
  return 'early';
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickEncouragement(progress: number, seed = ''): { band: Band; text: string } {
  const band = bandFor(progress);
  const pool = POOL[band];
  const idx = hash(`${band}:${seed}`) % pool.length;
  return { band, text: pool[idx] };
}

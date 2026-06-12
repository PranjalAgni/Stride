export type BadgeKind = 'streak' | 'best-day' | 'lifetime';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type BadgeDef = {
  id: string;
  kind: BadgeKind;
  tier: BadgeTier;
  threshold: number;     // streak days, single-day steps, or lifetime steps
  label: string;
  description: string;
  emoji: string;
};

export const BADGE_DEFS: BadgeDef[] = [
  // streak
  { id: 'streak-3',   kind: 'streak', tier: 'bronze',   threshold: 3,   label: '3-Day Streak',   description: 'Logged your goal 3 days in a row.', emoji: '🌱' },
  { id: 'streak-7',   kind: 'streak', tier: 'silver',   threshold: 7,   label: '7-Day Streak',   description: 'Hit your goal every day for a week.', emoji: '🌿' },
  { id: 'streak-14',  kind: 'streak', tier: 'silver',   threshold: 14,  label: '2-Week Streak',  description: 'Two solid weeks of hitting goal.', emoji: '🍀' },
  { id: 'streak-30',  kind: 'streak', tier: 'gold',     threshold: 30,  label: '30-Day Streak',  description: 'A full month of consistency.', emoji: '🌳' },
  { id: 'streak-60',  kind: 'streak', tier: 'gold',     threshold: 60,  label: '60-Day Streak',  description: 'Two months running. Elite.', emoji: '🏔️' },
  { id: 'streak-100', kind: 'streak', tier: 'platinum', threshold: 100, label: 'Centurion',      description: '100 days. Legendary commitment.', emoji: '🏆' },

  // single-day milestones
  { id: 'best-10k',   kind: 'best-day', tier: 'gold',     threshold: 10000, label: 'First 10k Day', description: 'Walked 10,000 steps in a single day.', emoji: '⭐' },
  { id: 'best-15k',   kind: 'best-day', tier: 'platinum', threshold: 15000, label: 'Big Day',       description: 'Walked 15,000 steps in a single day.', emoji: '💎' },

  // lifetime totals
  { id: 'total-100k', kind: 'lifetime', tier: 'silver',   threshold: 100_000,   label: 'Century Club',  description: 'Reached 100,000 total steps tracked.', emoji: '🎯' },
  { id: 'total-500k', kind: 'lifetime', tier: 'gold',     threshold: 500_000,   label: 'Half-Million',  description: 'Reached 500,000 total steps tracked.', emoji: '🚀' },
  { id: 'total-1m',   kind: 'lifetime', tier: 'platinum', threshold: 1_000_000, label: 'One in a Million', description: '1,000,000 total steps. Take a bow.', emoji: '👑' },
];

export type BadgeStats = {
  longestStreak: number;
  bestDaySteps: number;
  lifetimeSteps: number;
};

export type BadgeStatus = {
  def: BadgeDef;
  unlocked: boolean;
  current: number;     // current value (toward threshold)
};

export function badgeStatuses(stats: BadgeStats): BadgeStatus[] {
  return BADGE_DEFS.map(def => {
    const current = currentForKind(def.kind, stats);
    return { def, unlocked: current >= def.threshold, current };
  });
}

function currentForKind(kind: BadgeKind, stats: BadgeStats): number {
  switch (kind) {
    case 'streak':   return stats.longestStreak;
    case 'best-day': return stats.bestDaySteps;
    case 'lifetime': return stats.lifetimeSteps;
  }
}

export function computeUnlocks(longestStreak: number): string[] {
  return BADGE_DEFS
    .filter(b => b.kind === 'streak' && longestStreak >= b.threshold)
    .map(b => b.id);
}

export function progressLabel(def: BadgeDef, current: number): string {
  const cap = Math.min(current, def.threshold);
  switch (def.kind) {
    case 'streak':   return `${cap}/${def.threshold} DAYS`;
    case 'best-day': return `${cap.toLocaleString()} / ${def.threshold.toLocaleString()}`;
    case 'lifetime': return `${cap.toLocaleString()} / ${def.threshold.toLocaleString()}`;
  }
}

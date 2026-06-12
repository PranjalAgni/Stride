export type BadgeDef = {
  id: string;
  streakDays: number;
  label: string;
  emoji: string;
};

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'streak-3',   streakDays: 3,   label: '3 day streak',   emoji: '🌱' },
  { id: 'streak-7',   streakDays: 7,   label: 'One week',       emoji: '🌿' },
  { id: 'streak-14',  streakDays: 14,  label: 'Two weeks',      emoji: '🍀' },
  { id: 'streak-30',  streakDays: 30,  label: '30 days',        emoji: '🌳' },
  { id: 'streak-60',  streakDays: 60,  label: '60 days',        emoji: '🏔️' },
  { id: 'streak-100', streakDays: 100, label: 'Centurion',      emoji: '🏆' },
];

export function computeUnlocks(currentStreak: number): string[] {
  return BADGE_DEFS.filter(b => currentStreak >= b.streakDays).map(b => b.id);
}

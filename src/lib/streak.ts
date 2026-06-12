import { addDays, daysBetween } from './dates';

export type Entries = Record<string, number>;
export type StreakInputs = { goal: number; startDate: string };
export type StreakResult = { current: number; longest: number; dayOfChallenge: number };

export function computeStreak(
  entries: Entries,
  { goal, startDate }: StreakInputs,
  today: string,
): StreakResult {
  const dayOfChallenge = Math.max(0, daysBetween(startDate, today)) + 1;

  let cursor = (entries[today] ?? 0) >= goal ? today : addDays(today, -1);
  let current = 0;
  while (daysBetween(startDate, cursor) >= 0 && (entries[cursor] ?? 0) >= goal) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  for (let d = startDate; daysBetween(d, today) >= 0; d = addDays(d, 1)) {
    if ((entries[d] ?? 0) >= goal) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }

  return { current, longest, dayOfChallenge };
}

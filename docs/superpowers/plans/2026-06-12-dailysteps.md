# DailySteps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first React PWA that lets a user log daily steps against a configurable goal (default 7,500), tracks a strict streak, and motivates them with ring progress, confetti, badges, and tuned messages — fully client-side.

**Architecture:** Vite + React 18 + TypeScript SPA. Four routes inside a phone-shaped shell with a persistent bottom tab bar. State is `localStorage`-backed via small typed hooks; derived values (streak, aggregates) are computed on read. Animations via Framer Motion springs. PWA via `vite-plugin-pwa`.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, react-router-dom, date-fns, canvas-confetti, recharts, lucide-react, vite-plugin-pwa, vitest + @testing-library/react.

---

## Conventions

- **TDD throughout** for `lib/` (pure functions) and `hooks/`. UI components are smoke-tested (renders + key interaction); we don't snapshot every animation.
- **Frequent commits** — one per task minimum.
- All paths relative to project root: `/Users/pranjal.agnihotri/coding/React/dailysteps`.
- All test files use vitest + `@testing-library/react`.
- Date strings everywhere are ISO-8601 `YYYY-MM-DD` in **local time** (not UTC). The streak rule is local-time-based.

---

## Task 1: Scaffold Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `.gitignore`

- [ ] **Step 1: Init Vite project in current dir**

Run from project root:

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty…", choose **"Ignore files and continue"**. Vite will scaffold alongside the existing `docs/` and `.git/`.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom framer-motion date-fns canvas-confetti recharts lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa workbox-window vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/canvas-confetti
```

- [ ] **Step 3: Verify the dev server runs**

```bash
npm run dev
```

Expected: server starts, Vite prints a localhost URL. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

---

## Task 2: Configure Tailwind with pastel palette

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`
- Modify: `src/styles/index.css` (replace defaults)
- Modify: `src/main.tsx` (import `./styles/index.css` instead of `./index.css`)
- Delete: `src/App.css`, `src/index.css` (Vite defaults)

- [ ] **Step 1: Create Tailwind config**

Create `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mint:     { 50:'#ecfdf5', 100:'#d1fae5', 200:'#a7f3d0', 300:'#6ee7b7', 400:'#34d399', 500:'#10b981' },
        peach:    { 50:'#fff7ed', 100:'#ffedd5', 200:'#fed7aa', 300:'#fdba74', 400:'#fb923c', 500:'#f97316' },
        lavender: { 50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6' },
        sky2:     { 50:'#f0f9ff', 100:'#e0f2fe', 200:'#bae6fd', 300:'#7dd3fc', 400:'#38bdf8', 500:'#0ea5e9' },
        ink:      { 50:'#f8fafc', 900:'#0f172a', 950:'#020617' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Create PostCSS config**

Create `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Replace global stylesheet**

Create `src/styles/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    height: 100%;
  }
  body {
    @apply bg-gradient-to-b from-mint-50 via-lavender-50 to-peach-50 text-ink-900;
    @apply dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 dark:text-ink-50;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior-y: contain;
  }
}
```

Delete the default `src/App.css` and `src/index.css`.

Update `src/main.tsx` to import the new path:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Replace `src/App.tsx` with a placeholder that proves Tailwind works:

```tsx
export default function App() {
  return (
    <main className="min-h-full flex items-center justify-center">
      <div className="rounded-4xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">DailySteps</h1>
        <p className="text-sm opacity-70">Tailwind is wired up.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify in dev server**

```bash
npm run dev
```

Visit the URL — gradient background and rounded card visible. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure Tailwind with pastel palette"
```

---

## Task 3: Configure Vitest

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (add test script)
- Modify: `tsconfig.json` (add vitest types)

- [ ] **Step 1: Update `vite.config.ts`**

Replace contents of `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

- [ ] **Step 2: Create test setup**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 3: Add test script to `package.json`**

In the `"scripts"` block of `package.json`, add:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Add vitest globals to tsconfig**

In `tsconfig.json`, in `compilerOptions.types`, add `"vitest/globals"`. If `types` doesn't exist, add:

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

Also include the test setup file by ensuring `src` is in `include`.

- [ ] **Step 5: Sanity-check by writing a trivial test**

Create `src/test/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm run test:run`
Expected: 1 passed.

Delete `src/test/sanity.test.ts` after green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure vitest with jsdom + RTL"
```

---

## Task 4: Date utilities (`lib/dates.ts`)

**Files:**
- Create: `src/lib/dates.ts`
- Test: `src/lib/dates.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/dates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { todayISO, toISO, fromISO, daysBetween, addDays, monthGrid } from './dates';

describe('dates', () => {
  it('todayISO returns YYYY-MM-DD format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('toISO formats a Date as YYYY-MM-DD in local time', () => {
    expect(toISO(new Date(2026, 5, 12))).toBe('2026-06-12'); // month is 0-indexed
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

  it('monthGrid returns 6 weeks x 7 days for a month, with iso + inMonth', () => {
    const grid = monthGrid(2026, 5); // June 2026
    expect(grid).toHaveLength(42);
    const allInJune = grid.filter(c => c.inMonth);
    expect(allInJune).toHaveLength(30);
    expect(grid[0].iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `npm run test:run`
Expected: 6 failures referencing missing module `./dates`.

- [ ] **Step 3: Implement `lib/dates.ts`**

Create `src/lib/dates.ts`:

```ts
import { format, parse, differenceInCalendarDays, addDays as dfAddDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fromISO(iso: string): Date {
  return parse(iso, 'yyyy-MM-dd', new Date());
}

export function daysBetween(fromIso: string, toIso: string): number {
  return differenceInCalendarDays(fromISO(toIso), fromISO(fromIso));
}

export function addDays(iso: string, n: number): string {
  return toISO(dfAddDays(fromISO(iso), n));
}

export type MonthCell = { iso: string; inMonth: boolean };

export function monthGrid(year: number, monthIndex0: number): MonthCell[] {
  const first = new Date(year, monthIndex0, 1);
  const start = startOfWeek(startOfMonth(first), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(first), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  // Pad/trim to exactly 42 cells (6 weeks)
  const cells = days.slice(0, 42);
  while (cells.length < 42) cells.push(dfAddDays(cells[cells.length - 1], 1));
  return cells.map(d => ({ iso: toISO(d), inMonth: d.getMonth() === monthIndex0 }));
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test:run`
Expected: all 6 pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add date utilities with tests"
```

---

## Task 5: Streak computation (`lib/streak.ts`)

**Files:**
- Create: `src/lib/streak.ts`
- Test: `src/lib/streak.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/streak.test.ts`:

```ts
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
      '2026-06-12': 1000, // today, below goal — does not break, just not counted
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
      '2026-06-11': 100,    // BREAK
      '2026-06-12': 8000,
    };
    expect(computeStreak(entries, { goal, startDate }, '2026-06-12').current).toBe(1);
  });

  it('does not count days before startDate', () => {
    const entries = {
      '2026-05-30': 9000,   // before startDate
      '2026-05-31': 9000,   // before startDate
      '2026-06-01': 7500,
      '2026-06-02': 7500,
    };
    expect(computeStreak(entries, { goal, startDate: '2026-06-01' }, '2026-06-02').current).toBe(2);
  });

  it('computes longest streak across history', () => {
    const entries = {
      '2026-06-01': 7500,
      '2026-06-02': 7500,
      '2026-06-03': 7500, // 3-day run
      '2026-06-04': 100,
      '2026-06-05': 7500,
      '2026-06-06': 7500, // 2-day run
    };
    expect(computeStreak(entries, { goal, startDate: '2026-06-01' }, '2026-06-06').longest).toBe(3);
  });

  it('computes day-of-challenge', () => {
    expect(
      computeStreak({}, { goal, startDate: '2026-06-01' }, '2026-06-12').dayOfChallenge,
    ).toBe(12);
  });
});
```

- [ ] **Step 2: Run tests, confirm fail**

Run: `npm run test:run`
Expected: failures referencing `./streak`.

- [ ] **Step 3: Implement `lib/streak.ts`**

Create `src/lib/streak.ts`:

```ts
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

  // Current streak: walk backward from today (or yesterday if today < goal),
  // count consecutive days >= goal, stopping at startDate.
  let cursor = (entries[today] ?? 0) >= goal ? today : addDays(today, -1);
  let current = 0;
  while (daysBetween(startDate, cursor) >= 0 && (entries[cursor] ?? 0) >= goal) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  // Longest streak: walk forward from startDate to today, tracking max run.
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
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test:run`
Expected: all streak tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add streak computation with tests"
```

---

## Task 6: Encouraging messages (`lib/messages.ts`)

**Files:**
- Create: `src/lib/messages.ts`
- Test: `src/lib/messages.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/messages.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 3: Implement `lib/messages.ts`**

Create `src/lib/messages.ts`:

```ts
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
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm run test:run`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add tuned encouraging messages"
```

---

## Task 7: Badge definitions (`lib/badges.ts`)

**Files:**
- Create: `src/lib/badges.ts`
- Test: `src/lib/badges.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/badges.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 3: Implement `lib/badges.ts`**

Create `src/lib/badges.ts`:

```ts
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
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm run test:run`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add milestone badge definitions"
```

---

## Task 8: `useLocalStorage` hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Test: `src/hooks/useLocalStorage.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useLocalStorage.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useLocalStorage.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(key: string, initial: T): [T, Setter<T>] {
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  }, [key, initial]);

  const [value, setValue] = useState<T>(read);

  const set: Setter<T> = useCallback(
    (next) => {
      setValue(prev => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full or unavailable — keep in-memory value anyway
        }
        return resolved;
      });
    },
    [key],
  );

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, read]);

  return [value, set];
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm run test:run`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(hooks): add useLocalStorage with cross-tab sync"
```

---

## Task 9: Domain hooks `useSettings`, `useEntries`, `useStreak`, `useTheme`, `useHaptics`

**Files:**
- Create: `src/hooks/useSettings.ts`
- Create: `src/hooks/useEntries.ts`
- Create: `src/hooks/useStreak.ts`
- Create: `src/hooks/useTheme.ts`
- Create: `src/hooks/useHaptics.ts`
- Test: `src/hooks/useEntries.test.tsx`
- Test: `src/hooks/useStreak.test.tsx`

- [ ] **Step 1: Write tests for useEntries**

Create `src/hooks/useEntries.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEntries } from './useEntries';

describe('useEntries', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useEntries());
    expect(result.current.entries).toEqual({});
  });

  it('addSteps accumulates non-negative integers', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.addSteps('2026-06-12', 1000));
    expect(result.current.entries['2026-06-12']).toBe(1500);
  });

  it('addSteps clamps the day total to >= 0', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.addSteps('2026-06-12', -1000));
    expect(result.current.entries['2026-06-12']).toBe(0);
  });

  it('setSteps overwrites the day', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.addSteps('2026-06-12', 500));
    act(() => result.current.setSteps('2026-06-12', 9000));
    expect(result.current.entries['2026-06-12']).toBe(9000);
  });

  it('clearDay removes the entry', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.setSteps('2026-06-12', 9000));
    act(() => result.current.clearDay('2026-06-12'));
    expect(result.current.entries['2026-06-12']).toBeUndefined();
  });

  it('clearAll empties everything', () => {
    const { result } = renderHook(() => useEntries());
    act(() => result.current.setSteps('2026-06-12', 9000));
    act(() => result.current.clearAll());
    expect(result.current.entries).toEqual({});
  });
});
```

- [ ] **Step 2: Write tests for useStreak**

Create `src/hooks/useStreak.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEntries } from './useEntries';
import { useSettings } from './useSettings';
import { useStreak } from './useStreak';

describe('useStreak', () => {
  beforeEach(() => localStorage.clear());

  it('reflects current streak from entries + settings', () => {
    const today = '2026-06-12';
    const { result: settings } = renderHook(() => useSettings());
    act(() => settings.current.update({ goal: 7500, startDate: '2026-06-01' }));

    const { result: entries } = renderHook(() => useEntries());
    act(() => entries.current.setSteps('2026-06-10', 7500));
    act(() => entries.current.setSteps('2026-06-11', 7500));

    const { result: streak } = renderHook(() => useStreak(today));
    expect(streak.current.current).toBe(2);
    expect(streak.current.dayOfChallenge).toBe(12);
  });
});
```

- [ ] **Step 3: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 4: Implement `useSettings`**

Create `src/hooks/useSettings.ts`:

```ts
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { todayISO } from '../lib/dates';

export type Settings = {
  goal: number;
  startDate: string;
  theme: 'light' | 'dark' | 'system';
};

const KEY = 'dailysteps:settings';

export function defaultSettings(): Settings {
  return { goal: 7500, startDate: todayISO(), theme: 'system' };
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(KEY, defaultSettings());
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch })),
    [setSettings],
  );
  return { settings, update };
}
```

- [ ] **Step 5: Implement `useEntries`**

Create `src/hooks/useEntries.ts`:

```ts
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Entries = Record<string, number>;
const KEY = 'dailysteps:entries';

export function useEntries() {
  const [entries, setEntries] = useLocalStorage<Entries>(KEY, {});

  const addSteps = useCallback((iso: string, n: number) => {
    setEntries(prev => {
      const cur = prev[iso] ?? 0;
      const next = Math.max(0, Math.floor(cur + n));
      return { ...prev, [iso]: next };
    });
  }, [setEntries]);

  const setSteps = useCallback((iso: string, n: number) => {
    setEntries(prev => ({ ...prev, [iso]: Math.max(0, Math.floor(n)) }));
  }, [setEntries]);

  const clearDay = useCallback((iso: string) => {
    setEntries(prev => {
      const { [iso]: _, ...rest } = prev;
      return rest;
    });
  }, [setEntries]);

  const clearAll = useCallback(() => setEntries({}), [setEntries]);

  return { entries, addSteps, setSteps, clearDay, clearAll };
}
```

- [ ] **Step 6: Implement `useStreak`**

Create `src/hooks/useStreak.ts`:

```ts
import { useMemo } from 'react';
import { useEntries } from './useEntries';
import { useSettings } from './useSettings';
import { computeStreak } from '../lib/streak';
import { todayISO } from '../lib/dates';

export function useStreak(today: string = todayISO()) {
  const { entries } = useEntries();
  const { settings } = useSettings();
  return useMemo(
    () => computeStreak(entries, { goal: settings.goal, startDate: settings.startDate }, today),
    [entries, settings.goal, settings.startDate, today],
  );
}
```

- [ ] **Step 7: Implement `useTheme`**

Create `src/hooks/useTheme.ts`:

```ts
import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && sysDark);
      root.classList.toggle('dark', dark);
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);
}
```

- [ ] **Step 8: Implement `useHaptics`**

Create `src/hooks/useHaptics.ts`:

```ts
import { useCallback } from 'react';

export function useHaptics() {
  const vibrate = useCallback((ms: number = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch { /* ignore */ }
    }
  }, []);
  return { vibrate };
}
```

- [ ] **Step 9: Run all tests, confirm pass**

Run: `npm run test:run`
Expected: every test passes.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(hooks): add domain hooks (settings/entries/streak/theme/haptics)"
```

---

## Task 10: `ProgressRing` component

**Files:**
- Create: `src/components/ProgressRing.tsx`
- Test: `src/components/ProgressRing.test.tsx`

- [ ] **Step 1: Write a smoke test**

Create `src/components/ProgressRing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders the steps and goal text', () => {
    render(<ProgressRing steps={3000} goal={7500} />);
    expect(screen.getByText('3,000')).toBeInTheDocument();
    expect(screen.getByText(/7,500/)).toBeInTheDocument();
  });

  it('renders an SVG circle', () => {
    const { container } = render(<ProgressRing steps={3000} goal={7500} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 3: Implement the ring**

Create `src/components/ProgressRing.tsx`:

```tsx
import { motion } from 'framer-motion';

type Props = {
  steps: number;
  goal: number;
  size?: number;     // px
  stroke?: number;   // px
};

const fmt = (n: number) => n.toLocaleString();

export function ProgressRing({ steps, goal, size = 260, stroke = 22 }: Props) {
  const pct = Math.min(1, Math.max(0, steps / goal));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const hit = pct >= 1;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="currentColor" strokeOpacity="0.12" fill="none" strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={hit ? '#f59e0b' : 'url(#ring-grad)'}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <div className="text-5xl font-bold tabular-nums">{fmt(steps)}</div>
        <div className="text-sm opacity-70 mt-1">of {fmt(goal)} steps</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm run test:run`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): add animated ProgressRing"
```

---

## Task 11: `StreakChip` and `QuickAddRow`

**Files:**
- Create: `src/components/StreakChip.tsx`
- Create: `src/components/QuickAddRow.tsx`
- Test: `src/components/QuickAddRow.test.tsx`

- [ ] **Step 1: Write QuickAddRow tests**

Create `src/components/QuickAddRow.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickAddRow } from './QuickAddRow';

describe('QuickAddRow', () => {
  it('renders the four presets', () => {
    render(<QuickAddRow onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: '+100' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+500' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+1,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+2,000' })).toBeInTheDocument();
  });

  it('calls onAdd with the correct value when tapped', async () => {
    const onAdd = vi.fn();
    render(<QuickAddRow onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: '+500' }));
    expect(onAdd).toHaveBeenCalledWith(500);
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm run test:run`

- [ ] **Step 3: Implement `StreakChip`**

Create `src/components/StreakChip.tsx`:

```tsx
import { motion } from 'framer-motion';

type Props = { dayOfChallenge: number; streak: number };

export function StreakChip({ dayOfChallenge, streak }: Props) {
  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-ink-900/60 backdrop-blur px-4 py-2 shadow-sm"
    >
      <span className="text-sm font-medium opacity-80">Day {dayOfChallenge}</span>
      <span className="opacity-40">·</span>
      <span className="text-sm font-semibold">🔥 {streak} day streak</span>
    </motion.div>
  );
}
```

- [ ] **Step 4: Implement `QuickAddRow`**

Create `src/components/QuickAddRow.tsx`:

```tsx
import { motion } from 'framer-motion';

const PRESETS = [100, 500, 1000, 2000] as const;

type Props = { onAdd: (n: number) => void };

const fmt = (n: number) => n.toLocaleString();

export function QuickAddRow({ onAdd }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESETS.map(n => (
        <motion.button
          key={n}
          whileTap={{ scale: 0.94 }}
          onClick={() => onAdd(n)}
          className="rounded-2xl bg-white/70 dark:bg-ink-900/60 backdrop-blur py-3 font-semibold shadow-sm hover:shadow active:shadow-inner"
        >
          +{fmt(n)}
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run, confirm pass**

Run: `npm run test:run`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): add StreakChip and QuickAddRow"
```

---

## Task 12: `BottomTabs` navigation

**Files:**
- Create: `src/components/BottomTabs.tsx`

- [ ] **Step 1: Implement the tab bar**

Create `src/components/BottomTabs.tsx`:

```tsx
import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { to: '/',         label: 'Today',    Icon: Home },
  { to: '/history',  label: 'History',  Icon: CalendarDays },
  { to: '/stats',    label: 'Stats',    Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="rounded-3xl bg-white/80 dark:bg-ink-900/70 backdrop-blur shadow-lg flex">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-mint-500' : 'opacity-60'
                }`
              }
            >
              <Icon className="size-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(ui): add BottomTabs nav"
```

---

## Task 13: App shell with router and theme

**Files:**
- Modify: `src/App.tsx`
- Create: `src/routes/Today.tsx` (placeholder)
- Create: `src/routes/History.tsx` (placeholder)
- Create: `src/routes/Stats.tsx` (placeholder)
- Create: `src/routes/Settings.tsx` (placeholder)

- [ ] **Step 1: Create placeholder routes**

Each route file is identical pattern. Create them all:

`src/routes/Today.tsx`:
```tsx
export default function Today() { return <div className="p-6">Today</div>; }
```

`src/routes/History.tsx`:
```tsx
export default function History() { return <div className="p-6">History</div>; }
```

`src/routes/Stats.tsx`:
```tsx
export default function Stats() { return <div className="p-6">Stats</div>; }
```

`src/routes/Settings.tsx`:
```tsx
export default function Settings() { return <div className="p-6">Settings</div>; }
```

- [ ] **Step 2: Wire the App shell**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Today from './routes/Today';
import History from './routes/History';
import Stats from './routes/Stats';
import Settings from './routes/Settings';
import { BottomTabs } from './components/BottomTabs';
import { useTheme } from './hooks/useTheme';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Shell() {
  useTheme();
  return (
    <div className="min-h-full mx-auto max-w-md pb-24">
      <AnimatedRoutes />
      <BottomTabs />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```

Tabs at the bottom, 4 routes navigable, theme applies.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: app shell with router, animated routes, theme"
```

---

## Task 14: `Today` route — full implementation

**Files:**
- Modify: `src/routes/Today.tsx`
- Create: `src/components/CelebrationBurst.tsx`

- [ ] **Step 1: Implement `CelebrationBurst`**

Create `src/components/CelebrationBurst.tsx`:

```tsx
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type Props = { fire: boolean };

export function CelebrationBurst({ fire }: Props) {
  useEffect(() => {
    if (!fire) return;
    const end = Date.now() + 800;
    const colors = ['#34d399', '#a78bfa', '#fb923c', '#38bdf8'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60,  spread: 55, origin: { x: 0 },   colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 },   colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [fire]);
  return null;
}
```

- [ ] **Step 2: Implement Today route**

Replace `src/routes/Today.tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../components/ProgressRing';
import { StreakChip } from '../components/StreakChip';
import { QuickAddRow } from '../components/QuickAddRow';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { todayISO } from '../lib/dates';
import { pickEncouragement } from '../lib/messages';

export default function Today() {
  const today = todayISO();
  const { entries, addSteps, setSteps } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(today);
  const { vibrate } = useHaptics();

  const stepsToday = entries[today] ?? 0;
  const progress = stepsToday / settings.goal;
  const message = useMemo(() => pickEncouragement(progress, today), [progress, today]);

  const [celebrated, setCelebrated] = useLocalStorage<{ celebratedDates: string[] }>(
    'dailysteps:meta',
    { celebratedDates: [] },
  );

  const [fire, setFire] = useState(false);
  const wasBelow = useRef(stepsToday < settings.goal);
  useEffect(() => {
    const isAtOrAbove = stepsToday >= settings.goal;
    const alreadyCelebrated = celebrated.celebratedDates.includes(today);
    if (isAtOrAbove && wasBelow.current && !alreadyCelebrated) {
      setFire(true);
      setCelebrated({ celebratedDates: [...celebrated.celebratedDates, today] });
      setTimeout(() => setFire(false), 1200);
    }
    wasBelow.current = !isAtOrAbove;
  }, [stepsToday, settings.goal, celebrated, setCelebrated, today]);

  const [custom, setCustom] = useState('');

  const onAdd = (n: number) => {
    addSteps(today, n);
    vibrate(10);
  };

  const onAddCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isFinite(n) || n === 0) return;
    addSteps(today, n);
    setCustom('');
    vibrate(10);
  };

  const onClearToday = () => setSteps(today, 0);

  return (
    <div className="px-5 pt-8 flex flex-col items-center gap-6">
      <CelebrationBurst fire={fire} />

      <StreakChip dayOfChallenge={streak.dayOfChallenge} streak={streak.current} />

      <ProgressRing steps={stepsToday} goal={settings.goal} />

      <motion.p
        key={message.text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base font-medium opacity-80 text-center"
      >
        {message.text}
      </motion.p>

      <div className="w-full">
        <QuickAddRow onAdd={onAdd} />
      </div>

      <div className="w-full flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom amount"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 rounded-2xl bg-white/70 dark:bg-ink-900/60 backdrop-blur px-4 py-3 outline-none focus:ring-2 focus:ring-mint-300"
        />
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onAddCustom}
          className="rounded-2xl bg-mint-400 text-white px-5 py-3 font-semibold shadow"
        >
          Add
        </motion.button>
      </div>

      <button
        onClick={onClearToday}
        className="text-xs opacity-50 underline-offset-2 hover:underline"
      >
        Clear today
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```

Click quick-adds; ring fills, number rolls, hitting goal triggers confetti once. Reload page — state persists. Click "Clear today" — resets to zero.

- [ ] **Step 4: Run unit tests**

Run: `npm run test:run`
Expected: still all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(today): full Today screen with ring/confetti/streak"
```

---

## Task 15: `Heatmap` + `DayDetailSheet` and History route

**Files:**
- Create: `src/components/Heatmap.tsx`
- Create: `src/components/DayDetailSheet.tsx`
- Modify: `src/routes/History.tsx`

- [ ] **Step 1: Implement Heatmap**

Create `src/components/Heatmap.tsx`:

```tsx
import { motion } from 'framer-motion';
import { monthGrid } from '../lib/dates';

type Props = {
  year: number;
  monthIndex0: number;     // 0..11
  goal: number;
  entries: Record<string, number>;
  startDate: string;
  today: string;
  onPick: (iso: string) => void;
};

function pctClass(pct: number): string {
  if (pct >= 1)    return 'bg-mint-500 text-white';
  if (pct >= 0.75) return 'bg-mint-300';
  if (pct >= 0.5)  return 'bg-mint-200';
  if (pct >= 0.25) return 'bg-mint-100';
  return 'bg-white/60 dark:bg-ink-900/40';
}

const DOW = ['S','M','T','W','T','F','S'];

export function Heatmap({ year, monthIndex0, goal, entries, startDate, today, onPick }: Props) {
  const cells = monthGrid(year, monthIndex0);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-xs opacity-50 text-center">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ iso, inMonth }) => {
          const steps = entries[iso] ?? 0;
          const pct = steps / goal;
          const before = iso < startDate;
          const isToday = iso === today;
          const dayNum = parseInt(iso.slice(8, 10), 10);
          return (
            <motion.button
              key={iso}
              whileTap={{ scale: 0.94 }}
              onClick={() => onPick(iso)}
              className={[
                'aspect-square rounded-xl text-xs flex items-center justify-center font-medium',
                inMonth ? '' : 'opacity-30',
                before ? 'opacity-30' : pctClass(pct),
                isToday ? 'ring-2 ring-mint-500' : '',
              ].join(' ')}
            >
              {dayNum}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement DayDetailSheet**

Create `src/components/DayDetailSheet.tsx`:

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type Props = {
  iso: string | null;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
  onClear: (iso: string) => void;
  onClose: () => void;
};

export function DayDetailSheet({ iso, steps, goal, onSave, onClear, onClose }: Props) {
  const [value, setValue] = useState(String(steps));
  useEffect(() => setValue(String(steps)), [steps, iso]);

  return (
    <AnimatePresence>
      {iso && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md p-5 rounded-t-4xl bg-white dark:bg-ink-900 shadow-2xl"
          >
            <div className="mx-auto w-12 h-1.5 rounded-full bg-ink-900/20 dark:bg-ink-50/20 mb-4" />
            <div className="text-lg font-semibold mb-1">{iso}</div>
            <div className="text-sm opacity-60 mb-4">Goal: {goal.toLocaleString()}</div>
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-2xl bg-ink-50 dark:bg-ink-950 px-4 py-3 outline-none focus:ring-2 focus:ring-mint-300"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { onSave(iso, parseInt(value, 10) || 0); onClose(); }}
                className="flex-1 rounded-2xl bg-mint-400 text-white py-3 font-semibold"
              >Save</button>
              <button
                onClick={() => { onClear(iso); onClose(); }}
                className="rounded-2xl bg-ink-50 dark:bg-ink-950 px-5 py-3"
              >Clear</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Implement History route**

Replace `src/routes/History.tsx`:

```tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Heatmap } from '../components/Heatmap';
import { DayDetailSheet } from '../components/DayDetailSheet';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { todayISO } from '../lib/dates';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function History() {
  const today = todayISO();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const { entries, setSteps, clearDay } = useEntries();
  const { settings } = useSettings();

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const next = () => {
    const isCurrent = year === now.getFullYear() && month === now.getMonth();
    if (isCurrent) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-2 rounded-xl bg-white/60 dark:bg-ink-900/60">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="p-2 rounded-xl bg-white/60 dark:bg-ink-900/60">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <Heatmap
        year={year} monthIndex0={month}
        goal={settings.goal}
        entries={entries}
        startDate={settings.startDate}
        today={today}
        onPick={setSelected}
      />

      <DayDetailSheet
        iso={selected}
        steps={selected ? (entries[selected] ?? 0) : 0}
        goal={settings.goal}
        onSave={setSteps}
        onClear={clearDay}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

`npm run dev` — switch months, tap a cell, edit, save, clear.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(history): heatmap + day detail sheet"
```

---

## Task 16: `Stats` route — cards, charts, badges

**Files:**
- Create: `src/components/BadgeGrid.tsx`
- Modify: `src/routes/Stats.tsx`

- [ ] **Step 1: Implement BadgeGrid**

Create `src/components/BadgeGrid.tsx`:

```tsx
import { BADGE_DEFS } from '../lib/badges';

type Props = { unlockedIds: string[] };

export function BadgeGrid({ unlockedIds }: Props) {
  const set = new Set(unlockedIds);
  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGE_DEFS.map(b => {
        const unlocked = set.has(b.id);
        return (
          <div
            key={b.id}
            className={`rounded-2xl p-3 flex flex-col items-center gap-1 text-center ${
              unlocked
                ? 'bg-white/80 dark:bg-ink-900/70 shadow'
                : 'bg-white/30 dark:bg-ink-900/30 opacity-60'
            }`}
          >
            <div className="text-3xl">{b.emoji}</div>
            <div className="text-xs font-medium">{b.label}</div>
            <div className="text-[10px] opacity-60">{b.streakDays}d</div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Implement Stats route**

Replace `src/routes/Stats.tsx`:

```tsx
import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
} from 'recharts';
import { BadgeGrid } from '../components/BadgeGrid';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useStreak } from '../hooks/useStreak';
import { addDays, todayISO } from '../lib/dates';
import { computeUnlocks } from '../lib/badges';

function avg(xs: number[]) {
  if (xs.length === 0) return 0;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
}

export default function Stats() {
  const today = todayISO();
  const { entries } = useEntries();
  const { settings } = useSettings();
  const streak = useStreak(today);
  const unlockedIds = computeUnlocks(streak.longest);

  const last30 = useMemo(() => {
    const out: { date: string; steps: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const iso = addDays(today, -i);
      out.push({ date: iso.slice(5), steps: entries[iso] ?? 0 });
    }
    return out;
  }, [entries, today]);

  const last12Weeks = useMemo(() => {
    const out: { week: string; avg: number }[] = [];
    for (let w = 11; w >= 0; w--) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = addDays(today, -(w * 7 + d));
        days.push(entries[iso] ?? 0);
      }
      out.push({ week: `${w}w`, avg: avg(days) });
    }
    return out;
  }, [entries, today]);

  const allValues = Object.values(entries);
  const stats = {
    avg7:  avg(last30.slice(-7).map(d => d.steps)),
    avg30: avg(last30.map(d => d.steps)),
    best:  allValues.reduce((a, b) => Math.max(a, b), 0),
    total: allValues.reduce((a, b) => a + b, 0),
  };

  return (
    <div className="px-5 pt-8 space-y-6 pb-6">
      <div className="grid grid-cols-2 gap-3">
        <Card label="7-day avg"  value={stats.avg7.toLocaleString()} />
        <Card label="30-day avg" value={stats.avg30.toLocaleString()} />
        <Card label="Best day"   value={stats.best.toLocaleString()} />
        <Card label="Total"      value={stats.total.toLocaleString()} />
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 opacity-80">Last 30 days</h3>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <LineChart data={last30}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, (max: number) => Math.max(max, settings.goal)]} />
              <Tooltip />
              <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 opacity-80">Last 12 weeks (avg/day)</h3>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={last12Weeks}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="week" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="avg" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 opacity-80">Badges</h3>
        <BadgeGrid unlockedIds={unlockedIds} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4 shadow-sm">
      <div className="text-xs opacity-60">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev` → /stats. Numbers and charts render.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(stats): cards, line/bar charts, badges grid"
```

---

## Task 17: `Settings` route + `ConfirmDialog`

**Files:**
- Create: `src/components/ConfirmDialog.tsx`
- Modify: `src/routes/Settings.tsx`

- [ ] **Step 1: Implement ConfirmDialog**

Create `src/components/ConfirmDialog.tsx`:

```tsx
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-ink-900 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-1">{title}</h2>
              <p className="text-sm opacity-70 mb-5">{body}</p>
              <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 rounded-2xl bg-ink-50 dark:bg-ink-950 py-3">Cancel</button>
                <button onClick={onConfirm} className="flex-1 rounded-2xl bg-peach-400 text-white py-3 font-semibold">
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Implement Settings route**

Replace `src/routes/Settings.tsx`:

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSettings } from '../hooks/useSettings';
import { useEntries } from '../hooks/useEntries';
import { todayISO } from '../lib/dates';

export default function Settings() {
  const { settings, update } = useSettings();
  const { clearAll } = useEntries();
  const [confirmReset, setConfirmReset] = useState(false);

  const goalError = settings.goal < 1000 ? 'Goal must be at least 1,000' : null;
  const today = todayISO();

  return (
    <div className="px-5 pt-8 space-y-5">
      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Daily goal</label>
        <input
          type="number"
          inputMode="numeric"
          value={settings.goal}
          onChange={(e) => update({ goal: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none"
        />
        {goalError && <div className="text-xs text-peach-500 mt-1">{goalError}</div>}
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Challenge start date</label>
        <input
          type="date"
          value={settings.startDate}
          max={today}
          onChange={(e) => update({ startDate: e.target.value })}
          className="w-full bg-transparent text-base outline-none"
        />
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-ink-900/60 backdrop-blur p-4">
        <label className="text-xs opacity-60">Theme</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['light','dark','system'] as const).map(t => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`rounded-2xl py-2 capitalize ${
                settings.theme === t ? 'bg-mint-400 text-white' : 'bg-ink-50 dark:bg-ink-950'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setConfirmReset(true)}
        className="w-full rounded-3xl bg-peach-100 text-peach-500 py-3 font-semibold"
      >Reset all data</button>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        body="This will delete all logged steps and unlock history. This cannot be undone."
        confirmLabel="Yes, reset"
        onConfirm={() => { clearAll(); localStorage.removeItem('dailysteps:meta'); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev` → /settings. Edit goal, change start date (can't pick future), switch theme, hit reset (confirm dialog).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(settings): goal, start date, theme, reset"
```

---

## Task 18: Wire PWA support

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`
- Modify: `index.html` (theme color, viewport)

- [ ] **Step 1: Generate icons**

For a quick start, drop in any 192x192 / 512x512 PNG (use a placeholder mint-green square with "DS" text). If you have ImageMagick:

```bash
convert -size 512x512 xc:'#34d399' -gravity center -fill white -font Helvetica -pointsize 220 -annotate 0 'DS' public/icon-512.png
convert public/icon-512.png -resize 192x192 public/icon-192.png
cp public/icon-512.png public/icon-maskable-512.png
```

If `convert` isn't available, create three blank PNG files at those paths and replace later.

- [ ] **Step 2: Configure vite-plugin-pwa**

Replace `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'DailySteps',
        short_name: 'Steps',
        description: 'A pretty step tracker that keeps you on a streak.',
        theme_color: '#34d399',
        background_color: '#ecfdf5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

- [ ] **Step 3: Update `index.html`**

In `index.html`, set:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#34d399" />
<title>DailySteps</title>
```

- [ ] **Step 4: Build and preview**

```bash
npm run build
npm run preview
```

In the preview URL, browser DevTools → Application → Manifest should show DailySteps with icons; Service Worker registered.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(pwa): manifest, icons, service worker"
```

---

## Task 19: Final verification pass

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: every test green.

- [ ] **Step 2: Type-check the build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Smoke-test the app end-to-end**

```bash
npm run dev
```

Walk through:
- Add steps until ring fills → confetti fires.
- Reload — state and "celebrated" flag persist (no double confetti same day).
- /history — tap a past day, set steps, save; cell color updates.
- /stats — cards and charts populate.
- /settings — change goal to 5000, ring updates; change start date back, dayOfChallenge updates; toggle dark theme; reset clears everything.

- [ ] **Step 4: Commit any final cleanup**

```bash
git add -A
git diff --cached --stat
git commit -m "chore: final verification cleanup" || true
```

---

## Self-Review Notes

- Spec coverage: every requirement (PWA, manual + presets logging, strict streak, configurable goal & start date, soft-pastel UI, confetti, badges, encouraging messages, four screens, light/dark/system, reset, no JSON import/export) maps to a task above.
- Type consistency: `Settings`, `Entries`, streak fields (`current`, `longest`, `dayOfChallenge`), badge IDs (`streak-3` etc.), localStorage keys (`dailysteps:settings`, `dailysteps:entries`, `dailysteps:meta`) are stable across tasks.
- Dates: all date strings are local-time `YYYY-MM-DD`; `streak.ts` uses `addDays`/`daysBetween` from `dates.ts`.
- No placeholders, no "TODO" steps.

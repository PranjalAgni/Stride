# DailySteps — Design Spec

**Date:** 2026-06-12

## Goal

A pretty, animation-rich, mobile-first React PWA that lets a single user log daily steps, defends a streak against a configurable goal (default 7,500), and keeps them motivated through ring progress, confetti, badges, and tuned messages. Everything client-side; no server, no account.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (mobile-first, custom pastel palette)
- Framer Motion (`motion`) for spring/bounce animations
- `vite-plugin-pwa` for manifest + service worker (offline + installable)
- `react-router-dom` for the four screens
- `date-fns` for date math
- `canvas-confetti` for goal-hit celebration
- `recharts` for stats charts
- `lucide-react` for icons
- `localStorage` for persistence (data is small — at most a few hundred entries/yr)

## Visual Personality

Soft & playful. Pastel gradients (mint, peach, lavender, sky), generously rounded corners (`rounded-3xl`), springy motion (Framer Motion `spring` with low stiffness, modest damping), friendly emojis where they fit (🔥 streak, 🎉 goal). Light/dark/system theme support; dark mode keeps the pastel character but on a deep navy base.

## Screens

The app is a four-tab mobile shell with a persistent bottom tab bar. On wider screens the content clamps to a phone-shaped column.

### Today (`/`)
The hero screen.

- Large animated SVG progress ring; fill animates clockwise toward `min(stepsToday / goal, 1)` with a spring.
- Today's number under the ring, animated rollup on change (`steps / goal`).
- Streak chip near the top: `Day {N} · 🔥 {streak} day streak` (number rolls up).
- Encouraging message tuned to today's progress (`messages.ts`):
  - `<25%` → "Let's get moving."
  - `25–75%` → "Halfway there!" / "You're crushing it!"
  - `75–100%` → "Almost there — one more walk!"
  - `>=100%` → "Goal hit. You're a legend."
- Quick-add row: `+100` `+500` `+1000` `+2000` (tap fires haptic, ring pulses).
- Custom-add: numeric input + "Add" button.
- Long-press any quick-add toggles a temporary "subtract" mode for that button (correcting misclicks).
- Crossing 100% for the first time today: full-screen confetti burst, ring flashes gold, badge unlocks if a milestone was crossed.

### History (`/history`)
- Month-grid heatmap. Each cell is one day, color-coded by goal completion (pastel green scale, gray for unlogged days, dimmed for days before the challenge start date).
- Today highlighted with a ring outline.
- Tap a day → bottom sheet with the day's number + edit/clear actions.
- Month switcher arrows; can't navigate past today's month forward.

### Stats (`/stats`)
- Stat cards: 7-day average, 30-day average, best day, total since start.
- Line chart: last 30 days of step counts (recharts).
- Bar chart: last 12 weeks (avg steps per week).
- Badges grid: locked vs. unlocked, with unlock date.

### Settings (`/settings`)
- Daily goal (numeric input, default 7500, min 1000).
- Challenge start date (date picker, default today on first launch).
- Theme: light / dark / system.
- Reset all data (with confirmation dialog).

(No JSON import/export.)

## Streak Rule

Strict: the streak counts consecutive days, ending today (or yesterday if today's not yet logged), where `entries[day] >= goal`. Miss a day → streak resets to 0.

- Days before `settings.startDate` do not count toward streak in either direction.
- "Day N of the challenge" = `daysBetween(startDate, today) + 1`.
- Today not yet at goal does NOT break the streak; it just means the streak as of yesterday still applies. The streak only breaks once a past day is final and below goal.

## Motivation System

- **Confetti** on first 100% crossing each day (one-shot per date).
- **Milestone badges** at streak = 3, 7, 14, 30, 60, 100 days. When unlocked, briefly slide in from the top of the Today screen.
- **Encouraging messages** rotate per progress band (see Today screen).

## Data Model (`localStorage`)

```ts
// 'dailysteps:settings'
type Settings = {
  goal: number;            // default 7500
  startDate: string;       // ISO 'YYYY-MM-DD'
  theme: 'light' | 'dark' | 'system';
};

// 'dailysteps:entries'
type Entries = Record<string, number>;  // 'YYYY-MM-DD' -> steps

// 'dailysteps:badges'
type Badges = { unlocked: string[] };   // e.g. ['streak-3','streak-7']

// 'dailysteps:meta' (one-shot flags so we don't re-fire celebrations)
type Meta = { celebratedDates: string[] };
```

Everything else (current streak, longest streak, day-of-challenge, weekly/monthly aggregates, today's %) is derived on read. Computing across a year of dates is trivially fast.

## Hooks

- `useLocalStorage<T>(key, initial)` — typed, JSON-serialized, syncs across tabs via `storage` event.
- `useSettings()` — read/update settings.
- `useEntries()` — `entries`, `addSteps(date, n)`, `setSteps(date, n)`, `clearDay(date)`.
- `useStreak()` — derives `{ current, longest, dayOfChallenge }` from entries + settings.
- `useTheme()` — applies `class="dark"` on `<html>` based on setting + system pref.
- `useHaptics()` — `vibrate(ms)` wrapper, no-op when unsupported.

## File Structure

```
src/
  main.tsx
  App.tsx
  routes/
    Today.tsx
    History.tsx
    Stats.tsx
    Settings.tsx
  components/
    BottomTabs.tsx
    ProgressRing.tsx
    StreakChip.tsx
    QuickAddRow.tsx
    Heatmap.tsx
    DayDetailSheet.tsx
    BadgeGrid.tsx
    ConfirmDialog.tsx
  hooks/
    useLocalStorage.ts
    useSettings.ts
    useEntries.ts
    useStreak.ts
    useTheme.ts
    useHaptics.ts
  lib/
    dates.ts        // today(), formatISO, daysBetween, monthGrid
    streak.ts       // computeStreak(entries, settings)
    badges.ts       // BADGE_DEFS, checkUnlocks
    messages.ts     // pickEncouragement(progress)
  styles/
    index.css       // tailwind + base
public/
  icons/            // PWA icons (192, 512, maskable)
  manifest.webmanifest
index.html
vite.config.ts
tailwind.config.ts
tsconfig.json
package.json
```

## PWA Setup

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
- Manifest: name "DailySteps", short_name "Steps", theme color matching the soft palette accent (mint), background color, standalone display, portrait orientation.
- Icons: 192, 512, maskable 512.
- Service worker precaches the app shell so it works fully offline (data is local already).

## Animations

- Progress ring fill: Framer Motion `motion.circle` with animated `strokeDashoffset`, spring `{ stiffness: 90, damping: 15 }`.
- Number rollups: animated count on `steps`, `streak`, `dayOfChallenge` using `motion.span` with a custom hook.
- Tap feedback: scale to 0.96 on press, spring back.
- Tab transitions: cross-fade + 8px y-slide between routes.
- Bottom sheet: spring up from bottom with backdrop fade.
- Badge unlock: slide down from top of Today screen, auto-dismiss after 3s.

## Error Handling

- All localStorage reads wrap in `try/catch` and fall back to defaults if JSON is corrupt.
- Numeric inputs clamp to non-negative integers.
- Goal min 1000 (UI validation, not silent clamp).
- Date picker prevents start dates in the future.

## Out of Scope

- Multi-user / accounts / sync
- JSON import/export
- HealthKit / Google Fit integration
- Notifications / reminders
- Social / sharing

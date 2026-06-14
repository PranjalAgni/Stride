# Edit Past Day from Calendar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user tap a past day in the full-month calendar, see a "Selected Day" card with the logged steps, and edit those steps inline (Save / Cancel).

**Architecture:** Create a new presentational `SelectedDayCard` component that owns its own view/edit toggle and a draft input. The `Calendar` route owns `selectedIso` state, makes only past in-month cells tappable, and conditionally renders the card in place of Monthly Stats when a day is selected. Persistence reuses the existing `useEntries().setSteps`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react icons, framer-motion (already in repo), `vitest` + `@testing-library/react` for tests, `date-fns` (via existing `lib/dates.ts`) for date formatting.

---

## File Structure

- **Create:** `src/components/SelectedDayCard.tsx` — view/edit card for one selected past day. ~120 lines.
- **Create:** `src/components/SelectedDayCard.test.tsx` — RTL tests for view, edit, save, cancel, status text.
- **Modify:** `src/routes/Calendar.tsx` — add `selectedIso` state, make past cells tappable buttons, render card vs. Monthly Stats. The current ~355-line file is on the chunkier side; keep additions tight and delete dead branches as you go.

No changes to `useEntries`, `dates.ts`, or anything else.

---

## Conventions used by this repo (read before starting)

- Test runner: `vitest`. Run a single file with `npx vitest run path/to/file.test.tsx`. Run all with `npm run test:run`.
- Test setup at `src/test/setup.ts`; tests use `@testing-library/react` + `@testing-library/user-event`.
- Tailwind theme tokens already in use: `ink-300 / ink-500 / ink-700 / ink-800 / ink-900`, `ice-100 / ice-300`, `lime-400`, `red-400`. Card surface color is the literal `bg-[#0B1122]`.
- `entries[iso]` is `number | undefined`; `0` is a valid logged value. `setSteps(iso, n)` floors and clamps to `>= 0`.
- Date helpers: `todayISO()`, `fromISO(iso)` returns a `Date`, `monthGrid(year, monthIndex)` returns 42 cells. There is **no** existing `MMM D, YYYY` formatter — write one inline.
- Day-of-week strings to match the screenshot: full uppercase (`MONDAY`, `TUESDAY`, …, `SUNDAY`).
- The screenshot shows the date label as `OCT 12, 2023` (month uppercase, abbreviated). Match that.

---

## Task 1: Scaffold `SelectedDayCard` (view-mode skeleton + first test)

**Files:**
- Create: `src/components/SelectedDayCard.tsx`
- Create: `src/components/SelectedDayCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/SelectedDayCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectedDayCard } from './SelectedDayCard';

describe('SelectedDayCard', () => {
  it('renders the section header with title and formatted date', () => {
    render(
      <SelectedDayCard
        iso="2023-10-12"
        steps={12430}
        goal={7500}
        onSave={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Selected Day' })).toBeInTheDocument();
    expect(screen.getByText('OCT 12, 2023')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: FAIL — module `./SelectedDayCard` does not exist.

- [ ] **Step 3: Create the component with just enough to pass**

Create `src/components/SelectedDayCard.tsx`:

```tsx
import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function formatHeaderDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave }: Props) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-extrabold text-ice-100">Selected Day</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {formatHeaderDate(iso)}
        </div>
      </div>
      <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
        {/* body filled in next task */}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/SelectedDayCard.tsx src/components/SelectedDayCard.test.tsx
git commit -m "feat(calendar): scaffold SelectedDayCard with header"
```

---

## Task 2: View-mode body — day-of-week, step number, goal status

**Files:**
- Modify: `src/components/SelectedDayCard.tsx`
- Modify: `src/components/SelectedDayCard.test.tsx`

- [ ] **Step 1: Add failing tests for the view-mode body**

Append to `src/components/SelectedDayCard.test.tsx`:

```tsx
  it('shows day of week, step count, goal, and Met status', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('THURSDAY')).toBeInTheDocument();
    expect(screen.getByText('12,430')).toBeInTheDocument();
    expect(screen.getByText('steps')).toBeInTheDocument();
    expect(screen.getByText(/Goal: 7,500/)).toBeInTheDocument();
    expect(screen.getByText('Met')).toBeInTheDocument();
  });

  it('shows Missed status when 0 < steps < goal', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={3000} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('Missed')).toBeInTheDocument();
  });

  it('shows Not logged status when steps is 0', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={0} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('Not logged')).toBeInTheDocument();
  });
```

Note: `2023-10-12` is a Thursday. Verify with `node -e "console.log(new Date(2023,9,12).getDay())"` → `4`.

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: 1 PASS (existing) + 3 FAIL (new ones — text not found).

- [ ] **Step 3: Implement the view-mode body and pencil button**

Replace the contents of `src/components/SelectedDayCard.tsx` with:

```tsx
import { Pencil } from 'lucide-react';
import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const FULL_DOW = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
];

function formatHeaderDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function dayOfWeek(iso: string): string {
  return FULL_DOW[fromISO(iso).getDay()];
}

type Status = { label: string; color: string };
function status(steps: number, goal: number): Status {
  if (steps === 0) return { label: 'Not logged', color: 'text-ink-300' };
  if (steps >= goal) return { label: 'Met', color: 'text-lime-400 font-semibold' };
  return { label: 'Missed', color: 'text-red-400' };
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave: _onSave }: Props) {
  const s = status(steps, goal);
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-extrabold text-ice-100">Selected Day</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {formatHeaderDate(iso)}
        </div>
      </div>
      <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {dayOfWeek(iso)}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-5xl font-extrabold tabular-nums text-ice-100 truncate">
              {steps.toLocaleString()}
            </span>
            <span className="text-sm text-ink-300">steps</span>
          </div>
          <button
            type="button"
            aria-label="Edit steps"
            className="size-10 rounded-full bg-ink-900/60 border border-ink-700/60 grid place-items-center text-ice-100 hover:text-lime-400 transition-colors shrink-0"
          >
            <Pencil className="size-4" strokeWidth={2.25} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-700/60 flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(212,255,58,0.6)]" />
          <span className="text-ink-300">
            Goal: {goal.toLocaleString()} <span className="text-ink-500">•</span>{' '}
            <span className={s.color}>{s.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
```

The unused `_onSave` is a deliberate placeholder — Task 3 wires it up. Keep it prefixed with `_` to silence lint; rename in Task 3.

- [ ] **Step 4: Run tests to verify all four pass**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SelectedDayCard.tsx src/components/SelectedDayCard.test.tsx
git commit -m "feat(calendar): render selected-day card view mode"
```

---

## Task 3: Edit mode — toggle, autofocused input, Save / Cancel

**Files:**
- Modify: `src/components/SelectedDayCard.tsx`
- Modify: `src/components/SelectedDayCard.test.tsx`

- [ ] **Step 1: Add failing tests for edit interactions**

Append to `src/components/SelectedDayCard.test.tsx` (and add the userEvent import at the top of the file if not already present):

```tsx
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
```

Then add these tests inside the same `describe`:

```tsx
  it('clicking pencil enters edit mode with input prefilled and focused', async () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    expect(input).toHaveValue(12430);
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Save calls onSave with parsed value and exits edit mode', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '8000');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 8000);
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit steps' })).toBeInTheDocument();
  });

  it('Save with empty input persists 0', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 0);
  });

  it('Save with negative input persists 0', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '-5');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 0);
  });

  it('Cancel does not call onSave and exits edit mode', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit steps' })).toBeInTheDocument();
    // After cancel the original value still shows
    expect(screen.getByText('12,430')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: 4 PASS (from earlier tasks) + 5 FAIL.

- [ ] **Step 3: Implement edit mode**

Replace the contents of `src/components/SelectedDayCard.tsx` with:

```tsx
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const FULL_DOW = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
];

function formatHeaderDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function dayOfWeek(iso: string): string {
  return FULL_DOW[fromISO(iso).getDay()];
}

type Status = { label: string; color: string };
function status(steps: number, goal: number): Status {
  if (steps === 0) return { label: 'Not logged', color: 'text-ink-300' };
  if (steps >= goal) return { label: 'Met', color: 'text-lime-400 font-semibold' };
  return { label: 'Missed', color: 'text-red-400' };
}

function parseDraft(raw: string): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

type Props = {
  iso: string;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
};

export function SelectedDayCard({ iso, steps, goal, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(steps));
  const s = status(steps, goal);

  const enterEdit = () => {
    setDraft(String(steps));
    setIsEditing(true);
  };
  const cancel = () => {
    setDraft(String(steps));
    setIsEditing(false);
  };
  const save = () => {
    onSave(iso, parseDraft(draft));
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-extrabold text-ice-100">Selected Day</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {formatHeaderDate(iso)}
        </div>
      </div>
      <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          {dayOfWeek(iso)}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          {isEditing ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              autoFocus
              aria-label="Steps"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-40 bg-transparent text-5xl font-extrabold tabular-nums text-ice-100 border-b border-ink-700/60 outline-none focus:border-lime-400/60"
            />
          ) : (
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-5xl font-extrabold tabular-nums text-ice-100 truncate">
                {steps.toLocaleString()}
              </span>
              <span className="text-sm text-ink-300">steps</span>
            </div>
          )}

          {isEditing ? (
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={save}
                className="rounded-2xl bg-lime-400 text-ink-900 font-bold px-4 py-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-2xl bg-ink-900 border border-ink-700/60 text-ink-300 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Edit steps"
              onClick={enterEdit}
              className="size-10 rounded-full bg-ink-900/60 border border-ink-700/60 grid place-items-center text-ice-100 hover:text-lime-400 transition-colors shrink-0"
            >
              <Pencil className="size-4" strokeWidth={2.25} />
            </button>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-ink-700/60 flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(212,255,58,0.6)]" />
          <span className="text-ink-300">
            Goal: {goal.toLocaleString()} <span className="text-ink-500">•</span>{' '}
            <span className={s.color}>{s.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify all nine pass**

Run: `npx vitest run src/components/SelectedDayCard.test.tsx`
Expected: 9 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SelectedDayCard.tsx src/components/SelectedDayCard.test.tsx
git commit -m "feat(calendar): inline edit mode for selected day card"
```

---

## Task 4: Wire selection state into `Calendar` and make past cells tappable

**Files:**
- Modify: `src/routes/Calendar.tsx`

This task does **not** add the new card yet — it only adds selection state, makes past in-month cells `<button>`s, and applies the cyan-outline ring on the selected cell. Today, future, before-startDate, and out-of-month cells stay non-interactive `<div>`s.

- [ ] **Step 1: Update imports and add selection state**

In `src/routes/Calendar.tsx`, the existing import of `useEntries` already returns the entries map. Update the destructuring at line 50 to also pull `setSteps`:

```tsx
  const { entries, setSteps } = useEntries();
```

Then directly below the `view` state (currently lines 54-57), add:

```tsx
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
```

- [ ] **Step 2: Clear selection when month changes**

Replace the current `goPrevMonth` / `goNextMonth` (lines 112-121) with:

```tsx
  const goPrevMonth = () => {
    setSelectedIso(null);
    setView((v) => {
      const d = new Date(v.year, v.monthIndex - 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  };
  const goNextMonth = () => {
    setSelectedIso(null);
    setView((v) => {
      const d = new Date(v.year, v.monthIndex + 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  };
```

- [ ] **Step 3: Make past in-month cells tappable buttons**

Replace the cell-rendering block inside the `cells.map(...)` call (currently lines 180-218) with:

```tsx
            {cells.map(({ iso, inMonth }) => {
              const steps = entries[iso] ?? 0;
              const isToday = iso === today;
              const isFuture = iso > today;
              const beforeStart = iso < settings.startDate;
              const met = !isFuture && !beforeStart && steps >= settings.goal;
              const restDay = !isFuture && !beforeStart && !met && steps === 0;
              const missed = !isFuture && !beforeStart && !met && steps > 0;
              const dayNum = parseInt(iso.slice(8, 10), 10);
              const isSelectable = inMonth && !isFuture && !isToday && !beforeStart;
              const isSelected = selectedIso === iso;

              const cellClasses = `relative size-9 grid place-items-center rounded-xl text-base font-semibold tabular-nums ${
                isToday || isSelected
                  ? 'bg-ink-900/80 border border-ice-300/70 text-ice-100 shadow-[0_0_10px_rgba(143,200,255,0.35)]'
                  : ''
              } ${
                !inMonth || isFuture || beforeStart
                  ? 'text-ink-500'
                  : 'text-ice-100'
              }`;

              return (
                <div key={iso} className="flex flex-col items-center gap-1.5">
                  {isSelectable ? (
                    <button
                      type="button"
                      aria-label={`Select ${iso}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelectedIso((cur) => (cur === iso ? null : iso))
                      }
                      className={cellClasses}
                    >
                      {dayNum}
                    </button>
                  ) : (
                    <div className={cellClasses}>
                      {dayNum}
                      {isToday && (
                        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(143,200,255,0.8)]" />
                      )}
                    </div>
                  )}
                  <DayDot
                    inMonth={inMonth}
                    isFuture={isFuture}
                    beforeStart={beforeStart}
                    met={met}
                    restDay={restDay}
                    missed={missed}
                  />
                </div>
              );
            })}
```

Note the today-only blue dot indicator stays only on the non-selectable today cell — it never appears on selectable past cells.

- [ ] **Step 4: Type-check the route**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: PASS (no errors). If `selectedIso`/`setSelectedIso` warnings appear because they're unused outside Task 4's scope, that's fine — they get used in Task 5. But TypeScript itself should not error; unused locals are lint warnings, not type errors.

- [ ] **Step 5: Run all tests to verify nothing regressed**

Run: `npm run test:run`
Expected: All existing tests PASS. (No new tests in this task — `Calendar` route has no test file and adding one is out of scope; the `SelectedDayCard` tests still cover the editable surface.)

- [ ] **Step 6: Commit**

```bash
git add src/routes/Calendar.tsx
git commit -m "feat(calendar): make past day cells selectable with cyan ring"
```

---

## Task 5: Render `SelectedDayCard` in place of Monthly Stats when a day is selected

**Files:**
- Modify: `src/routes/Calendar.tsx`

- [ ] **Step 1: Import the new component**

Add to the import block at the top of `src/routes/Calendar.tsx` (after the existing `useStreak` import):

```tsx
import { SelectedDayCard } from '../components/SelectedDayCard';
```

- [ ] **Step 2: Conditionally render Monthly Stats vs. SelectedDayCard**

Find the existing Monthly Stats block (currently lines 230-272 inside the `<div className="px-5 pt-5 space-y-5">` wrapper, the section starting with `<h2 ...>Monthly Stats</h2>`). Wrap it so it only renders when nothing is selected, and render the card otherwise.

Replace the block:

```tsx
        {/* Monthly Stats */}
        <div>
          <h2 className="text-2xl font-extrabold text-ice-100 mb-3">
            Monthly Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            ... existing stat tiles ...
          </div>

          <div className="mt-3 rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
            ... days goal met ...
          </div>
        </div>
```

with:

```tsx
        {selectedIso ? (
          <SelectedDayCard
            iso={selectedIso}
            steps={entries[selectedIso] ?? 0}
            goal={settings.goal}
            onSave={setSteps}
          />
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-ice-100 mb-3">
              Monthly Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="TOTAL STEPS"
                value={fmt(stats.total)}
                footer={
                  stats.pctVsPrev !== null ? (
                    <span className="text-lime-400 font-semibold">
                      {stats.pctVsPrev >= 0 ? '+' : ''}
                      {stats.pctVsPrev}% vs {stats.prevMonthShort}
                    </span>
                  ) : null
                }
              />
              <StatCard
                label="AVG STEPS"
                value={fmt(stats.avg)}
                footer={
                  stats.avg >= settings.goal ? (
                    <span className="text-lime-400 font-semibold">
                      Above goal
                    </span>
                  ) : (
                    <span className="text-ink-300 font-semibold">
                      Goal: {fmt(settings.goal)}
                    </span>
                  )
                }
              />
            </div>

            <div className="mt-3 rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4">
              <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
                DAYS GOAL MET
              </div>
              <div className="mt-1 text-4xl font-extrabold text-ice-100 tabular-nums">
                {stats.goalMet} / {stats.daysCounted} Days
              </div>
            </div>
          </div>
        )}
```

(All inner content of the Monthly Stats branch is unchanged — only the wrapping conditional is new.)

- [ ] **Step 3: Type-check**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: PASS.

- [ ] **Step 4: Run all tests**

Run: `npm run test:run`
Expected: All tests PASS.

- [ ] **Step 5: Manual verification in the dev server**

Run: `npm run dev`

Walk through the flow:
1. Navigate to the Calendar route. Monthly Stats shows.
2. Tap a past in-month day with logged steps. Cyan ring appears on the cell, Monthly Stats is replaced by Selected Day card showing day-of-week, steps, and "Met" / "Missed" / "Not logged".
3. Tap the pencil. Number becomes an input, autofocused; Save (lime) and Cancel buttons appear.
4. Change the value, tap Save. Card returns to view mode with the new number; calendar dot updates if the goal-met status flipped.
5. Tap pencil again, change value, tap Cancel. Card returns to view mode with the original number.
6. Tap the same selected cell again. Selection clears, Monthly Stats returns.
7. Tap today's cell. Nothing happens — Monthly Stats stays.
8. Tap a future cell. Nothing happens.
9. With a day selected, press prev or next month arrow. Selection clears, Monthly Stats shows for the new month.

Stop the dev server with Ctrl-C when done.

- [ ] **Step 6: Commit**

```bash
git add src/routes/Calendar.tsx
git commit -m "feat(calendar): swap monthly stats for selected day card on tap"
```

---

## Task 6: Final lint pass

**Files:** none (read-only verification)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS (no errors). Warnings about unused imports — fix them inline. If there are pre-existing warnings unrelated to this work, leave them alone.

- [ ] **Step 2: Full test suite**

Run: `npm run test:run`
Expected: All PASS.

- [ ] **Step 3: TypeScript build**

Run: `npm run build`
Expected: PASS. (Vite + tsc -b will catch any production-mode type errors.)

If all three pass, the feature is ready to ship.

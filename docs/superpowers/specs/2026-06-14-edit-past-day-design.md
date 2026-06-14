# Edit Past Day from Calendar — Design

## Goal

Let the user edit step counts for **past days** directly from the full-month
calendar view. Today and future days remain non-editable from this surface
(today is logged from the Dashboard).

## User flow

1. User opens Calendar (`/calendar`).
2. With nothing selected, the page shows the existing **Monthly Stats** block
   below the legend.
3. User taps a past in-month day cell.
   - That cell receives a cyan rounded outline (the same treatment used for
     today's cell today).
   - **Monthly Stats is replaced** by a **Selected Day** card showing that
     day's data.
4. User taps the pencil icon inside the card.
   - The big step number becomes an inline numeric input (autofocused,
     numeric keyboard on mobile).
   - The pencil slot becomes two buttons: lime **Save** + ghost **Cancel**.
5. User edits, taps **Save** → value is persisted via `setSteps(iso, n)`,
   the card returns to view mode showing the new value.
   **Cancel** → discards the draft and returns to view mode.
6. Tapping the selected cell again deselects → Monthly Stats returns.
   Navigating to a different month also clears selection.

## Architecture

### New component: `src/components/SelectedDayCard.tsx`

```ts
type Props = {
  iso: string;            // YYYY-MM-DD of the selected past day
  steps: number;          // current entries[iso] ?? 0
  goal: number;           // settings.goal
  onSave: (iso: string, n: number) => void;
};
```

Responsibilities:
- Renders the "Selected Day" header row (title + `MMM D, YYYY` label).
- Renders the day card with view mode and edit mode.
- Owns the local edit state: `isEditing: boolean`, `draft: string`.
- On Save: parses `draft` as a non-negative integer (empty / NaN → 0), calls
  `onSave(iso, n)`, exits edit mode.
- On Cancel: resets `draft` to current `steps`, exits edit mode.

The component is pure UI + local state. The route owns selection state and
the data write callback. This keeps the card independently testable and the
route uncluttered.

### Modified: `src/routes/Calendar.tsx`

Add route-level state:

```ts
const [selectedIso, setSelectedIso] = useState<string | null>(null);
```

The day-cell loop (currently a plain `<div>`) becomes a `<button>` for past,
in-month, on/after-startDate cells, with `onClick={() => setSelectedIso(iso === selectedIso ? null : iso)}`.

Cells that are **not** editable (today, future, before startDate, out-of-month
padding) stay as non-interactive `<div>`s — no click handler, no focus ring.

When `selectedIso === iso`, the cell receives the same cyan outline ring
classes today's cell uses (`bg-ink-900/80 border border-ice-300/70 ...
shadow-[0_0_10px_rgba(143,200,255,0.35)]`).

When the month nav (prev/next) buttons fire, also call `setSelectedIso(null)`.

Below the legend:

```tsx
{selectedIso ? (
  <SelectedDayCard
    iso={selectedIso}
    steps={entries[selectedIso] ?? 0}
    goal={settings.goal}
    onSave={setSteps}
  />
) : (
  <MonthlyStats ... />  // existing inline JSX
)}
```

`setSteps` comes from `useEntries()` — already exported, already supports
this exact shape.

## Tap-target rules

| Cell state | Tappable? | Effect |
|---|---|---|
| Past in-month day, on/after `settings.startDate` | ✅ | Toggle `selectedIso` |
| Today (`iso === today`) | ❌ | No-op |
| Future day (`iso > today`) | ❌ | No-op |
| Before `settings.startDate` | ❌ | No-op |
| Out-of-month padding day (`!inMonth`) | ❌ | No-op |

Selection is cleared by:
- Tapping the same selected cell again
- Pressing prev/next month
- (Implicit) Navigating away from `/calendar`

## View-mode card layout

Outside the card (matches screenshot):
- Left: `Selected Day` (h2, `text-2xl font-extrabold text-ice-100`)
- Right: `OCT 12, 2023` (small caps, `text-[10px] font-bold tracking-[0.2em] text-ink-300`)

Card body (`rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4`):
- Top label: `THURSDAY` (`text-[10px] font-bold tracking-[0.2em] text-ink-300`)
- Middle row (flex, items baseline, gap-2, justify-between):
  - Step number: `12,430` in `text-5xl font-extrabold tabular-nums text-ice-100`
  - `steps` label next to it (`text-sm text-ink-300`)
  - Circular pencil button on the right (`size-10 rounded-full bg-ink-900/60 border border-ink-700/60`, lucide `Pencil` icon)
- Divider: `border-t border-ink-700/60 my-3`
- Bottom row: lime dot · `Goal: 7,500 • <status>`
  - `<status>` is `Met` (lime) when `steps >= goal`
  - `Missed` (red-400) when `0 < steps < goal`
  - `Not logged` (ink-300) when `steps === 0`

## Edit-mode card layout

Triggered by tapping the pencil. State transitions:
- `isEditing`: `false → true`
- `draft`: initialized to `String(steps)`

Layout differences vs. view mode:
- Step number is replaced by an `<input type="number" inputMode="numeric">`:
  - Same large `text-5xl font-extrabold tabular-nums text-ice-100` styling
  - Autofocused on mount (`autoFocus`)
  - `min={0}`, no max
  - Border-only background; `outline-none focus:border-lime-400/60`
  - Width sized to fit the input nicely (e.g. `w-40`)
- Pencil button is replaced by two side-by-side buttons:
  - **Save** (`bg-lime-400 text-ink-900 font-bold rounded-2xl px-4 py-2`)
  - **Cancel** (`bg-ink-900 border border-ink-700/60 text-ink-300 rounded-2xl px-4 py-2`)
- The bottom Goal row stays unchanged (does not update live during editing —
  preview-while-editing is intentionally out of scope; status updates after Save).

Save behavior:
- Parse `parseInt(draft, 10)`; if `NaN`, treat as `0`.
- Clamp negative to `0` (`Math.max(0, n)`).
- Call `onSave(iso, n)`.
- Set `isEditing = false`. The card now reflects the new `steps` prop on the
  next render.

Cancel behavior:
- Set `draft = String(steps)`, `isEditing = false`. No mutation.

## Data layer

No changes needed. `useEntries()` already exposes:

```ts
setSteps(iso: string, n: number): void
```

It floors and clamps to non-negative, then writes to localStorage under
`dailysteps:entries`. Persistence is handled.

## Edge cases

- **Selected day's steps change underneath edit mode** (e.g., another tab
  syncs localStorage — note: not currently implemented anywhere, but useful
  to think through): the card will not auto-overwrite `draft` while editing.
  Acceptable; saving will overwrite whatever is there.
- **User selects a day, then prev/next month is pressed**: `selectedIso` is
  cleared so the user doesn't see a card for a date no longer visible.
- **User selects a day, then taps the back button**: route unmounts,
  selection state is discarded — desired behavior.
- **Empty / non-numeric input on Save**: parsed to `0`, day becomes a "rest
  day" dot in the calendar.
- **Same-day toggle**: tapping the already-selected cell deselects, returning
  the user to Monthly Stats without a separate dismiss control.

## Out of scope

- Editing today's steps from the calendar (today still routes through
  Dashboard).
- Bulk editing or multi-select.
- Live preview of "Met / Missed" status while typing.
- Refactoring or removing the unused `DayDetailSheet.tsx`. Separate cleanup.
- Undo / change history.

## Testing

Unit-test `SelectedDayCard` with React Testing Library (the repo already
uses `@testing-library/react` + `vitest`):

- Renders day-of-week, date, formatted step number, and goal status.
- Pencil button enters edit mode, input is autofocused with current steps.
- Save calls `onSave(iso, parsedNumber)` and returns to view mode.
- Cancel does not call `onSave` and returns to view mode.
- Empty input on Save → `onSave(iso, 0)`.
- Negative input on Save → `onSave(iso, 0)`.
- Status text reflects `Met` / `Missed` / `Not logged` correctly.

Smoke check on `Calendar.tsx`:
- Tapping a past in-month cell sets selection and shows the card.
- Tapping today does nothing.
- Tapping a future cell does nothing.
- Tapping the selected cell again clears selection.
- Pressing prev/next month clears selection.

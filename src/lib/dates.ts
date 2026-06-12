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

export function weekStartingMonday(iso: string): string[] {
  const start = startOfWeek(fromISO(iso), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toISO(dfAddDays(start, i)));
}

export type MonthCell = { iso: string; inMonth: boolean };

export function monthGrid(year: number, monthIndex0: number): MonthCell[] {
  const first = new Date(year, monthIndex0, 1);
  const start = startOfWeek(startOfMonth(first), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(first), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const cells = days.slice(0, 42);
  while (cells.length < 42) cells.push(dfAddDays(cells[cells.length - 1], 1));
  return cells.map(d => ({ iso: toISO(d), inMonth: d.getMonth() === monthIndex0 }));
}

import { parseShowDate } from "./formatShowDateTime";

export function filterShowsForCurrentMonth<T extends { date: string }>(shows: T[]): T[] {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  return shows
    .filter((s) => {
      const d = parseShowDate(s.date);
      return !isNaN(d.getTime()) && d >= start && d < end;
    })
    .sort((a, b) => parseShowDate(a.date).getTime() - parseShowDate(b.date).getTime());
}

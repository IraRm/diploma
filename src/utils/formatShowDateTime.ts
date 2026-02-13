// src/utils/formatShowDateTime.ts

export function parseShowDate(dateString?: string): Date | null {
  if (!dateString) return null;

  const normalized = dateString.includes("T")
    ? dateString
    : dateString.replace(" ", "T");

  const [ymd, hms] = normalized.split("T");
  if (!ymd) return null;

  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;

  let hh = 0;
  let mm = 0;

  if (hms) {
    const parts = hms.split(":").map(Number);
    hh = Number.isFinite(parts[0]) ? parts[0] : 0;
    mm = Number.isFinite(parts[1]) ? parts[1] : 0;
  }

  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

// Форматируем без Date() → без timezone-сдвигов
export function formatShowDateTime(dateString?: string): string {
  if (!dateString) return "—";

  const normalized = dateString.includes("T")
    ? dateString
    : dateString.replace(" ", "T");

  const [ymd, hms] = normalized.split("T");
  if (!ymd || !hms) return dateString;

  const [y, m, d] = ymd.split("-");
  const [hh, mm] = hms.split(":");

  if (!y || !m || !d || !hh || !mm) return dateString;

  return `${d}.${m}.${y} ${hh}:${mm}`;
}

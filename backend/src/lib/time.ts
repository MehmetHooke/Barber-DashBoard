export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function minToHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/**
 * dateStr: "2026-01-07"
 * min: 540 (09:00)
 * -> JS Date (UTC değil, local) üretir.
 */
export function dateWithMin(dateStr: string, min: number) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return new Date(y, mo - 1, d, h, m, 0, 0);
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  // [aStart, aEnd) ile [bStart, bEnd) kesişiyor mu?
  return aStart < bEnd && bStart < aEnd;
}

export function hhmmToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * format.js — small display helpers. Kept separate so the components stay about layout.
 */

// Hours rounded to one decimal, e.g. 4 -> "4", 4.25 -> "4.3".
export function fmtHours(h) {
  const n = Math.round(h * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// Whole-dollar currency, e.g. 8000 -> "$8,000".
export function fmtMoney(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

// A short "X hrs/week" / "X hrs/year" phrase.
export function fmtHoursPerWeek(h) {
  return `${fmtHours(h)} hrs/week`;
}
export function fmtHoursPerYear(h) {
  return `${fmtHours(h)} hrs/year`;
}

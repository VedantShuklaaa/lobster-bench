/** 440 -> "440 ns", 3615 -> "3.6 µs", 76077 -> "76 µs". */
export function fmtNs(ns: number): string {
  if (ns < 1000) return `${Math.round(ns)} ns`;
  const us = ns / 1000;
  return `${us < 10 ? us.toFixed(1) : Math.round(us)} µs`;
}

/** Million operations per second, one decimal. */
export function fmtMops(m: number): string {
  return m.toFixed(1);
}

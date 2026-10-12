import { PRICE_SCALE } from "./config";

export const fmtPrice = (ticks: number) => (ticks / PRICE_SCALE).toFixed(2);
export const toTicks = (price: number) => Math.round(price * PRICE_SCALE);
export const fmtQty = (q: number) => q.toLocaleString("en-US");
export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Nanoseconds as ns, us or ms depending on size. */
export function fmtNs(ns: number | null | undefined): string {
  if (ns == null || !Number.isFinite(ns)) return "–";
  if (ns < 1_000) return `${Math.round(ns)} ns`;
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(ns < 10_000 ? 2 : 1)} µs`;
  return `${(ns / 1_000_000).toFixed(2)} ms`;
}

export function fmtMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "–";
  return ms < 10 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`;
}

export function fmtUptime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function fmtClock(t: number): string {
  const d = new Date(t);
  return d.toTimeString().slice(0, 8);
}

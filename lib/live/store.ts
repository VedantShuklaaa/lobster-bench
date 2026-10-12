import { useSyncExternalStore } from "react";
import { CHART_POINTS, TAPE_ROWS } from "./config";
import type { Level, Limits, Side, Stats, Trade } from "./protocol";

export type Status = "connecting" | "open" | "offline";

export type OpenOrder = { id: number; side: Side; price: number; qty: number; remaining: number };
export type TapeRow = { id: number; t: number; price: number; qty: number; count: number; side: Side };
export type Sample = { t: number; mid: number; last: number | null };
export type Toast = { id: number; kind: "ok" | "fill" | "error"; text: string };
export type Latency = {
  engine_ns: number | null;
  queue_ns: number | null;
  rtt_ms: number | null;
  rtt_hist: number[];
};

export type LiveState = {
  status: Status;
  attempt: number;
  session: number | null;
  limits: Limits | null;
  bids: Level[];
  asks: Level[];
  stats: Stats | null;
  seq: number;
  last: number | null;
  lastDir: 1 | 0 | -1;
  series: Sample[];
  tape: TapeRow[];
  orders: OpenOrder[];
  lat: Latency;
  toasts: Toast[];
};

const initial: LiveState = {
  status: "connecting",
  attempt: 0,
  session: null,
  limits: null,
  bids: [],
  asks: [],
  stats: null,
  seq: 0,
  last: null,
  lastDir: 0,
  series: [],
  tape: [],
  orders: [],
  lat: { engine_ns: null, queue_ns: null, rtt_ms: null, rtt_hist: [] },
  toasts: [],
};

let state: LiveState = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const getState = () => state;
export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Subscribe a component to one slice. The selector must return a stable value (a field, not a new object). */
export function useLive<T>(select: (s: LiveState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initial),
  );
}

/* ---------- actions, called by the socket ---------- */

let nextId = 1;

export function setStatus(status: Status, attempt = 0) {
  if (status === "open") set({ status, attempt: 0 });
  else set({ status, attempt });
}

export function onHello(session: number, limits: Limits) {
  set({ session, limits });
}

// Trades arrive ~1000/s. They are summed into one pending bucket and flushed to the tape on a timer.
type Pending = { qty: number; notional: number; count: number; buy: number; sell: number; last: number };
let pending: Pending | null = null;

export function onBook(seq: number, bids: Level[], asks: Level[], trades: Trade[], stats: Stats) {
  let { last, lastDir } = state;
  for (const t of trades) {
    pending ??= { qty: 0, notional: 0, count: 0, buy: 0, sell: 0, last: t.price };
    pending.qty += t.qty;
    pending.notional += t.price * t.qty;
    pending.count += 1;
    if (t.side === "bid") pending.buy += t.qty;
    else pending.sell += t.qty;
    pending.last = t.price;
    if (last != null && t.price !== last) lastDir = t.price > last ? 1 : -1;
    last = t.price;
  }
  set({ bids, asks, stats, seq, last, lastDir });
}

export function flushTape(now: number) {
  if (!pending) return;
  const p = pending;
  pending = null;
  const row: TapeRow = {
    id: nextId++,
    t: now,
    price: Math.round(p.notional / p.qty),
    qty: p.qty,
    count: p.count,
    side: p.buy >= p.sell ? "bid" : "ask",
  };
  set({ tape: [row, ...state.tape].slice(0, TAPE_ROWS) });
}

export function sampleChart(now: number) {
  const { bids, asks, last, series } = state;
  if (!bids.length || !asks.length) return;
  const mid = (bids[0][0] + asks[0][0]) / 2;
  const next = series.length >= CHART_POINTS ? series.slice(series.length - CHART_POINTS + 1) : series.slice();
  next.push({ t: now, mid, last });
  set({ series: next });
}

export function onLatency(p: { engine_ns: number; queue_ns: number }) {
  set({ lat: { ...state.lat, engine_ns: p.engine_ns, queue_ns: p.queue_ns } });
}

export function onRtt(ms: number) {
  const hist = [...state.lat.rtt_hist, ms].slice(-30);
  set({ lat: { ...state.lat, rtt_ms: ms, rtt_hist: hist } });
}

export function addOrder(o: OpenOrder) {
  set({ orders: [o, ...state.orders.filter((x) => x.id !== o.id)] });
}

export function updateOrder(id: number, remaining: number) {
  set({ orders: state.orders.map((o) => (o.id === id ? { ...o, remaining } : o)) });
}

export function removeOrder(id: number) {
  if (state.orders.some((o) => o.id === id)) set({ orders: state.orders.filter((o) => o.id !== id) });
}

export function clearOrders() {
  if (state.orders.length) set({ orders: [] });
}

/** The server cancels a visitor's orders when the socket closes, so the book view empties too. */
export function goneOffline() {
  set({ orders: [], stats: null, lat: { ...state.lat, rtt_ms: null } });
}

export function toast(kind: Toast["kind"], text: string) {
  const t: Toast = { id: nextId++, kind, text };
  set({ toasts: [...state.toasts, t].slice(-4) });
  setTimeout(() => dismissToast(t.id), 4000);
}

export function dismissToast(id: number) {
  set({ toasts: state.toasts.filter((t) => t.id !== id) });
}



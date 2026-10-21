"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { CHART_POINTS } from "@/lib/live/config";
import { fmtClock, fmtPrice } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

const W = 1000;
const H = 400;
const GRID = 4;
const X_LABELS = [0.1, 0.3, 0.5, 0.7, 0.9];

/** Everything the store keeps: samples × 250 ms. */
const WINDOW_MS = CHART_POINTS * 250;

/** Candle size (top toolbar). */
const INTERVALS = [
  { label: "1s", ms: 1_000 },
  { label: "5s", ms: 5_000 },
  { label: "15s", ms: 15_000 },
  { label: "30s", ms: 30_000 },
] as const;

/** Visible window (bottom bar). "All" = whatever the store holds. */
const RANGES = [
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
  { label: "All", ms: WINDOW_MS },
] as const;

/** A candle needs at least this many slots in the window to look like a chart. */
const MIN_CANDLES = 4;

type Candle = { t: number; o: number; h: number; l: number; c: number };

/** Fold the mid-price samples into OHLC candles of `bucketMs`. */
function toCandles(series: { t: number; mid: number }[], bucketMs: number, max: number): Candle[] {
  const out: Candle[] = [];
  for (const { t, mid } of series) {
    const bucket = Math.floor(t / bucketMs) * bucketMs;
    const cur = out[out.length - 1];
    if (cur && cur.t === bucket) {
      if (mid > cur.h) cur.h = mid;
      if (mid < cur.l) cur.l = mid;
      cur.c = mid;
    } else {
      out.push({ t: bucket, o: mid, h: mid, l: mid, c: mid });
    }
  }
  return out.slice(-max);
}

const btn = "rounded-md px-2 py-1 transition-colors";
const on = "bg-white/10 font-semibold text-white";
const off = "text-white/40 hover:text-white/70";

export function PriceChart() {
  const series = useLive((s) => s.series);
  const [hover, setHover] = useState<number | null>(null);
  const [bucketMs, setBucketMs] = useState<number>(5_000);
  const [rangeMs, setRangeMs] = useState<number>(WINDOW_MS);

  const maxCandles = Math.ceil(rangeMs / bucketMs) + 1;

  const candles = useMemo(
    () => (series.length >= 2 ? toCandles(series, bucketMs, maxCandles) : []),
    [series, bucketMs, maxCandles],
  );
  const m = candles.length;

  const view = useMemo(() => {
    if (!m) return null;
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of candles) {
      if (c.l < lo) lo = c.l;
      if (c.h > hi) hi = c.h;
    }
    const span = Math.max(hi - lo, 6);
    const pad = span * 0.15;
    lo = (lo + hi) / 2 - span / 2 - pad;
    hi = lo + span + pad * 2;
    const slot = W / maxCandles;
    const x = (i: number) => (i + maxCandles - m + 0.5) * slot;
    const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
    return { lo, hi, x, y, bodyW: slot * 0.6 };
  }, [candles, m, maxCandles]);

  const pickRange = (ms: number) => {
    setRangeMs(ms);
    // keep the candle size valid for the new window
    if (ms / bucketMs < MIN_CANDLES) {
      const fit = [...INTERVALS].reverse().find((i) => ms / i.ms >= MIN_CANDLES);
      if (fit) setBucketMs(fit.ms);
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    const i = Math.floor(f * maxCandles) - (maxCandles - m);
    setHover(i >= 0 && i < m ? i : null);
  };

  const lastCandle = m ? candles[m - 1] : null;
  const prevClose = m > 1 ? candles[m - 2].c : lastCandle?.o ?? 0;
  const change = lastCandle ? lastCandle.c - prevClose : 0;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  const up = change >= 0;
  const dirColor = up ? "var(--color-up)" : "var(--color-down)";
  const lastColor = lastCandle && lastCandle.c < lastCandle.o ? "var(--color-down)" : "var(--color-up)";
  const hc = hover != null ? candles[hover] : null;
  const intervalLabel = INTERVALS.find((i) => i.ms === bucketMs)?.label ?? "";

  return (
    <Panel title="Mid price" right={`${intervalLabel} candles`} className="h-full">
      {/* (a) toolbar: candle interval */}
      <div className="flex items-center gap-1 px-3 pt-3 text-[11px]">
        {INTERVALS.map((i) => {
          const disabled = rangeMs / i.ms < MIN_CANDLES;
          return (
            <button
              key={i.label}
              type="button"
              disabled={disabled}
              onClick={() => setBucketMs(i.ms)}
              className={`${btn} ${bucketMs === i.ms ? on : off} disabled:cursor-not-allowed disabled:opacity-30`}
            >
              {i.label}
            </button>
          );
        })}
      </div>

      {/* (b) symbol row + OHLC of the newest candle */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pb-2 pt-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-white">LOB/USD</span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">{intervalLabel}</span>
          {lastCandle && (
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-up)]/15 px-2 py-[3px]">
              <span className="size-1.5 rounded-full bg-[color:var(--color-up)]" />
              <span className="text-[9px] font-semibold tracking-[0.14em] text-[color:var(--color-up)]">LIVE</span>
            </span>
          )}
        </div>
        {lastCandle && (
          <div className="tabular flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px]">
            <span className="text-white/40">O</span>
            <span className="text-white/70">{fmtPrice(lastCandle.o)}</span>
            <span className="text-white/40">H</span>
            <span className="text-white/70">{fmtPrice(lastCandle.h)}</span>
            <span className="text-white/40">L</span>
            <span className="text-white/70">{fmtPrice(lastCandle.l)}</span>
            <span className="text-white/40">C</span>
            <span className="font-medium text-white">{fmtPrice(lastCandle.c)}</span>
            <span className="ml-1" style={{ color: dirColor }}>
              {up ? "+" : ""}
              {fmtPrice(change)} ({up ? "+" : ""}
              {changePct.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* (c) candlestick chart */}
      <div
        className="relative h-[240px] touch-pan-y select-none sm:h-[280px]"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {!view || !lastCandle ? (
          <div className="flex h-full items-center justify-center text-xs text-white/40">Waiting for data…</div>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {Array.from({ length: GRID + 1 }, (_, i) => (
                <line
                  key={i}
                  x1="0"
                  x2={W}
                  y1={(H / GRID) * i}
                  y2={(H / GRID) * i}
                  stroke="white"
                  strokeOpacity="0.07"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {X_LABELS.map((f) => (
                <line
                  key={f}
                  x1={f * W}
                  x2={f * W}
                  y1="0"
                  y2={H}
                  stroke="white"
                  strokeOpacity="0.04"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {hc && hover != null && (
                <rect
                  x={view.x(hover) - view.bodyW}
                  y="0"
                  width={view.bodyW * 2}
                  height={H}
                  fill="white"
                  fillOpacity="0.05"
                />
              )}

              {candles.map((c, i) => {
                const color = c.c >= c.o ? "var(--color-up)" : "var(--color-down)";
                const cx = view.x(i);
                const top = view.y(Math.max(c.o, c.c));
                const bodyH = Math.max(1.5, Math.abs(view.y(c.o) - view.y(c.c)));
                return (
                  <g key={c.t}>
                    <line
                      x1={cx}
                      x2={cx}
                      y1={view.y(c.h)}
                      y2={view.y(c.l)}
                      stroke={color}
                      strokeWidth="1.2"
                      vectorEffect="non-scaling-stroke"
                    />
                    <rect x={cx - view.bodyW / 2} y={top} width={view.bodyW} height={bodyH} fill={color} />
                  </g>
                );
              })}

              <line
                x1="0"
                x2={W}
                y1={view.y(lastCandle.c)}
                y2={view.y(lastCandle.c)}
                stroke={lastColor}
                strokeOpacity="0.7"
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {Array.from({ length: GRID + 1 }, (_, i) => (
              <span
                key={i}
                className="tabular pointer-events-none absolute right-2 -translate-y-1/2 font-mono text-[10px] text-white/40"
                style={{ top: `${(100 / GRID) * i}%` }}
              >
                {fmtPrice(view.hi - ((view.hi - view.lo) / GRID) * i)}
              </span>
            ))}

            <span
              className="tabular pointer-events-none absolute left-2 -translate-y-1/2 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black"
              style={{ top: `${(view.y(lastCandle.c) / H) * 100}%`, background: lastColor }}
            >
              {fmtPrice(lastCandle.c)}
            </span>

            {hc && hover != null && (
              <div
                className="pointer-events-none absolute top-2 rounded border border-white/15 bg-black/90 px-2 py-1 font-mono text-[11px]"
                style={{ left: `clamp(8px, calc(${(view.x(hover) / W) * 100}% - 56px), calc(100% - 140px))` }}
              >
                <div className="tabular grid grid-cols-[auto_auto] gap-x-2 text-white">
                  <span className="text-white/45">O</span>
                  <span>{fmtPrice(hc.o)}</span>
                  <span className="text-white/45">H</span>
                  <span>{fmtPrice(hc.h)}</span>
                  <span className="text-white/45">L</span>
                  <span>{fmtPrice(hc.l)}</span>
                  <span className="text-white/45">C</span>
                  <span>{fmtPrice(hc.c)}</span>
                </div>
                <div className="text-white/45">{fmtClock(hc.t)}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* (d) x-axis time labels, from the candle under each gridline */}
      <div className="relative h-5">
        {view &&
          X_LABELS.map((f) => {
            const idx = Math.floor(f * maxCandles) - (maxCandles - m);
            if (idx < 0 || idx >= m) return null;
            return (
              <span
                key={f}
                style={{ left: `${f * 100}%` }}
                className="absolute top-0.5 -translate-x-1/2 font-mono text-[10px] text-white/35"
              >
                {fmtClock(candles[idx].t)}
              </span>
            );
          })}
      </div>

      {/* (e) footer: visible window */}
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => pickRange(r.ms)}
              className={`${btn} ${rangeMs === r.ms ? on : off}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <span className="text-white/35">
          {m} candles · {Math.round(((m * bucketMs) / 1000) * 10) / 10} s
        </span>
      </div>
    </Panel>
  );
}
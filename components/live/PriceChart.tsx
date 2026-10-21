"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { CHART_POINTS } from "@/lib/live/config";
import { fmtClock, fmtPrice } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

const W = 1000;
const H = 400;
const GRID = 4;

/** Each candle aggregates this many ms of 250 ms mid-price samples. */
const BUCKET_MS = 5_000;
/** Candle slots across the chart (same visible window as the old line chart). */
const MAX_CANDLES = Math.ceil((CHART_POINTS * 250) / BUCKET_MS) + 1;

type Candle = { t: number; o: number; h: number; l: number; c: number };

/** Fold the mid-price samples into OHLC candles. */
function toCandles(series: { t: number; mid: number }[]): Candle[] {
  const out: Candle[] = [];
  for (const { t, mid } of series) {
    const bucket = Math.floor(t / BUCKET_MS) * BUCKET_MS;
    const cur = out[out.length - 1];
    if (cur && cur.t === bucket) {
      if (mid > cur.h) cur.h = mid;
      if (mid < cur.l) cur.l = mid;
      cur.c = mid;
    } else {
      out.push({ t: bucket, o: mid, h: mid, l: mid, c: mid });
    }
  }
  return out.slice(-MAX_CANDLES);
}

/** Candlestick chart of the mid price, built in the browser from the book feed. */
export function PriceChart() {
  const series = useLive((s) => s.series);
  const last = useLive((s) => s.last);
  const [hover, setHover] = useState<number | null>(null);

  const candles = useMemo(() => (series.length >= 2 ? toCandles(series) : []), [series]);
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
    const slot = W / MAX_CANDLES;
    // newest candle sits at the right edge, history slides left
    const x = (i: number) => (i + MAX_CANDLES - m + 0.5) * slot;
    const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
    return { lo, hi, x, y, bodyW: slot * 0.6 };
  }, [candles, m]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    const i = Math.floor(f * MAX_CANDLES) - (MAX_CANDLES - m);
    setHover(i >= 0 && i < m ? i : null);
  };

  const lastCandle = m ? candles[m - 1] : null;
  const lastColor = lastCandle && lastCandle.c < lastCandle.o ? "var(--color-down)" : "var(--color-up)";
  const hc = hover != null ? candles[hover] : null;

  return (
    <Panel title="Mid price" right={`${BUCKET_MS / 1000} s candles`} className="h-full">
      <div
        className="relative h-[260px] touch-pan-y select-none sm:h-[300px]"
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

              {/* last price line */}
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
              className="tabular pointer-events-none absolute left-2 -translate-y-1/2 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black"
              style={{ top: `${(view.y(lastCandle.c) / H) * 100}%` }}
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
      <div className="flex justify-between border-t border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/35">
        <span>−{Math.round(((CHART_POINTS * 0.25) / 60) * 10) / 10} min</span>
        <span>Last trade {last != null ? fmtPrice(last) : "–"}</span>
        <span>now</span>
      </div>
    </Panel>
  );
}
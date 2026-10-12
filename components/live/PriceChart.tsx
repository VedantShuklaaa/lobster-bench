"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { CHART_POINTS } from "@/lib/live/config";
import { fmtClock, fmtPrice } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

const W = 1000;
const H = 400;
const GRID = 4;

/** Mid price over the last couple of minutes, sampled in the browser from the book feed. */
export function PriceChart() {
  const series = useLive((s) => s.series);
  const last = useLive((s) => s.last);
  const [hover, setHover] = useState<number | null>(null);
  const n = series.length;

  const view = useMemo(() => {
    if (n < 2) return null;
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of series) {
      if (p.mid < lo) lo = p.mid;
      if (p.mid > hi) hi = p.mid;
    }
    const span = Math.max(hi - lo, 6);
    const pad = span * 0.15;
    lo = (lo + hi) / 2 - span / 2 - pad;
    hi = lo + span + pad * 2;
    const x = (i: number) => ((i + CHART_POINTS - n) / (CHART_POINTS - 1)) * W;
    const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
    let d = "";
    series.forEach((p, i) => {
      d += `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.mid).toFixed(1)}`;
    });
    const area = `${d}L${W} ${H}L${x(0).toFixed(1)} ${H}Z`;
    return { lo, hi, x, y, d, area, up: series[n - 1].mid >= series[0].mid };
  }, [series, n]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    const i = Math.round(f * (CHART_POINTS - 1)) - (CHART_POINTS - n);
    setHover(i >= 0 && i < n ? i : null);
  };

  const color = view?.up === false ? "var(--color-down)" : "var(--color-up)";
  const hp = hover != null ? series[hover] : null;
  const lastMid = n ? series[n - 1].mid : null;

  return (
    <Panel title="Mid price" right="250 ms samples" className="h-full">
      <div
        className="relative h-[260px] touch-pan-y select-none sm:h-[300px]"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {!view ? (
          <div className="flex h-full items-center justify-center text-xs text-white/40">Waiting for data…</div>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
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
              <path d={view.area} fill="url(#chart-fill)" />
              <path d={view.d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              {hp && hover != null && (
                <line
                  x1={view.x(hover)}
                  x2={view.x(hover)}
                  y1="0"
                  y2={H}
                  stroke="white"
                  strokeOpacity="0.3"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
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

            {lastMid != null && (
              <span
                className="tabular pointer-events-none absolute left-2 -translate-y-1/2 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black"
                style={{ top: `${(view.y(lastMid) / H) * 100}%` }}
              >
                {fmtPrice(lastMid)}
              </span>
            )}

            {hp && hover != null && (
              <div
                className="pointer-events-none absolute top-2 rounded border border-white/15 bg-black/90 px-2 py-1 font-mono text-[11px]"
                style={{ left: `clamp(8px, calc(${(view.x(hover) / W) * 100}% - 56px), calc(100% - 128px))` }}
              >
                <div className="tabular text-white">{fmtPrice(hp.mid)}</div>
                <div className="text-white/45">{fmtClock(hp.t)}</div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between border-t border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/35">
        <span>−{Math.round((CHART_POINTS * 0.25) / 60 * 10) / 10} min</span>
        <span>Last trade {last != null ? fmtPrice(last) : "–"}</span>
        <span>now</span>
      </div>
    </Panel>
  );
}

/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.9b9b63d3
 */
import {
  CalendarDotsIcon,
  CameraIcon,
  ChartLineIcon,
  CornersOutIcon,
  FadersHorizontalIcon,
} from "@phosphor-icons/react/ssr";

import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** Animation-name prefix — keeps this keyframe off the shared sheet. */
const KEY = "trading-chart";

const UP = "#64b07a";
const DOWN = "#c36d68";

/** One candle. `t` is a unix timestamp in ms, `v` is raw volume. */
export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type TradingChartProps = {
  candles?: Candle[];
  /** Pair label, e.g. "SOL/USDC" */
  symbol?: string;
  /** Timeframe label, e.g. "1D" */
  interval?: string;
  /** Subtitle next to the timeframe, e.g. "Solana" */
  name?: string;
  /** Pulses the last candle + price tag. */
  live?: boolean;
};

/* ---------- demo data (used when no `candles` prop is passed) ---------- */

const DEMO_OHLC: [number, number, number, number][] = [
  [147.6, 148.3, 147.2, 147.9], [147.9, 148.2, 147.1, 147.5],
  [147.5, 148.1, 147.3, 147.8], [147.8, 148.0, 147.0, 147.4],
  [147.4, 148.4, 147.2, 148.1], [148.1, 149.2, 147.9, 148.9],
  [148.9, 149.9, 148.6, 149.6], [149.6, 149.9, 148.9, 149.2],
  [149.2, 150.4, 149.0, 150.1], [150.1, 151.3, 149.8, 150.9],
  [150.9, 152.0, 150.6, 151.6], [151.6, 151.9, 150.9, 151.2],
  [151.2, 152.6, 151.0, 152.3], [152.3, 153.5, 152.0, 153.1],
  [153.1, 154.2, 152.9, 153.8], [153.8, 154.1, 153.1, 153.4],
  [153.4, 154.6, 153.2, 154.2], [154.2, 155.2, 154.0, 154.8],
  [154.8, 155.1, 154.2, 154.5], [154.5, 155.3, 154.3, 155.0],
  [155.0, 155.2, 154.1, 154.4], [154.4, 155.2, 154.2, 154.9],
  [154.9, 155.0, 153.9, 154.2], [154.2, 154.4, 153.2, 153.5],
  [153.5, 154.2, 153.3, 153.9], [153.9, 154.0, 152.6, 153.0],
  [153.0, 153.1, 151.8, 152.2], [152.2, 152.4, 151.1, 151.5],
  [151.5, 152.2, 151.2, 151.9], [151.9, 152.0, 150.8, 151.1],
  [151.1, 152.0, 150.9, 151.7], [151.7, 152.8, 151.4, 152.5],
  [152.5, 153.7, 152.2, 153.4], [153.4, 154.5, 153.1, 154.1],
  [154.1, 154.3, 153.3, 153.6], [153.6, 153.8, 152.5, 152.9],
  [152.9, 153.0, 152.1, 152.4], [152.4, 153.5, 152.2, 153.2],
  [153.2, 154.7, 153.0, 154.3], [154.3, 155.9, 154.1, 155.5],
  [155.5, 157.1, 155.3, 156.7], [156.7, 157.0, 155.8, 156.2],
  [156.2, 157.7, 156.0, 157.3], [157.3, 158.2, 157.0, 157.9],
  [157.78, 158.5, 156.88, 156.89],
];

const DEMO_VOLUMES = [
  0.9, 1.2, 1.1, 1.3, 0.8, 0.7, 1.6, 1.4, 2.2, 1.5, 1.2, 1.0, 1.4, 1.3, 1.5,
  0.9, 1.1, 1.4, 1.2, 0.8, 0.7, 1.2, 1.5, 1.3, 1.6, 1.1, 1.4, 1.7, 1.3, 1.0,
  1.5, 1.8, 1.4, 2.8, 2.4, 1.2, 1.5, 1.9, 2.6, 2.1, 3.42, 1.6, 1.3, 2.3, 1.47,
];

const DAY = 86_400_000;
const DEMO_START = Date.UTC(2026, 2, 23);
const DEMO_CANDLES: Candle[] = DEMO_OHLC.map(([o, h, l, c], i) => ({
  t: DEMO_START + i * DAY,
  o,
  h,
  l,
  c,
  v: DEMO_VOLUMES[i] * 1_000_000,
}));

/* ---------- layout ---------- */

const VB_W = 620;
const PLOT_W = 560;
const PLOT_H = 210;
const VOL_H = 46;
const GRID_FRACTIONS = [0.065, 0.225, 0.385, 0.545, 0.705, 0.865];

/* ---------- helpers ---------- */

const fmtPrice = (v: number) => v.toFixed(2);

function fmtVolume(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
  return v.toFixed(0);
}

const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

/** Round tick values that fall inside [min, max]. */
function niceTicks(min: number, max: number, count = 4) {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function Caret({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 5" aria-hidden="true" className={cn("h-1.5 w-2", className)}>
      <path d="M0.5 0.5 L4 4.5 L7.5 0.5 Z" fill="currentColor" />
    </svg>
  );
}

export function TradingChart({
  candles = DEMO_CANDLES,
  symbol = "NRWD/TSSD",
  interval = "1D",
  name = "Northwind",
  live = true,
}: TradingChartProps) {
  if (!candles.length) return null;

  const n = candles.length;
  const slot = PLOT_W / n;
  const bodyW = Math.max(1, slot * 0.56);
  const xOf = (i: number) => i * slot + slot / 2;

  /* price scale — derived from the data, with 8% headroom */
  const lo = Math.min(...candles.map((c) => c.l));
  const hi = Math.max(...candles.map((c) => c.h));
  const pad = (hi - lo || 1) * 0.08;
  const yMin = lo - pad;
  const yMax = hi + pad;
  const yOf = (v: number) => ((yMax - v) / (yMax - yMin)) * PLOT_H;
  const yTicks = niceTicks(yMin, yMax, 4);

  /* last candle + change vs previous close */
  const last = candles[n - 1];
  const prevClose = n > 1 ? candles[n - 2].c : last.o;
  const change = last.c - prevClose;
  const changePct = (change / prevClose) * 100;
  const lastUp = last.c >= last.o;
  const lastColor = lastUp ? UP : DOWN;
  const yLast = yOf(last.c);

  /* volume + SMA 20 */
  const maxVol = Math.max(...candles.map((c) => c.v)) || 1;
  const sma = candles.map((_, i) => {
    const from = Math.max(0, i - 19);
    const slice = candles.slice(from, i + 1);
    return slice.reduce((s, c) => s + c.v, 0) / slice.length;
  });
  const smaPoints = sma
    .map((v, i) => `${xOf(i).toFixed(1)},${(VOL_H - (v / maxVol) * 44).toFixed(1)}`)
    .join(" ");

  /* gridlines + date labels share the same candle indices so they line up */
  const gridIdx = GRID_FRACTIONS.map((f) => Math.min(n - 1, Math.floor(f * n)));

  return (
    <div className="stroke-lit w-full max-w-2xl rounded-xl bg-stage-2 text-[11px] shadow-2xl shadow-black/40">
      {/* (a) tabs */}
      <Tabs items={["Chart", "Funding"]} className="px-4 pt-3" />

      {/* (b) toolbar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <button type="button" className="text-fg-muted interactive hover:text-fg-secondary">
          5m
        </button>
        <button type="button" className="text-fg-muted interactive hover:text-fg-secondary">
          1h
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-border-strong px-2.5 py-1 font-medium text-fg"
        >
          D
          <Caret className="text-fg" />
        </button>
        <ChartLineIcon className="ml-2 size-4 text-fg-secondary" />
        <label className="ml-1 flex items-center gap-2.5 text-fg-secondary">
          <FadersHorizontalIcon className="size-4" />
          Indicators
        </label>
        <div className="ml-auto flex items-center gap-4 text-fg-secondary">
          <CameraIcon className="size-4" />
          <CornersOutIcon className="size-4" />
        </div>
      </div>

      {/* (c) symbol row — OHLC reads from the last candle */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pb-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-semibold text-fg">{symbol}</span>
          <span className="text-fg-muted">·</span>
          <span className="text-fg-muted">{interval}</span>
          <span className="text-fg-muted">·</span>
          <span className="text-fg-muted">{name}</span>
          {live && (
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-pill bg-positive-bg px-2 py-[3px]">
              <span className="size-1.5 rounded-full bg-code-add" />
              <span className="text-[9px] font-semibold tracking-[0.14em] text-code-add">
                LIVE
              </span>
            </span>
          )}
        </div>
        <div className="scroll-track flex max-w-full items-center gap-1.5 whitespace-nowrap text-[10.5px] tabular-nums">
          <span className="text-fg-muted">O</span>
          <span className="text-fg-secondary">{fmtPrice(last.o)}</span>
          <span className="text-fg-muted">H</span>
          <span className="text-fg-secondary">{fmtPrice(last.h)}</span>
          <span className="text-fg-muted">L</span>
          <span className="text-fg-secondary">{fmtPrice(last.l)}</span>
          <span className="text-fg-muted">C</span>
          <span className="font-medium text-fg">{fmtPrice(last.c)}</span>
          <span className={cn("ml-1", change >= 0 ? "text-code-add" : "text-code-del")}>
            {change >= 0 ? "+" : ""}
            {fmtPrice(change)} ({changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* (d) candlestick chart */}
      <div className="px-2">
        <svg viewBox={`0 0 ${VB_W} ${PLOT_H}`} className="h-auto w-full" aria-hidden="true">
          {/* horizontal gridlines + y labels from nice ticks */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={0}
                x2={PLOT_W}
                y1={yOf(v)}
                y2={yOf(v)}
                stroke="currentColor"
                strokeOpacity={0.05}
                strokeWidth={1}
              />
              <text
                x={566}
                y={yOf(v) + 3}
                fill="var(--color-fg-muted)"
                fontSize={9.5}
              >
                {fmtPrice(v)}
              </text>
            </g>
          ))}
          {/* vertical gridlines */}
          {gridIdx.map((i) => (
            <line
              key={i}
              x1={xOf(i)}
              x2={xOf(i)}
              y1={0}
              y2={PLOT_H}
              stroke="currentColor"
              strokeOpacity={0.04}
              strokeWidth={1}
            />
          ))}
          <style>{`
            @keyframes ${KEY}-tick {
              0%, 100% { transform: translateY(0); }
              38%      { transform: translateY(-2.1px); }
              72%      { transform: translateY(1.4px); }
            }
            .${KEY}-tick {
              animation: ${KEY}-tick 3400ms ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .${KEY}-tick { animation: none; }
            }
          `}</style>
          {/* candles: wick (high→low) + body (open↔close) */}
          {candles.map(({ o, h, l, c }, i) => {
            const x = xOf(i);
            const color = c >= o ? UP : DOWN;
            const bodyTop = yOf(Math.max(o, c));
            const bodyH = Math.max(1.5, Math.abs(yOf(o) - yOf(c)));
            const isLast = i === n - 1;
            return (
              <g key={i} className={live && isLast ? `${KEY}-tick` : undefined}>
                <line x1={x} x2={x} y1={yOf(h)} y2={yOf(l)} stroke={color} strokeWidth={1} />
                <rect
                  x={x - bodyW / 2}
                  y={bodyTop}
                  width={bodyW}
                  height={bodyH}
                  rx={1}
                  fill={color}
                />
              </g>
            );
          })}
          {/* last-price line + tag */}
          <g className={live ? `${KEY}-tick` : undefined}>
            <line
              x1={0}
              x2={PLOT_W}
              y1={yLast}
              y2={yLast}
              stroke={lastColor}
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <rect x={562} y={yLast - 8.5} width={54} height={17} rx={4} fill={lastColor} />
            <text
              x={589}
              y={yLast + 3.5}
              fill="#ffffff"
              fontSize={10}
              fontWeight={700}
              textAnchor="middle"
            >
              {fmtPrice(last.c)}
            </text>
          </g>
        </svg>

        {/* (e) volume */}
        <div className="mt-1 flex items-center gap-2 px-2 text-[10px] text-fg-muted">
          <span>Volume</span>
          <span className="ml-1 size-1.5 rounded-full bg-code-del" />
          <span>SMA 20</span>
          <span className="font-medium text-code-del">{fmtVolume(sma[n - 1])}</span>
        </div>
        <svg viewBox={`0 0 ${VB_W} 48`} className="h-auto w-full" aria-hidden="true">
          {gridIdx.map((i) => (
            <line
              key={i}
              x1={xOf(i)}
              x2={xOf(i)}
              y1={0}
              y2={VOL_H}
              stroke="currentColor"
              strokeOpacity={0.04}
              strokeWidth={1}
            />
          ))}
          {candles.map(({ o, c, v }, i) => {
            const barH = (v / maxVol) * 44;
            return (
              <rect
                key={i}
                x={xOf(i) - bodyW / 2}
                y={VOL_H - barH}
                width={bodyW}
                height={barH}
                fill={c >= o ? UP : DOWN}
                opacity={0.7}
              />
            );
          })}
          <polyline
            points={smaPoints}
            fill="none"
            stroke={DOWN}
            strokeWidth={1.2}
            className="graph-breathe"
          />
          <text x={566} y={11} fill="var(--color-fg-muted)" fontSize={9.5}>
            {fmtVolume(maxVol)}
          </text>
          <text x={566} y={VOL_H} fill="var(--color-fg-muted)" fontSize={9.5}>
            0
          </text>
        </svg>

        {/* (f) x-axis dates, aligned to the gridline candles */}
        <div className="relative h-5">
          {gridIdx.map((i) => (
            <span
              key={i}
              style={{ left: `${(xOf(i) / VB_W) * 100}%` }}
              className="absolute top-0 -translate-x-1/2 text-[10px] text-fg-muted"
            >
              {fmtDate(candles[i].t)}
            </span>
          ))}
        </div>
      </div>

      {/* (g) footer */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-border px-3 py-2 text-[10px] text-fg-muted">
        <div className="flex flex-wrap items-center gap-1">
          {["5y", "1y", "6m", "3m", "1m", "5d", "1d"].map((r) => (
            <button
              key={r}
              type="button"
              className={cn(
                "rounded-md px-1.5 py-1 interactive",
                r === "6m"
                  ? "bg-white/10 font-semibold text-fg"
                  : "hover:text-fg-secondary",
              )}
            >
              {r}
            </button>
          ))}
          <CalendarDotsIcon className="ml-2 size-3.5 text-fg-secondary" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <FadersHorizontalIcon className="size-3.5 text-fg-secondary" />
          <span>14:32:08</span>
          <span>UTC-4</span>
          <button type="button" className="interactive hover:text-fg-secondary">
            %
          </button>
          <button type="button" className="interactive hover:text-fg-secondary">
            log
          </button>
          <button
            type="button"
            className="rounded-md bg-white/10 px-1.5 py-1 font-semibold text-fg"
          >
            auto
          </button>
        </div>
      </div>
    </div>
  );
}
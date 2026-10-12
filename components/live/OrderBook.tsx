"use client";

import { useMemo } from "react";
import { fmtPrice } from "@/lib/live/format";
import type { Level } from "@/lib/live/protocol";
import { useLive } from "@/lib/live/store";
import { OrderBookRow } from "./OrderBookRow";
import { Panel } from "./Panel";

function withCum(levels: Level[]) {
  let c = 0;
  return levels.map(([price, qty]) => ({ price, qty, cum: (c += qty) }));
}

/** Asks in red above, bids in green below, the last price in between. Best prices sit next to the middle. */
export function OrderBook({ onPick }: { onPick: (price: number) => void }) {
  const bids = useLive((s) => s.bids);
  const asks = useLive((s) => s.asks);
  const last = useLive((s) => s.last);
  const dir = useLive((s) => s.lastDir);
  const orders = useLive((s) => s.orders);

  const askRows = useMemo(() => withCum(asks), [asks]);
  const bidRows = useMemo(() => withCum(bids), [bids]);
  const maxCum = Math.max(askRows.at(-1)?.cum ?? 0, bidRows.at(-1)?.cum ?? 0);
  const mine = useMemo(() => new Set(orders.map((o) => o.price)), [orders]);
  const spread = bids.length && asks.length ? asks[0][0] - bids[0][0] : null;
  const tone = dir > 0 ? "text-up" : dir < 0 ? "text-down" : "text-white";

  return (
    <Panel title="Order book" right="click a price to use it" className="h-full">
      <div className="grid grid-cols-3 px-3 py-1.5 text-right text-[10px] uppercase tracking-[0.12em] text-white/35">
        <span className="text-left">Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      <div className="flex flex-col justify-end">
        {[...askRows].reverse().map((r) => (
          <OrderBookRow key={r.price} side="ask" {...r} maxCum={maxCum} mine={mine.has(r.price)} onPick={onPick} />
        ))}
      </div>

      <div className="flex h-10 items-center justify-between border-y border-white/10 px-3">
        <span className={`tabular font-mono text-base font-semibold transition-colors ${tone}`}>
          {last != null ? fmtPrice(last) : "––"}
          <span className="ml-1.5 text-xs">{dir > 0 ? "▲" : dir < 0 ? "▼" : ""}</span>
        </span>
        <span className="text-[11px] text-white/45">Spread {spread != null ? fmtPrice(spread) : "–"}</span>
      </div>

      <div>
        {bidRows.map((r) => (
          <OrderBookRow key={r.price} side="bid" {...r} maxCum={maxCum} mine={mine.has(r.price)} onPick={onPick} />
        ))}
      </div>
    </Panel>
  );
}

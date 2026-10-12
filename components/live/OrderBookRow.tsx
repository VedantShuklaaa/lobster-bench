"use client";

import { memo, useEffect, useRef } from "react";
import { fmtPrice, fmtQty } from "@/lib/live/format";
import type { Side } from "@/lib/live/protocol";

type RowProps = {
  side: Side;
  price: number;
  qty: number;
  cum: number;
  maxCum: number;
  mine: boolean;
  onPick: (price: number) => void;
};

/** One price level. The bar is cumulative depth; the cell flashes when the size changes. */
export const OrderBookRow = memo(function OrderBookRow({ side, price, qty, cum, maxCum, mine, onPick }: RowProps) {
  const prev = useRef(qty);
  const flash = qty > prev.current ? "flash-up" : qty < prev.current ? "flash-down" : "";
  useEffect(() => {
    prev.current = qty;
  }, [qty]);

  const color = side === "bid" ? "text-up" : "text-down";
  const bar = side === "bid" ? "bg-up/15" : "bg-down/15";

  return (
    <button
      type="button"
      onClick={() => onPick(price)}
      className="group relative grid h-6 w-full grid-cols-3 items-center px-3 text-right font-mono text-xs hover:bg-white/5"
    >
      <span
        className={`absolute inset-y-0 right-0 transition-[width] duration-200 ease-out ${bar}`}
        style={{ width: `${maxCum > 0 ? (cum / maxCum) * 100 : 0}%` }}
      />
      <span key={qty} className={`pointer-events-none absolute inset-0 ${flash}`} />
      <span className={`tabular relative flex items-center gap-1.5 text-left ${color}`}>
        {fmtPrice(price)}
        {mine && <span className="h-1.5 w-1.5 rounded-full bg-white" title="Your order" />}
      </span>
      <span className="tabular relative text-white/85">{fmtQty(qty)}</span>
      <span className="tabular relative text-white/45">{fmtQty(cum)}</span>
    </button>
  );
});

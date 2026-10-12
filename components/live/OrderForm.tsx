"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { fmtPrice, toTicks } from "@/lib/live/format";
import type { Side } from "@/lib/live/protocol";
import { liveSocket } from "@/lib/live/socket";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

type Kind = "limit" | "market";
const QUICK = [10, 50, 100, 500];

type OrderFormProps = {
  /** A price clicked in the order book, with a counter so clicking the same price twice still counts. */
  picked: { price: number; n: number } | null;
};

function Pill({ id, active, children, onClick, tone }: {
  id: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 py-2 text-sm font-medium transition-colors ${active ? "text-white" : "text-white/45 hover:text-white/75"}`}
    >
      {active && (
        <motion.span
          layoutId={id}
          className={`absolute inset-0 rounded-sm ${tone ?? "bg-white/10"}`}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

/** Buy/sell, limit/market, quantity. Checks the server's limits before sending. */
export function OrderForm({ picked }: OrderFormProps) {
  const status = useLive((s) => s.status);
  const limits = useLive((s) => s.limits);
  const bids = useLive((s) => s.bids);
  const asks = useLive((s) => s.asks);
  const openCount = useLive((s) => s.orders.length);

  const [kind, setKind] = useState<Kind>("limit");
  const [side, setSide] = useState<Side>("bid");
  const [priceText, setPriceText] = useState("");
  const [qtyText, setQtyText] = useState("10");

  const mid = bids.length && asks.length ? (bids[0][0] + asks[0][0]) / 2 : null;

  // Start the price at the mid, once.
  useEffect(() => {
    if (mid != null && priceText === "") setPriceText(fmtPrice(Math.round(mid)));
  }, [mid, priceText]);

  // Follow clicks on the order book.
  useEffect(() => {
    if (picked) {
      setPriceText(fmtPrice(picked.price));
      setKind("limit");
    }
  }, [picked]);

  const qty = Number(qtyText);
  const price = Number(priceText);
  const maxQty = limits?.max_qty ?? 500;
  const band = limits?.price_band ?? 200;

  const problem = useMemo(() => {
    if (status !== "open") return "Not connected";
    if (!Number.isInteger(qty) || qty < 1) return "Enter a whole quantity of at least 1";
    if (qty > maxQty) return `Quantity is limited to ${maxQty}`;
    if (openCount >= (limits?.max_open_orders ?? 20) && kind === "limit") return "Open order limit reached";
    if (kind === "limit") {
      if (!Number.isFinite(price) || price <= 0) return "Enter a price";
      if (mid != null && Math.abs(toTicks(price) - mid) > band) {
        return `Price must be within ${fmtPrice(band)} of the market`;
      }
    }
    return null;
  }, [status, qty, maxQty, kind, price, mid, band, openCount, limits]);

  const submit = () => {
    if (problem) return;
    if (kind === "limit") liveSocket.limit(side, toTicks(price), qty);
    else liveSocket.market(side, qty);
  };

  const step = (dir: 1 | -1) => setPriceText(((Number.isFinite(price) ? price : 0) + dir * 0.01).toFixed(2));
  const buy = side === "bid";

  return (
    <Panel title="Place order" delay={0.1} right={`max ${maxQty} per order`}>
      <div className="grid gap-4 p-3 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="flex rounded-sm bg-white/[0.04] p-0.5">
          <Pill id="side" active={buy} tone="bg-up/25" onClick={() => setSide("bid")}>Buy</Pill>
          <Pill id="side" active={!buy} tone="bg-down/25" onClick={() => setSide("ask")}>Sell</Pill>
        </div>

        <div className="flex border-b border-white/10 text-sm">
          {(["limit", "market"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`relative px-3 pb-2 capitalize transition-colors ${kind === k ? "text-white" : "text-white/45 hover:text-white/75"}`}
            >
              {k}
              {kind === k && <motion.span layoutId="kind" className="absolute inset-x-0 -bottom-px h-px bg-white" />}
            </button>
          ))}
        </div>

        <p className="hidden min-h-4 text-[11px] text-white/40 lg:block">{problem && status === "open" ? problem : "\u00a0"}</p>
      </div>
      <div className="flex flex-col gap-3">
        {kind === "limit" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/40">Price</span>
            <span className="flex items-center rounded-sm border border-white/15 focus-within:border-white/50">
              <input
                inputMode="decimal"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                className="tabular w-full bg-transparent px-3 py-2 font-mono text-sm outline-none"
              />
              <button type="button" aria-label="Lower price" onClick={() => step(-1)} className="px-3 text-white/50 hover:text-white">−</button>
              <button type="button" aria-label="Raise price" onClick={() => step(1)} className="px-3 text-white/50 hover:text-white">+</button>
            </span>
          </label>
        ) : (
          <p className="rounded-sm border border-white/10 px-3 py-2 text-xs text-white/50">
            Fills at the best available prices. Rejected if the other side is empty.
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-white/40">Quantity</span>
          <input
            inputMode="numeric"
            value={qtyText}
            onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, ""))}
            className="tabular rounded-sm border border-white/15 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-white/50"
          />
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQtyText(String(Math.min(q, maxQty)))}
              className="rounded-sm border border-white/10 py-1 font-mono text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={submit}
          disabled={problem !== null}
          whileTap={problem ? undefined : { scale: 0.98 }}
          className={`rounded-sm py-2.5 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-35 ${buy ? "bg-up" : "bg-down"}`}
        >
          {buy ? "Buy" : "Sell"} {kind === "limit" ? "limit" : "market"}
        </motion.button>

        <p className="min-h-4 text-[11px] text-white/40 lg:hidden">{problem && status === "open" ? problem : "\u00a0"}</p>
      </div>
      </div>
    </Panel>
  );
}

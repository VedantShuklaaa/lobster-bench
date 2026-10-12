"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TAPE_BUCKET_MS } from "@/lib/live/config";
import { fmtClock, fmtPrice, fmtQty } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

/** Public trades, grouped into 250 ms buckets because the simulated flow trades about 1000 times a second. */
export function TradesTape() {
  const tape = useLive((s) => s.tape);

  return (
    <Panel title="Trades" right={`grouped per ${TAPE_BUCKET_MS} ms`} className="h-full">
      <div className="grid grid-cols-3 px-3 py-1.5 text-right text-[10px] uppercase tracking-[0.12em] text-white/35">
        <span className="text-left">Price</span>
        <span>Size</span>
        <span>Time</span>
      </div>
      <ul className="max-h-[420px] overflow-hidden">
        <AnimatePresence initial={false}>
          {tape.map((r) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 22 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 items-center px-3 text-right font-mono text-xs"
              title={`${r.count} trades`}
            >
              <span className={`tabular text-left ${r.side === "bid" ? "text-up" : "text-down"}`}>{fmtPrice(r.price)}</span>
              <span className="tabular text-white/80">{fmtQty(r.qty)}</span>
              <span className="tabular text-white/40">{fmtClock(r.t)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {tape.length === 0 && <p className="px-3 py-6 text-center text-xs text-white/35">Waiting for trades…</p>}
    </Panel>
  );
}

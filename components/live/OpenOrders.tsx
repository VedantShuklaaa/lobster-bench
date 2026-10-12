"use client";

import { AnimatePresence, motion } from "framer-motion";
import { fmtPrice, fmtQty } from "@/lib/live/format";
import { liveSocket } from "@/lib/live/socket";
import { useLive } from "@/lib/live/store";
import { Panel } from "./Panel";

/** Your resting orders. They are cancelled by the server if you disconnect. */
export function OpenOrders() {
  const orders = useLive((s) => s.orders);
  const limit = useLive((s) => s.limits?.max_open_orders);

  return (
    <Panel title="Your open orders" right={limit ? `${orders.length} / ${limit}` : undefined} delay={0.15}>
      {orders.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-white/40">
          None yet. Place a limit order away from the market and it will rest in the book above.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-white/35">
                <th className="px-3 py-1.5 font-normal">Side</th>
                <th className="px-3 py-1.5 text-right font-normal">Price</th>
                <th className="px-3 py-1.5 text-right font-normal">Size</th>
                <th className="px-3 py-1.5 text-right font-normal">Remaining</th>
                <th className="px-3 py-1.5 font-normal">Filled</th>
                <th className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {orders.map((o) => {
                  const pct = ((o.qty - o.remaining) / o.qty) * 100;
                  return (
                    <motion.tr
                      key={o.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-white/5 font-mono"
                    >
                      <td className={`px-3 py-2 ${o.side === "bid" ? "text-up" : "text-down"}`}>{o.side === "bid" ? "Buy" : "Sell"}</td>
                      <td className="tabular px-3 py-2 text-right">{fmtPrice(o.price)}</td>
                      <td className="tabular px-3 py-2 text-right text-white/70">{fmtQty(o.qty)}</td>
                      <td className="tabular px-3 py-2 text-right">{fmtQty(o.remaining)}</td>
                      <td className="px-3 py-2">
                        <span className="block h-1 w-24 overflow-hidden rounded-full bg-white/10">
                          <motion.span className="block h-full bg-white/70" animate={{ width: `${pct}%` }} />
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => liveSocket.cancel(o.id)}
                          className="rounded-sm border border-white/15 px-2 py-0.5 text-white/70 transition-colors hover:bg-white hover:text-black"
                        >
                          Cancel
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

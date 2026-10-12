"use client";

import { AnimatePresence, motion } from "framer-motion";
import { fmtInt, fmtNs, fmtPrice, fmtUptime } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";
import { ConnectionBadge } from "./ConnectionBadge";
import { Stat } from "./Stat";

/** Top strip: last price, spread and the engine's own counters. */
export function TickerBar() {
  const last = useLive((s) => s.last);
  const dir = useLive((s) => s.lastDir);
  const bids = useLive((s) => s.bids);
  const asks = useLive((s) => s.asks);
  const stats = useLive((s) => s.stats);

  const bid = bids[0]?.[0];
  const ask = asks[0]?.[0];
  const spread = bid != null && ask != null ? ask - bid : null;
  const tone = dir > 0 ? "text-up" : dir < 0 ? "text-down" : "text-white";

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border border-white/10 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm font-semibold">LOB/USD</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={last ?? "none"}
            initial={{ opacity: 0.4, y: dir >= 0 ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`tabular font-mono text-2xl font-semibold transition-colors duration-300 ${tone}`}
          >
            {last != null ? fmtPrice(last) : "––"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="order-last grid w-full grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:order-none lg:w-auto lg:flex-1 lg:grid-cols-8">
        <Stat label="Best bid">
          <span className="text-up">{bid != null ? fmtPrice(bid) : "–"}</span>
        </Stat>
        <Stat label="Best ask">
          <span className="text-down">{ask != null ? fmtPrice(ask) : "–"}</span>
        </Stat>
        <Stat label="Spread">{spread != null ? fmtPrice(spread) : "–"}</Stat>
        <Stat label="Commands/s">{stats ? fmtInt(stats.cmds_per_sec) : "–"}</Stat>
        <Stat label="Resting orders">{stats ? fmtInt(stats.live_orders) : "–"}</Stat>
        <Stat label="Engine p50 / p99">{stats ? `${fmtNs(stats.apply_p50_ns)} / ${fmtNs(stats.apply_p99_ns)}` : "–"}</Stat>
        <Stat label="Visitors">{stats ? fmtInt(stats.visitors) : "–"}</Stat>
        <Stat label="Uptime">{stats ? fmtUptime(stats.uptime_s) : "–"}</Stat>
      </div>

      <div className="ml-auto lg:ml-0">
        <ConnectionBadge />
      </div>
    </div>
  );
}

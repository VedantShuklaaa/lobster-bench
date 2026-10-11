"use client";

import { motion, useReducedMotion } from "framer-motion";

type Level = { price: number; sizes: [number, number, number] };

// Illustrative depth, not live data. Each level breathes between three sizes (0 to 1).
const asks: Level[] = [
  { price: 105, sizes: [0.9, 0.55, 0.8] },
  { price: 104, sizes: [0.6, 0.85, 0.5] },
  { price: 103, sizes: [0.75, 0.45, 0.7] },
  { price: 102, sizes: [0.4, 0.7, 0.35] },
  { price: 101, sizes: [0.3, 0.2, 0.45] },
];
const bids: Level[] = [
  { price: 100, sizes: [0.35, 0.5, 0.25] },
  { price: 99, sizes: [0.5, 0.3, 0.6] },
  { price: 98, sizes: [0.7, 0.8, 0.5] },
  { price: 97, sizes: [0.55, 0.4, 0.75] },
  { price: 96, sizes: [0.85, 0.65, 0.9] },
];

function Row({ level, side, i }: { level: Level; side: "ask" | "bid"; i: number }) {
  const reduce = useReducedMotion();
  const [a, b, c] = level.sizes;
  const keyframes = reduce ? [a] : [a, b, c, a];
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-right font-mono text-xs text-white/50">{level.price}</span>
      <div className="h-3 flex-1">
        <motion.div
          className={side === "ask" ? "h-full rounded-sm bg-white" : "h-full rounded-sm border border-white/80"}
          initial={{ width: `${a * 100}%` }}
          animate={{ width: keyframes.map((v) => `${v * 100}%`) }}
          transition={{
            duration: 5 + i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

/** A decorative, animated order book: asks as solid bars, bids as outlines. */
export function LiveBook() {
  return (
    <div aria-hidden className="w-full max-w-sm select-none">
      <div className="space-y-2">
        {asks.map((l, i) => (
          <Row key={l.price} level={l} side="ask" i={i} />
        ))}
      </div>
      <div className="my-4 flex items-center gap-3">
        <span className="w-8" />
        <div className="h-px flex-1 bg-white/30" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">spread</span>
      </div>
      <div className="space-y-2">
        {bids.map((l, i) => (
          <Row key={l.price} level={l} side="bid" i={i + 5} />
        ))}
      </div>
      <p className="mt-6 pl-11 font-mono text-[10px] uppercase tracking-widest text-white/30">illustrative</p>
    </div>
  );
}

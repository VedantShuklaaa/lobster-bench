"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useLive } from "@/lib/live/store";

/** Shown when the server cannot be reached. The page never makes up numbers to fill the gap. */
export function OfflineOverlay() {
  const status = useLive((s) => s.status);
  const attempt = useLive((s) => s.attempt);
  const show = status === "offline" || (status === "connecting" && attempt >= 2);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-start justify-center bg-black/80 px-6 pt-32 backdrop-blur-[2px]"
        >
          <div className="max-w-sm text-center">
            <p className="text-lg font-semibold">The live engine is not reachable</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              This page shows a real order book running on a server, so there is nothing to show while it is down. Nothing here is
              simulated in your browser. Retrying{attempt > 1 ? ` (attempt ${attempt})` : ""}…
            </p>
            <Link href="/#evolution" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
              See the recorded benchmarks instead
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

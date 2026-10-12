"use client";

import { motion } from "framer-motion";
import { useLive } from "@/lib/live/store";

const LABEL = { open: "Live", connecting: "Connecting", offline: "Offline" } as const;
const DOT = { open: "bg-up", connecting: "bg-white/50", offline: "bg-down" } as const;

export function ConnectionBadge() {
  const status = useLive((s) => s.status);
  return (
    <span className="inline-flex items-center gap-2 text-xs text-white/80">
      <span className="relative flex h-2 w-2">
        {status !== "offline" && (
          <motion.span
            className={`absolute inset-0 rounded-full ${DOT[status]}`}
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className={`relative h-2 w-2 rounded-full ${DOT[status]}`} />
      </span>
      {LABEL[status]}
    </span>
  );
}

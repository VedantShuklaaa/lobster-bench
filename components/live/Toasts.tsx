"use client";

import { AnimatePresence, motion } from "framer-motion";
import { dismissToast, useLive } from "@/lib/live/store";

const BAR = { ok: "bg-white/60", fill: "bg-up", error: "bg-down" } as const;

export function Toasts() {
  const toasts = useLive((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto flex items-stretch overflow-hidden rounded-sm border border-white/15 bg-black text-left text-sm shadow-lg"
          >
            <span className={`w-1 ${BAR[t.kind]}`} />
            <span className="px-3 py-2">{t.text}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** The bordered box every part of the terminal sits in. */
export function Panel({ title, right, children, className = "", delay = 0 }: PanelProps) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`flex min-h-0 flex-col border border-white/10 bg-black ${className}`}
    >
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">{title}</h2>
        {right && <div className="text-[11px] text-white/45">{right}</div>}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </motion.section>
  );
}

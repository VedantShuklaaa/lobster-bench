"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type BarProps = {
  /** 0 to 1 */
  ratio: number;
  /** "solid" is a filled bar, "outline" is an empty one. */
  variant?: "solid" | "outline";
  delay?: number;
  className?: string;
};

/** A horizontal bar whose width animates in when visible, and again when `ratio` changes. */
export function Bar({ ratio, variant = "solid", delay = 0, className = "" }: BarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;

  return (
    <div ref={ref} className={`h-2.5 w-full rounded-full bg-white/10 ${className}`}>
      <motion.div
        className={
          variant === "solid"
            ? "h-full rounded-full bg-white"
            : "h-full rounded-full border border-white/80 bg-transparent"
        }
        initial={false}
        animate={{ width: inView ? width : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

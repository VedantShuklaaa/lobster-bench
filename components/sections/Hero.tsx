"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { fmtNs } from "@/lib/format";
import { headlineLatency, latestVersion } from "@/lib/results";
import { LiveBook } from "./LiveBook";

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{value}</div>
      <div className="mt-1 max-w-[16rem] text-xs leading-relaxed text-white/50">{label}</div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="top" className="flex min-h-screen items-center pt-14">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-16 px-6 py-24 md:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.p
            {...fade(0)}
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/50"
          >
            Limit order book matching engine in Rust
          </motion.p>
          <motion.h1
            {...fade(0.1)}
            className="mt-6 text-6xl font-semibold tracking-tighter md:text-8xl"
          >
            lobster
          </motion.h1>
          <motion.p {...fade(0.2)} className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Built to explore low-latency design: cache-friendly structures, an allocation-free hot path, and
            honest measurement. Every number here is a replay you can rerun.
          </motion.p>

          <motion.div {...fade(0.35)} className="mt-12 flex flex-wrap gap-x-12 gap-y-8">
            <Stat
              value={
                <>
                  <CountUp value={latestVersion.mops} /> <span className="text-lg text-white/50">M ops/s</span>
                </>
              }
              label={`Replay throughput, ${latestVersion.id}, Apple M5`}
            />
            {headlineLatency?.p50 !== undefined && (
              <Stat
                value={fmtNs(headlineLatency.p50)}
                label="Median latency through two pinned threads at 1 M/s, EC2 c5.xlarge"
              />
            )}
          </motion.div>
        </div>

        <motion.div {...fade(0.3)} className="md:justify-self-end">
          <LiveBook />
        </motion.div>
      </div>
    </section>
  );
}

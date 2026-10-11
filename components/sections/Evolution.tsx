"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar } from "@/components/ui/Bar";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { fmtMops } from "@/lib/format";
import { results } from "@/lib/results";

export function Evolution() {
  const { versions } = results;
  const max = Math.max(...versions.map((v) => v.mops));
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section
      id="evolution"
      index="01"
      eyebrow="Evolution"
      title="Six versions, each step backed by a profile."
      lead={`Replay throughput on an Apple M5, ${results.meta.workload}. Hover a row for the change.`}
    >
      <ul className="divide-y divide-white/10">
        {versions.map((v, i) => (
          <li key={v.id}>
            <Reveal delay={i * 0.05}>
              <div
                className="group grid cursor-default grid-cols-[3rem_1fr_6.5rem] items-center gap-4 py-5 md:grid-cols-[4rem_1fr_9rem]"
                onMouseEnter={() => setActive(v.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(v.id)}
                onBlur={() => setActive(null)}
                tabIndex={0}
              >
                <span className="font-mono text-sm text-white/50 transition-colors group-hover:text-white">
                  {v.id}
                </span>
                <div>
                  <Bar ratio={v.mops / max} delay={i * 0.06} />
                  <div className="h-5 pt-2">
                    <AnimatePresence mode="wait">
                      {active === v.id && (
                        <motion.p
                          key="desc"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs text-white/60"
                        >
                          {v.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold tabular-nums md:text-2xl">
                    <CountUp value={v.mops} />
                  </span>
                  <span className="ml-1 text-xs text-white/50">M/s</span>
                  <div className="font-mono text-[11px] text-white/40">~{v.meanNs} ns/op</div>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-xl text-xs leading-relaxed text-white/40">
        v5 reads slightly below v4 on the narrow workload ({fmtMops(versions[4].mops)} to{" "}
        {fmtMops(versions[5].mops)}). The bitmap earns its keep on sparse books, shown next.
      </p>
    </Section>
  );
}

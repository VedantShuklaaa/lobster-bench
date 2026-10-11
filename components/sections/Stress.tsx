"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar } from "@/components/ui/Bar";
import { Section } from "@/components/ui/Section";
import { Segmented } from "@/components/ui/Segmented";
import { fmtMops } from "@/lib/format";
import { results } from "@/lib/results";

export function Stress() {
  const { stress } = results;
  const max = Math.max(...stress.map((s) => Math.max(s.v5, s.v4 ?? 0)));
  const [preset, setPreset] = useState(stress[0].preset);
  const current = stress.find((s) => s.preset === preset) ?? stress[0];

  return (
    <Section
      id="stress"
      index="02"
      eyebrow="Stress workloads"
      title="Same engine, four very different books."
      lead="The default workload is the best case for an array-indexed ladder. These four push on footprint, scan length, and stream shape. Throughput in M ops/s on the M5."
    >
      <div className="mb-10 flex items-center gap-6 text-xs text-white/50">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-full border border-white/80" /> v4
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-full bg-white" /> v5
        </span>
      </div>

      <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          {stress.map((s, i) => {
            const selected = s.preset === preset;
            return (
              <button
                key={s.preset}
                type="button"
                onClick={() => setPreset(s.preset)}
                aria-pressed={selected}
                className={`block w-full text-left transition-opacity ${selected ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-sm">{s.preset}</span>
                  <span className="font-mono text-sm tabular-nums text-white/60">
                    {s.v4 !== null && <>{fmtMops(s.v4)} → </>}
                    <span className="text-white">{fmtMops(s.v5)}</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {s.v4 !== null && <Bar ratio={s.v4 / max} variant="outline" delay={i * 0.08} />}
                  <Bar ratio={s.v5 / max} delay={i * 0.08 + 0.05} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="mb-6 md:hidden">
            <Segmented
              id="stress-mobile"
              label="Preset"
              options={stress.map((s) => ({ value: s.preset, label: s.preset }))}
              value={preset}
              onChange={setPreset}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.preset}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="border-l border-white/20 pl-6"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">{current.preset}</p>
              <p className="mt-3 text-sm text-white/50">{current.shape}</p>
              <p className="mt-5 text-base leading-relaxed text-white/80">{current.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

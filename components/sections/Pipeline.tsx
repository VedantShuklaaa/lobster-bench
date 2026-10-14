"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar } from "@/components/ui/Bar";
import { Section } from "@/components/ui/Section";
import { Segmented } from "@/components/ui/Segmented";
import { fmtNs } from "@/lib/format";
import { headlineLatency, results, type LatencyRow } from "@/lib/results";
import BorderBeam from "border-beam";

type Mode = "pinned" | "unpinned";

const PERCENTILES: { key: "p50" | "p90" | "p99" | "p999" | "max"; label: string }[] = [
  { key: "p50", label: "p50" },
  { key: "p90", label: "p90" },
  { key: "p99", label: "p99" },
  { key: "p999", label: "p99.9" },
  { key: "max", label: "max" },
];

// Log scale from 100 ns to 100 µs.
const LOG_MIN = 2;
const LOG_MAX = 5;
const toRatio = (ns: number) => (Math.log10(ns) - LOG_MIN) / (LOG_MAX - LOG_MIN);
const TICKS = [
  { ns: 100, label: "100 ns" },
  { ns: 1000, label: "1 µs" },
  { ns: 10000, label: "10 µs" },
  { ns: 100000, label: "100 µs" },
];

function Saturated({ row }: { row: LatencyRow }) {
  return (
    <div className="rounded-2xl p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Saturated</p>
      <p className="mt-4 text-2xl font-semibold tracking-tight">
        Offered {row.offered} M/s, achieved {row.achieved.toFixed(1)} M/s.
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
        The pipeline cannot keep up, so the queue grows for the whole run and latency is just the length of
        that queue. Those numbers say nothing about the engine, so they are not shown.
      </p>
    </div>
  );
}

function Percentiles({ row }: { row: LatencyRow }) {
  return (
    <div className="rounded-2xl p-6 md:p-8">
      <div className="space-y-5">
        {PERCENTILES.map((p, i) => {
          const v = row[p.key];
          if (v === undefined) return null;
          return (
            <div key={p.key} className="grid grid-cols-[3.5rem_1fr_5rem] items-center gap-4">
              <span className="font-mono text-xs text-white/50">{p.label}</span>
              <Bar ratio={toRatio(v)} delay={i * 0.06} />
              <span className="text-right font-mono text-sm tabular-nums">{fmtNs(v)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 hidden grid-cols-[3.5rem_1fr_5rem] gap-4 sm:grid">
        <span />
        <div className="relative h-4">
          {TICKS.map((t) => (
            <span
              key={t.ns}
              className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-white/30 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${toRatio(t.ns) * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
        <span />
      </div>
      <p className="mt-4 font-mono text-[10px] text-white/30 sm:hidden">Log scale, 100 ns to 100 µs.</p>
    </div>
  );
}

export function Pipeline() {
  const [mode, setMode] = useState<Mode>("pinned");
  const [offered, setOffered] = useState(1.0);
  const rows = results.pipeline[mode];
  const row = rows.find((r) => r.offered === offered) ?? rows[0];
  const env = results.environments.find((e) => e.id === results.pipeline.envId);

  return (
    <Section
      id="pipeline"
      index="03"
      eyebrow="Pipeline latency"
      title={`Two threads, one ring, ${headlineLatency?.p50 ? fmtNs(headlineLatency.p50) : "sub-microsecond"} in the middle.`}
      lead="A paced sender pushes commands through a lock-free ring to the engine thread. Latency runs from the moment a command was due to the moment its events were published, so queueing is counted, not hidden."
    >
      <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Segmented
          id="pipeline-mode"
          label="Thread placement"
          options={[
            { value: "pinned", label: "Pinned" },
            { value: "unpinned", label: "Unpinned" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <div role="radiogroup" aria-label="Offered rate" className="flex flex-wrap gap-2">
          {rows.map((r) => {
            const active = r.offered === offered;
            return (
              <button
                key={r.offered}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setOffered(r.offered)}
                className={`relative rounded-full border px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${active
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/60 hover:text-white"
                  }`}
              >
                {r.offered} M/s{r.saturated ? "*" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <BorderBeam>
          <motion.div
            key={`${mode}-${row.offered}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {row.saturated ? <Saturated row={row} /> : <Percentiles row={row} />}
          </motion.div>
        </BorderBeam>
      </AnimatePresence>

      <div className="mt-10 grid gap-8 text-sm leading-relaxed text-white/60 md:grid-cols-2">
        <p>
          <span className="text-white">Capacity is about {results.pipeline.saturationMops} M/s</span> with every
          command published on its own (batch 1). Above that, the rows marked * saturate.
        </p>
        <p>
          <span className="text-white">Pinning changed nothing measurable.</span> The tails are nearly the same
          pinned and unpinned, so thread migration is not the cause. Their cause has not been isolated.
        </p>
      </div>

      {env && (
        <p className="mt-8 font-mono text-[11px] leading-relaxed text-white/40">
          {env.name}, {env.detail}. {results.pipeline.workload}.
        </p>
      )}
    </Section>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { results } from "@/lib/results";
import BorderBeam from "border-beam";

export function Method() {
  const [open, setOpen] = useState(false);

  return (
    <Section
      id="method"
      index="04"
      eyebrow="Method"
      title="Where the numbers came from."
      lead="Two machines, never mixed in one table. The limits are listed because they change how far a number should be trusted."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {results.environments.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.08}>
            <BorderBeam className="h-full rounded-2xl border border-black p-6 transition-colors hover:border-white/15 cursor-pointer duration-300" color="Mono">
              <p className="text-lg font-semibold tracking-tight">{e.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{e.detail}</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-white/40">Used for</p>
              <p className="mt-1 text-sm">{e.usedFor}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/50">{e.caveat}</p>
            </BorderBeam>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between border-y border-white/15 py-5 text-left"
        >
          <span className="text-lg font-semibold tracking-tight">Known limits</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-2xl leading-none"
            aria-hidden
          >
            +
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              key="limits"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {results.limits.map((l) => (
                <li key={l} className="border-b border-white/10 py-4 pr-8 text-sm leading-relaxed text-white/60">
                  {l}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </Reveal>
    </Section>
  );
}

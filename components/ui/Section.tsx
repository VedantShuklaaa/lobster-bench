import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

/** Shared frame for each page section: numbered eyebrow, title, one-line lead, then content. */
export function Section({ id, index, eyebrow, title, lead, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-white/10 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
            {index} / {eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold font-[times] md:text-5xl">{title}</h2>
          <p className="mt-5 max-w-xl text-base leading-[1.2] text-white/60">{lead}</p>
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

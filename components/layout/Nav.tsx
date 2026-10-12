"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { results } from "@/lib/results";

const links = [
  { href: "#evolution", label: "Evolution" },
  { href: "#stress", label: "Stress" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#method", label: "Method" },
];

/** Sticky top bar with a thin scroll-progress line. */
export function Nav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.4 });

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="#top" className="font-mono text-sm font-semibold tracking-tight">
          lobster
        </a>
        <ul className="flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href} className="hidden sm:block">
              <a href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/live" className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black transition-opacity hover:opacity-80">
              Live
            </a>
          </li>
          <li>
            <a
              href={results.meta.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-3 py-1 text-xs transition-colors hover:bg-white hover:text-black"
            >
              GitHub
            </a>
          </li>
        </ul>
      </nav>
      <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-white" />
    </header>
  );
}

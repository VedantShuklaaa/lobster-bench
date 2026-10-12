import Link from "next/link";
import { results } from "@/lib/results";

/** Slim header for /live: the home page nav is built around scroll anchors, which do not apply here. */
export function LiveHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1500px] items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-3 font-mono text-sm">
          <Link href="/" className="font-semibold tracking-tight hover:text-white/70">lobster</Link>
          <span className="text-white/25">/</span>
          <span className="text-white/60">live</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link href="/" className="text-white/60 transition-colors hover:text-white">Benchmarks</Link>
          <a
            href={results.meta.repo}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:bg-white hover:text-black"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

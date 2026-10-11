import { results } from "@/lib/results";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Numbers come from a single <span className="font-mono text-white/70">results.json</span>, last updated{" "}
          {results.meta.updated}.
        </p>
        <a
          href={results.meta.repo}
          target="_blank"
          rel="noreferrer"
          className="text-white/70 transition-colors hover:text-white"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}

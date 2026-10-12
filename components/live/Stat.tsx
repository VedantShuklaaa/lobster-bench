import type { ReactNode } from "react";

type StatProps = { label: string; children: ReactNode; className?: string };

/** A small label over a value, used in the ticker bar. */
export function Stat({ label, children, className = "" }: StatProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      <span className="tabular truncate font-mono text-[13px] text-white/90">{children}</span>
    </div>
  );
}

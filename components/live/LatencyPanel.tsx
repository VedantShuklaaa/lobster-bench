"use client";

import { Panel } from "@/components/live/Panel";
import { fmtMs, fmtNs } from "@/lib/live/format";
import { useLive } from "@/lib/live/store";

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="h-6 w-20" />;
  const hi = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 80},${22 - (v / hi) * 20}`).join(" ");
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20" aria-hidden>
      <polyline points={pts} fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}

function Row({ label, hint, value, extra }: { label: string; hint: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/5 px-3 py-2 first:border-t-0">
      <div>
        <div className="text-xs text-white/85">{label}</div>
        <div className="text-[10px] text-white/35">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        {extra}
        <span className="tabular whitespace-nowrap font-mono text-sm">{value}</span>
      </div>
    </div>
  );
}

/** Your last order, split into the three places time goes. Only the first is the engine. */
export function LatencyPanel() {
  const lat = useLive((s) => s.lat);
  const stats = useLive((s) => s.stats);

  return (
    <Panel title="Latency of your last order" delay={0.2}>
      <Row label="Engine" hint="inside apply_into" value={fmtNs(lat.engine_ns)} />
      <Row label="Queue" hint="waiting for the engine thread" value={fmtNs(lat.queue_ns)} />
      <Row label="Network" hint="browser ↔ server round trip" value={fmtMs(lat.rtt_ms)} extra={<Spark values={lat.rtt_hist} />} />
      <p className="border-t border-white/10 px-3 py-2 text-[11px] leading-relaxed text-white/40">
        The network is most of what you feel. The engine part is what lobster controls
        {stats ? `: p50 ${fmtNs(stats.apply_p50_ns)}, p99 ${fmtNs(stats.apply_p99_ns)} over the last second, all traffic.` : "."}
      </p>
    </Panel>
  );
}

import raw from "@/data/results.json";

export type Version = { id: string; name: string; mops: number; meanNs: number };

export type StressRow = {
  preset: string;
  shape: string;
  v4: number | null;
  v5: number;
  note: string;
};

export type LatencyRow = {
  offered: number;
  achieved: number;
  saturated?: boolean;
  p50?: number;
  p90?: number;
  p99?: number;
  p999?: number;
  max?: number;
};

export type Environment = {
  id: string;
  name: string;
  detail: string;
  usedFor: string;
  caveat: string;
};

export type Results = {
  meta: { updated: string; repo: string; workload: string };
  versions: Version[];
  stress: StressRow[];
  pipeline: {
    envId: string;
    workload: string;
    saturationMops: number;
    pinned: LatencyRow[];
    unpinned: LatencyRow[];
  };
  environments: Environment[];
  limits: string[];
};

export const results = raw as unknown as Results;

/** The latest engine version, used for the headline numbers. */
export const latestVersion = results.versions[results.versions.length - 1];

/** The pinned pipeline row at 1 M/s offered, used for the headline latency. */
export const headlineLatency = results.pipeline.pinned.find((r) => r.offered === 1.0);

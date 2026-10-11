# lobster-web

The benchmarks page for [lobster](https://github.com/VedantShuklaaa/lobster), a limit order book matching engine in Rust. One static page: version-by-version throughput, stress workloads, and pinned-core pipeline latency.

Black and white only. Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (the page is fully static)
npm run typecheck
```

## Structure

```
app/                  layout, page, globals.css, icon
components/
  layout/             Nav (scroll-progress line), Footer
  ui/                 Reveal, CountUp, Bar, Segmented, Section
  sections/           Hero, LiveBook, Evolution, Stress, Pipeline, Method
lib/                  results.ts (types and loader), format.ts
data/results.json     the only place numbers live
```

## Updating the numbers

Every figure on the page comes from `data/results.json`. Edit it, commit, and Vercel redeploys.

* `versions`: replay throughput per engine version (M ops/s, mean ns/op)
* `stress`: v4 and v5 throughput per workload preset (`v4: null` when not measured)
* `pipeline`: latency percentiles in ns per offered rate, pinned and unpinned. Rows with `"saturated": true` show a "saturated" panel instead of bars, because their latency is queue growth.
* `environments`: the machines the numbers came from. Results from different machines are never mixed in one table.
* `limits`: the known-limits list

The hero order book is decorative and labelled "illustrative". It is not live data.

## Deploy

Import the repo in Vercel. Leave Root Directory empty. The framework is auto-detected and no environment variables are needed.

## Design rules

* Colors are black, white, and white at reduced opacity (`text-white/60`, `border-white/15`). No other hues.
* Motion goes through Framer Motion and respects `prefers-reduced-motion`.
* One component per file, and sections stay thin: shared pieces live in `components/ui`.

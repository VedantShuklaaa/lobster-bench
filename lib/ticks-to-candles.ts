import type { Candle } from "@/components/uimaxxing/trading-chart";

export type Tick = { price: number; qty: number; ts: number }; // ts in ms

/** Bucket size in ms, e.g. 1_000 for 1s candles, 60_000 for 1m. */
export function applyTick(prev: Candle[], tick: Tick, bucketMs: number, max = 60): Candle[] {
	const t = Math.floor(tick.ts / bucketMs) * bucketMs;
	const last = prev[prev.length - 1];

	if (last && last.t === t) {
		const updated: Candle = {
			...last,
			h: Math.max(last.h, tick.price),
			l: Math.min(last.l, tick.price),
			c: tick.price,
			v: last.v + tick.qty,
		};
		return [...prev.slice(0, -1), updated];
	}

	// new bucket: open at the previous close so there are no gaps
	const open = last ? last.c : tick.price;
	const next: Candle = {
		t,
		o: open,
		h: Math.max(open, tick.price),
		l: Math.min(open, tick.price),
		c: tick.price,
		v: tick.qty,
	};
	const out = [...prev, next];
	return out.length > max ? out.slice(out.length - max) : out;
}
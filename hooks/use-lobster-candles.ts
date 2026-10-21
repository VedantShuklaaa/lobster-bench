"use client";

import { useEffect, useState } from "react";

import type { Candle } from "@/components/uimaxxing/trading-chart";
import { applyTick, type Tick } from "@/lib/ticks-to-candles";

// e.g. NEXT_PUBLIC_LOBSTER_WS=wss://api.vedantshukla.in/lobster/ws
const WS_URL = process.env.NEXT_PUBLIC_LOBSTER_WS!;

/**
 * EDIT THIS to match what your server actually sends.
 * Return a Tick for trade/fill messages, or null to ignore the message.
 */
function toTick(msg: any): Tick | null {
	// example shape: { type: "trade", price: 101.5, qty: 3, ts: 1729600000000 }
	if (msg?.type !== "trade") return null;
	return { price: Number(msg.price), qty: Number(msg.qty), ts: Number(msg.ts ?? Date.now()) };
}

export function useLobsterCandles(bucketMs = 1_000, max = 60) {
	const [candles, setCandles] = useState<Candle[]>([]);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		let ws: WebSocket | undefined;
		let retry: ReturnType<typeof setTimeout>;
		let closed = false;

		const connect = () => {
			ws = new WebSocket(WS_URL);
			ws.onopen = () => setConnected(true);
			ws.onmessage = (e) => {
				let msg: unknown;
				try {
					msg = JSON.parse(e.data);
				} catch {
					return;
				}
				const tick = toTick(msg);
				if (tick) setCandles((prev) => applyTick(prev, tick, bucketMs, max));
			};
			ws.onclose = () => {
				setConnected(false);
				if (!closed) retry = setTimeout(connect, 1500); // auto-reconnect
			};
		};

		connect();
		return () => {
			closed = true;
			clearTimeout(retry);
			ws?.close();
		};
	}, [bucketMs, max]);

	return { candles, connected };
}
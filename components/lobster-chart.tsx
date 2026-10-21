"use client";

import { TradingChart } from "@/components/uimaxxing/trading-chart";
import { useLobsterCandles } from "@/hooks/use-lobster-candles";

export function LobsterChart() {
	const { candles, connected } = useLobsterCandles(1_000);

	if (!candles.length) return <p>{connected ? "Waiting for trades…" : "Connecting…"}</p>;

	return (
		<TradingChart
			candles={candles}
			symbol="LOBSTER"
			interval="1s"
			name="Order book"
			live={connected}
		/>
	);
}
/** WebSocket endpoint of the lobster live server. Set NEXT_PUBLIC_WS_URL in production (wss://...). */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

/** The engine works in integer ticks. One tick is shown as 0.01. */
export const PRICE_SCALE = 100;

/** Mid-price chart: sample rate and how many samples are kept (about 2.5 minutes). */
export const CHART_SAMPLE_MS = 250;
export const CHART_POINTS = 600;

/** Public trades are about 1000 per second, so the tape groups them into buckets of this length. */
export const TAPE_BUCKET_MS = 250;
export const TAPE_ROWS = 40;

/** Round-trip ping interval. */
export const PING_MS = 2000;

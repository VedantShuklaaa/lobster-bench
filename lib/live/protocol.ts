/** Wire types, mirroring server/src/protocol.rs. */

export type Side = "bid" | "ask";
export type Level = [price: number, qty: number];

export type Limits = {
  max_qty: number;
  price_band: number;
  max_open_orders: number;
  msg_rate: number;
};

export type Trade = { price: number; qty: number; side: Side };

export type Stats = {
  uptime_s: number;
  cmds_total: number;
  cmds_per_sec: number;
  live_orders: number;
  visitors: number;
  apply_p50_ns: number;
  apply_p99_ns: number;
};

export type ServerMsg =
  | { type: "hello"; session: number; levels: number; snapshot_ms: number; limits: Limits }
  | { type: "book"; seq: number; bids: Level[]; asks: Level[]; trades: Trade[]; stats: Stats }
  | {
      type: "ack";
      tag: number;
      id: number;
      filled: number;
      remaining: number;
      fills: Level[];
      engine_ns: number;
      queue_ns: number;
    }
  | { type: "cancelled"; tag: number; id: number; engine_ns: number; queue_ns: number }
  | { type: "reject"; tag: number; reason: string }
  | { type: "order_update"; id: number; remaining: number }
  | { type: "order_done"; id: number }
  | { type: "pong"; t: number }
  | { type: "error"; message: string };

export type ClientMsg =
  | { type: "order"; tag: number; side: Side; price: number; qty: number }
  | { type: "market"; tag: number; side: Side; qty: number }
  | { type: "cancel"; tag: number; id: number }
  | { type: "ping"; t: number };

export const REJECT_TEXT: Record<string, string> = {
  no_liquidity: "No liquidity on the other side",
  unknown_order: "Order not found",
  duplicate_id: "Duplicate order id",
  invalid_qty: "Invalid quantity",
  price_out_of_range: "Price outside the book",
  qty_too_large: "Quantity above the limit",
  price_out_of_band: "Price too far from the market",
  too_many_orders: "Too many open orders",
  not_your_order: "Not your order",
  rate_limited: "Slow down, rate limit hit",
  busy: "Engine busy, try again",
};

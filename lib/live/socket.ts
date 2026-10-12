import { PING_MS, CHART_SAMPLE_MS, TAPE_BUCKET_MS, WS_URL } from "./config";
import { fmtPrice, fmtQty } from "./format";
import { REJECT_TEXT, type ClientMsg, type ServerMsg, type Side } from "./protocol";
import * as store from "./store";

type Pending =
  | { kind: "limit"; side: Side; price: number; qty: number }
  | { kind: "market"; side: Side; qty: number }
  | { kind: "cancel"; id: number };

/**
 * One WebSocket to the live server, with reconnect and backoff.
 * Owns the request tags, a client-side rate limiter that mirrors the server's, and the timers
 * that sample the chart and flush the trade tape.
 */
class LiveSocket {
  private ws: WebSocket | null = null;
  private tag = 1;
  private pending = new Map<number, Pending>();
  private attempt = 0;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private timers: ReturnType<typeof setInterval>[] = [];
  private tokens = 10;
  private cap = 10;
  private rate = 5;
  private refilled = 0;
  private refs = 0;

  /** Called by each mounted terminal. The socket lives while at least one is mounted. */
  acquire() {
    this.refs++;
    if (this.refs === 1) this.start();
    return () => {
      this.refs--;
      if (this.refs === 0) this.stop();
    };
  }

  private start() {
    this.connect();
    this.timers = [
      setInterval(() => this.ping(), PING_MS),
      setInterval(() => store.sampleChart(Date.now()), CHART_SAMPLE_MS),
      setInterval(() => store.flushTape(Date.now()), TAPE_BUCKET_MS),
    ];
  }

  private stop() {
    this.timers.forEach(clearInterval);
    this.timers = [];
    if (this.retry) clearTimeout(this.retry);
    this.retry = null;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }

  private connect() {
    store.setStatus("connecting", this.attempt);
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      store.setStatus("open");
    };
    ws.onmessage = (e) => {
      try {
        this.onMessage(JSON.parse(e.data as string) as ServerMsg);
      } catch {
        /* ignore a malformed frame */
      }
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.pending.clear();
      store.goneOffline();
      store.setStatus("offline", this.attempt);
      this.scheduleRetry();
    };
    ws.onerror = () => ws.close();
  }

  private scheduleRetry() {
    if (this.refs === 0) return;
    this.attempt++;
    const wait = Math.min(8000, 500 * 2 ** Math.min(this.attempt, 5)) * (0.75 + Math.random() * 0.5);
    this.retry = setTimeout(() => this.connect(), wait);
  }

  private ping() {
    if (this.ws?.readyState === WebSocket.OPEN) this.send({ type: "ping", t: performance.now() });
  }

  private send(m: ClientMsg) {
    this.ws?.send(JSON.stringify(m));
  }

  private allow(): boolean {
    const now = performance.now();
    this.tokens = Math.min(this.cap, this.tokens + ((now - this.refilled) / 1000) * this.rate);
    this.refilled = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }

  private submit(p: Pending, build: (tag: number) => ClientMsg): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      store.toast("error", "Not connected");
      return false;
    }
    if (!this.allow()) {
      store.toast("error", REJECT_TEXT.rate_limited);
      return false;
    }
    const tag = this.tag++;
    this.pending.set(tag, p);
    this.send(build(tag));
    return true;
  }

  limit(side: Side, price: number, qty: number) {
    return this.submit({ kind: "limit", side, price, qty }, (tag) => ({ type: "order", tag, side, price, qty }));
  }

  market(side: Side, qty: number) {
    return this.submit({ kind: "market", side, qty }, (tag) => ({ type: "market", tag, side, qty }));
  }

  cancel(id: number) {
    return this.submit({ kind: "cancel", id }, (tag) => ({ type: "cancel", tag, id }));
  }

  private onMessage(m: ServerMsg) {
    switch (m.type) {
      case "hello": {
        store.onHello(m.session, m.limits);
        this.rate = m.limits.msg_rate;
        this.cap = Math.max(2, m.limits.msg_rate * 2);
        this.tokens = this.cap;
        this.refilled = performance.now();
        break;
      }
      case "book":
        store.onBook(m.seq, m.bids, m.asks, m.trades, m.stats);
        break;
      case "ack": {
        const p = this.pending.get(m.tag);
        this.pending.delete(m.tag);
        store.onLatency(m);
        if (!p || p.kind === "cancel") break;
        if (m.remaining > 0 && p.kind === "limit") {
          store.addOrder({ id: m.id, side: p.side, price: p.price, qty: p.qty, remaining: m.remaining });
        }
        const verb = p.side === "bid" ? "Buy" : "Sell";
        if (m.filled > 0) {
          const avg = Math.round(m.fills.reduce((a, [px, q]) => a + px * q, 0) / m.filled);
          store.toast("fill", `${verb} ${fmtQty(m.filled)} filled @ ${fmtPrice(avg)}`);
        } else {
          store.toast("ok", `${verb} ${fmtQty(m.remaining)} @ ${fmtPrice(p.kind === "limit" ? p.price : 0)} resting`);
        }
        break;
      }
      case "cancelled":
        this.pending.delete(m.tag);
        store.onLatency(m);
        store.removeOrder(m.id);
        store.toast("ok", "Order cancelled");
        break;
      case "reject": {
        const p = this.pending.get(m.tag);
        this.pending.delete(m.tag);
        if (p?.kind === "cancel" && m.reason === "unknown_order") store.removeOrder(p.id);
        store.toast("error", REJECT_TEXT[m.reason] ?? m.reason);
        break;
      }
      case "order_update":
        store.updateOrder(m.id, m.remaining);
        break;
      case "order_done":
        store.removeOrder(m.id);
        store.toast("fill", "Your order was fully filled");
        break;
      case "pong":
        store.onRtt(performance.now() - m.t);
        break;
      case "error":
        break;
    }
  }
}

export const liveSocket = new LiveSocket();

"use client";

import { useState } from "react";
import { useLiveConnection } from "@/lib/live/useLive";
import { LatencyPanel } from "./LatencyPanel";
import { OfflineOverlay } from "./OfflineOverlay";
import { OpenOrders } from "./OpenOrders";
import { OrderBook } from "./OrderBook";
import { OrderForm } from "./OrderForm";
import { PriceChart } from "./PriceChart";
import { TickerBar } from "./TickerBar";
import { Toasts } from "./Toasts";
import { TradesTape } from "./TradesTape";

/**
 * The /live screen, laid out like an exchange: ticker on top, book on the left,
 * chart and order entry in the middle, trades on the right, your orders along the bottom.
 */
export function LiveTerminal() {
  useLiveConnection();
  const [picked, setPicked] = useState<{ price: number; n: number } | null>(null);
  const pick = (price: number) => setPicked((p) => ({ price, n: (p?.n ?? 0) + 1 }));

  return (
    <div className="relative mx-auto w-full max-w-[1500px] px-3 pb-10 pt-16 sm:px-4">
      <div className="flex flex-col gap-2">
        <TickerBar />

        <div className="grid gap-2 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[auto_auto]">
          <div className="order-3 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <OrderBook onPick={pick} />
          </div>
          <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1">
            <PriceChart />
          </div>
          <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-2">
            <OrderForm picked={picked} />
          </div>
          <div className="order-4 flex flex-col gap-2 lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <TradesTape />
            <LatencyPanel />
          </div>
        </div>

        <OpenOrders />
      </div>

      <OfflineOverlay />
      <Toasts />
    </div>
  );
}

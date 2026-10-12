"use client";

import { useEffect } from "react";
import { liveSocket } from "./socket";

/** Keeps the live socket open while the calling component is mounted. */
export function useLiveConnection() {
  useEffect(() => liveSocket.acquire(), []);
}

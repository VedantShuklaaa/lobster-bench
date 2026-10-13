import type { Metadata, Viewport } from "next";
import "./globals.css";
import { epicPro, times } from "@/fonts/fonts";

export const metadata: Metadata = {
  title: "lobster: a limit order book engine in Rust",
  description:
    "Benchmarks for lobster, a Rust limit order book matching engine: version-by-version throughput, stress workloads, and pinned-core pipeline latency.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${epicPro.className} ${times.className}`}>
      <body>{children}</body>
    </html>
  );
}

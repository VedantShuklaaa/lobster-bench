import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";

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
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { epicPro, times } from "@/fonts/fonts";
import { Analytics } from "@vercel/analytics/next"
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn(epicPro.className, times.className, "font-sans", geist.variable)}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

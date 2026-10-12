import type { Metadata } from "next";
import { LiveHeader } from "@/components/layout/LiveHeader";
import { LiveTerminal } from "@/components/live/LiveTerminal";

export const metadata: Metadata = {
  title: "Live · lobster",
  description: "A real lobster order book running on a server. Place orders against simulated market flow.",
};

export default function LivePage() {
  return (
    <>
      <LiveHeader />
      <main>
        <LiveTerminal />
      </main>
    </>
  );
}

import { Footer } from "@/components/layout/Footer";
import { Evolution } from "@/components/sections/Evolution";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Pipeline } from "@/components/sections/Pipeline";
import { Stress } from "@/components/sections/Stress";

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <Evolution />
        <Stress />
        <Pipeline />
        <Method />
      </main>
      <Footer />
    </>
  );
}

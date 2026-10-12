import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Evolution } from "@/components/sections/Evolution";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Pipeline } from "@/components/sections/Pipeline";
import { Stress } from "@/components/sections/Stress";

export default function Page() {
  return (
    <>
      <Nav />
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

"use client";

import { useEffect } from "react";
import { useCrystal } from "./components/CrystalProvider";

export default function HomePage() {
  const { triggerShuffle, currentStructure } = useCrystal();

  useEffect(() => {
    triggerShuffle();
  }, [triggerShuffle]);

  return (
    <div
      className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto md:max-h-none md:overflow-visible"
      style={{ maxWidth: "420px" }}
    >
      <p>Hi! I&rsquo;m Samuel.</p>

      <p>
        I&rsquo;m a sophomore at Stanford studying physics. I&rsquo;m
        broadly interested in materials, energy, and their intersection with AI.
      </p>

      <p>
        I&rsquo;m currently doing computational materials research at SLAC and
        thinking about how AI can accelerate the R&amp;D of materials.
        Previously, I helped research fusion transmutation at Marathon Fusion and
        helped scale up TPV fab processes at Antora Energy. I&rsquo;ve also spent
        time exploring trading at Jane Street, helping research polymers and fuel
        cells at Stony Brook, and shooting x-rays at CIGSe solar cells at UNLV
        and Berkeley ALS.
      </p>

      <p>
        The material in the background is{" "}
        {currentStructure ? currentStructure.formula : "..."}. Try dragging, and
        feel free to explore the links.
      </p>

      <img
        src="/headshot.jpg"
        alt="Samuel Chen"
        className="mt-2 rounded"
        style={{ width: "400px", height: "auto" }}
      />
    </div>
  );
}

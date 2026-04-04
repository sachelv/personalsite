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
      className="flex flex-col gap-3 max-h-[58vh] overflow-y-auto md:max-h-none md:overflow-visible"
      style={{ maxWidth: "440px" }}
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
        Outside of school and work, I enjoy climbing, traveling, and doing things I'll remember.
        My latest trial hobbies are photography and DJing.
      </p>

      <p>
        The material in the background is{" "}
        {currentStructure ? currentStructure.formula : "..."}. 
      </p>

      <img
        src="/headshot.jpg"
        alt="Samuel Chen"
        className="mt-2 rounded"
        style={{ width: "360px", height: "auto" }}
      />

      <div className="flex items-center gap-4 mt-2">
        <a
          href="https://www.linkedin.com/in/samuelchen118/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-800 transition-colors"
          style={{ pointerEvents: "auto" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a
          href="https://scholar.google.com/citations?user=lzc5OscAAAAJ&hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-800 transition-colors"
          style={{ pointerEvents: "auto" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
          </svg>
        </a>
        <a
          href="https://x.com/samchenn_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-800 transition-colors"
          style={{ pointerEvents: "auto" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

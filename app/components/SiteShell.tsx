"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCrystal, REVEAL_DURATION } from "./CrystalProvider";
import { getElementInfo } from "@/app/lib/element-data";

const CrystalScene = dynamic(() => import("./CrystalScene"), { ssr: false });

const navItems = [
  { emoji: "\u{1F3E0}", label: "home", href: "/" },
  { emoji: "\u{1F517}", label: "about", href: "/about" },
  { emoji: "\u{270F}\u{FE0F}", label: "writing", href: "/writing" },
];

const CARD_BG = "rgba(255, 255, 255, 0.92)";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStructure, phase, crystalOpacity, contentOpacity } =
    useCrystal();

  const interactive =
    phase !== "shuffling" && phase !== "settling" && contentOpacity > 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CrystalScene
        structure={currentStructure}
        phase={phase}
        opacity={crystalOpacity}
      />

      {/* Formula label during shuffle */}
      {(phase === "shuffling" || phase === "settling") && currentStructure && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs tracking-widest uppercase"
          style={{ color: "rgba(100, 100, 170, 0.7)" }}
        >
          {currentStructure.formula}
        </div>
      )}

      {/* Content overlay */}
      <div
        className="relative z-10 min-h-screen"
        style={{
          opacity: contentOpacity,
          transition: `opacity ${contentOpacity > 0 ? REVEAL_DURATION : 150}ms ease-in-out ${contentOpacity > 0 ? "1s" : "0s"}`,
          pointerEvents: "none",
        }}
      >
        <div className="flex items-start pt-4 pl-4">
          {/* Sidebar nav */}
          <nav
            className="flex-shrink-0 px-4 py-4"
            style={{
              backgroundColor: CARD_BG,
              borderRadius: "8px 0 0 8px",
            }}
          >
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-xs"
                    style={{
                      color: "var(--nav-link-color)",
                      pointerEvents: interactive ? "auto" : "none",
                    }}
                  >
                    <span className="text-sm leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content card */}
          <main
            className="px-7 py-6"
            style={{
              backgroundColor: CARD_BG,
              borderRadius: "0 8px 8px 8px",
              pointerEvents: interactive ? "auto" : "none",
              maxWidth: "600px",
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Element legend */}
      {interactive && currentStructure && (
        <div
          className="fixed bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg px-3 py-2"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            pointerEvents: "auto",
          }}
        >
          {[...new Set(currentStructure.sites.map((s) => s.element))].map(
            (el) => {
              const info = getElementInfo(el);
              return (
                <div key={el} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block rounded-full border border-gray-300"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: info.color,
                    }}
                  />
                  <span style={{ color: "#444" }}>{el}</span>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

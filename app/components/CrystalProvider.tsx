"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import type { CrystalStructure } from "@/app/lib/types";
import type { AnimationPhase } from "@/app/lib/types";

const SHUFFLE_DURATION = 2000;
const SHUFFLE_INTERVAL = 120;
const SETTLE_DURATION = 500;
export const REVEAL_DURATION = 1000;

function pickRandomIndices(total: number, count: number): number[] {
  const indices: number[] = [];
  const used = new Set<number>();
  while (indices.length < count && indices.length < total) {
    const idx = Math.floor(Math.random() * total);
    if (!used.has(idx)) {
      used.add(idx);
      indices.push(idx);
    }
  }
  return indices;
}

interface CrystalContextValue {
  currentStructure: CrystalStructure | null;
  phase: AnimationPhase;
  crystalOpacity: number;
  contentOpacity: number;
  triggerShuffle: () => void;
}

const CrystalContext = createContext<CrystalContextValue>({
  currentStructure: null,
  phase: "loading",
  crystalOpacity: 0,
  contentOpacity: 1,
  triggerShuffle: () => {},
});

export function useCrystal() {
  return useContext(CrystalContext);
}

export function CrystalProvider({ children }: { children: React.ReactNode }) {
  const [allStructures, setAllStructures] = useState<CrystalStructure[]>([]);
  const [shuffleSequence, setShuffleSequence] = useState<number[]>([]);
  const [seqPos, setSeqPos] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>("loading");
  const [crystalOpacity, setCrystalOpacity] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const shuffleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataRef = useRef<CrystalStructure[]>([]);
  const pendingShuffleRef = useRef(false);

  const doShuffle = useCallback((data: CrystalStructure[]) => {
    setContentOpacity(0);
    setCrystalOpacity(1);

    const shuffleCount = Math.ceil(SHUFFLE_DURATION / SHUFFLE_INTERVAL);
    const sequence = pickRandomIndices(data.length, shuffleCount + 1);
    setShuffleSequence(sequence);
    setSeqPos(0);
    setPhase("shuffling");
    setSelectedIndex(sequence[sequence.length - 1]);

    let pos = 0;
    if (shuffleRef.current) clearInterval(shuffleRef.current);
    shuffleRef.current = setInterval(() => {
      pos = (pos + 1) % sequence.length;
      setSeqPos(pos);
    }, SHUFFLE_INTERVAL);

    setTimeout(() => {
      if (shuffleRef.current) clearInterval(shuffleRef.current);
      setSeqPos(sequence.length - 1);
      setPhase("settling");

      setTimeout(() => {
        setPhase("revealing");
        setCrystalOpacity(0.35);
        setContentOpacity(1);

        setTimeout(() => {
          setPhase("idle");
        }, REVEAL_DURATION);
      }, SETTLE_DURATION);
    }, SHUFFLE_DURATION);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/materials-data.json");
        const data: CrystalStructure[] = await res.json();
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        dataRef.current = data;
        setAllStructures(data);

        if (pendingShuffleRef.current) {
          pendingShuffleRef.current = false;
          doShuffle(data);
        } else {
          const idx = Math.floor(Math.random() * data.length);
          setSelectedIndex(idx);
          setPhase("idle");
          setCrystalOpacity(0.35);
        }
      } catch {
        setPhase("idle");
        setCrystalOpacity(0);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (shuffleRef.current) clearInterval(shuffleRef.current);
    };
  }, [doShuffle]);

  const triggerShuffle = useCallback(() => {
    const data = dataRef.current;
    if (data.length === 0) {
      pendingShuffleRef.current = true;
      setContentOpacity(0);
      return;
    }
    doShuffle(data);
  }, [doShuffle]);

  const isShuffling = phase === "shuffling";
  const currentIndex = isShuffling
    ? (shuffleSequence[seqPos] ?? selectedIndex)
    : selectedIndex;
  const currentStructure = allStructures[currentIndex] || null;

  return (
    <CrystalContext.Provider
      value={{
        currentStructure,
        phase,
        crystalOpacity,
        contentOpacity,
        triggerShuffle,
      }}
    >
      {children}
    </CrystalContext.Provider>
  );
}

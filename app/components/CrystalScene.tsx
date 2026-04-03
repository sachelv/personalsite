"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { CrystalStructure } from "@/app/lib/types";
import type { AnimationPhase } from "@/app/lib/types";
import CrystalStructureView, {
  computeNormalizeScale,
  type CellOffset,
} from "./CrystalStructure";

const CAMERA_DIST = 14;
const CAMERA_FOV = 50;
const USER_IDLE_TIMEOUT = 3000;
const MAX_TOTAL_ATOMS = 1800;
const EXPAND_STEP_MS = 150;

/**
 * Compute all (i,j,k) lattice translation offsets whose center falls within
 * a sphere large enough to cover the viewport from any viewing angle.
 * Returns offsets sorted by distance from origin (nearest first).
 */
function computeSphericalOffsets(
  structure: CrystalStructure,
  normalizeScale: number
): CellOffset[] {
  const matrix = structure.lattice.matrix;
  const a = new THREE.Vector3(...matrix[0]);
  const b = new THREE.Vector3(...matrix[1]);
  const c = new THREE.Vector3(...matrix[2]);

  // Viewport diagonal in normalized (world) units
  const vHalf = CAMERA_DIST * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));
  const hHalf = vHalf * 1.78; // ~16:9
  const diag = Math.sqrt(hHalf * hHalf + vHalf * vHalf);
  // Sphere must cover the entire screen from any rotation angle.
  // A sphere of radius R always projects as a circle of radius R,
  // so we need R >= viewport diagonal / 2 (with safety margin).
  const screenRadius = diag * 1.3;
  const rawRadius = screenRadius / normalizeScale;

  // Determine search range per axis
  const maxI = Math.ceil(rawRadius / Math.max(a.length(), 0.01)) + 1;
  const maxJ = Math.ceil(rawRadius / Math.max(b.length(), 0.01)) + 1;
  const maxK = Math.ceil(rawRadius / Math.max(c.length(), 0.01)) + 1;

  const candidates: { ijk: CellOffset; dist: number }[] = [];

  for (let i = -maxI; i <= maxI; i++) {
    for (let j = -maxJ; j <= maxJ; j++) {
      for (let k = -maxK; k <= maxK; k++) {
        const center = a
          .clone()
          .multiplyScalar(i)
          .add(b.clone().multiplyScalar(j))
          .add(c.clone().multiplyScalar(k));
        const dist = center.length();
        if (dist <= rawRadius) {
          candidates.push({ ijk: [i, j, k], dist });
        }
      }
    }
  }

  candidates.sort((x, y) => x.dist - y.dist);

  // Enforce atom budget — trim outermost cells first
  const maxCells = Math.floor(MAX_TOTAL_ATOMS / Math.max(structure.sites.length, 1));
  const capped = candidates.slice(0, maxCells);

  return capped.map((c) => c.ijk);
}

/**
 * Break the full offsets list into expansion steps for the reveal animation.
 * Each step includes more cells (geometric growth), creating an outward wave.
 */
function computeExpansionSteps(totalCount: number): number[] {
  if (totalCount <= 1) return [1];
  const steps = [1];
  let count = 1;
  while (count < totalCount) {
    count = Math.min(Math.ceil(count * 2.5), totalCount);
    steps.push(count);
  }
  if (steps[steps.length - 1] !== totalCount) {
    steps.push(totalCount);
  }
  return steps;
}

const ORIGIN_OFFSETS: CellOffset[] = [[0, 0, 0]];

interface SceneContentProps {
  structure: CrystalStructure;
  phase: AnimationPhase;
  opacity: number;
}

function SceneContent({ structure, phase, opacity }: SceneContentProps) {
  const { camera } = useThree();
  const [visibleCount, setVisibleCount] = useState(1);
  const expandTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const normalizeScale = useMemo(
    () => computeNormalizeScale(structure),
    [structure]
  );

  const allOffsets = useMemo(
    () => computeSphericalOffsets(structure, normalizeScale),
    [structure, normalizeScale]
  );

  const expansionSteps = useMemo(
    () => computeExpansionSteps(allOffsets.length),
    [allOffsets.length]
  );

  const activeOffsets = useMemo(() => {
    if (phase === "shuffling" || phase === "settling" || phase === "loading") {
      return ORIGIN_OFFSETS;
    }
    return allOffsets.slice(0, visibleCount);
  }, [phase, allOffsets, visibleCount]);

  useEffect(() => {
    for (const t of expandTimers.current) clearTimeout(t);
    expandTimers.current = [];

    if (phase === "shuffling" || phase === "settling" || phase === "loading") {
      setVisibleCount(1);
    } else if (phase === "revealing") {
      expansionSteps.forEach((count, i) => {
        if (i === 0) return;
        const timer = setTimeout(() => {
          setVisibleCount(count);
        }, i * EXPAND_STEP_MS);
        expandTimers.current.push(timer);
      });
    }

    return () => {
      for (const t of expandTimers.current) clearTimeout(t);
    };
  }, [phase, expansionSteps]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const dir = cam.position.clone().normalize();
    cam.position.copy(dir.multiplyScalar(CAMERA_DIST));
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <CrystalStructureView
        structure={structure}
        opacity={opacity}
        offsets={activeOffsets}
      />
    </>
  );
}

interface CrystalSceneProps {
  structure: CrystalStructure | null;
  phase: AnimationPhase;
  opacity: number;
}

export default function CrystalScene({
  structure,
  phase,
  opacity,
}: CrystalSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onInteractionStart = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, []);

  const onInteractionEnd = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
      }
    }, USER_IDLE_TIMEOUT);
  }, []);

  if (!structure) return null;

  const controlsEnabled = phase === "idle";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [7, 5, 12], fov: CAMERA_FOV }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <SceneContent
          structure={structure}
          phase={phase}
          opacity={opacity}
        />
        <OrbitControls
          ref={controlsRef}
          enabled={controlsEnabled}
          enableZoom={false}
          enablePan={false}
          autoRotate={phase === "idle"}
          autoRotateSpeed={0.5}
          onStart={onInteractionStart}
          onEnd={onInteractionEnd}
        />
      </Canvas>
    </div>
  );
}

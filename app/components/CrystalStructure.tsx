"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { CrystalStructure as CrystalStructureType } from "@/app/lib/types";
import { getElementInfo } from "@/app/lib/element-data";

const BOND_TOLERANCE = 1.2;
const MAX_BOND_DIST = 5.5;
const ATOM_SCALE = 0.15;
const TARGET_RADIUS = 3.75;

export type CellOffset = [number, number, number];

interface Props {
  structure: CrystalStructureType;
  opacity?: number;
  offsets?: CellOffset[];
}

function computeCenter(sites: { xyz: [number, number, number] }[]) {
  const sum = [0, 0, 0];
  for (const s of sites) {
    sum[0] += s.xyz[0];
    sum[1] += s.xyz[1];
    sum[2] += s.xyz[2];
  }
  const n = sites.length || 1;
  return new THREE.Vector3(sum[0] / n, sum[1] / n, sum[2] / n);
}

function computeExtent(
  sites: { xyz: [number, number, number] }[],
  center: THREE.Vector3
): number {
  let maxDist = 0;
  for (const s of sites) {
    const d = new THREE.Vector3(...s.xyz).distanceTo(center);
    if (d > maxDist) maxDist = d;
  }
  return maxDist || 1;
}

export function computeNormalizeScale(structure: CrystalStructureType): number {
  const c = computeCenter(structure.sites);
  const extent = computeExtent(structure.sites, c);
  return TARGET_RADIUS / extent;
}

function computeBonds(
  sites: { element: string; xyz: [number, number, number] }[]
): [THREE.Vector3, THREE.Vector3][] {
  const n = sites.length;
  const pos = sites.map((s) => s.xyz);
  const radii = sites.map((s) => getElementInfo(s.element).radius);
  const maxDistSq = MAX_BOND_DIST * MAX_BOND_DIST;
  const bonds: [THREE.Vector3, THREE.Vector3][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pos[i][0] - pos[j][0];
      if (dx * dx > maxDistSq) continue;
      const dy = pos[i][1] - pos[j][1];
      const dxy = dx * dx + dy * dy;
      if (dxy > maxDistSq) continue;
      const dz = pos[i][2] - pos[j][2];
      const distSq = dxy + dz * dz;
      const threshold = (radii[i] + radii[j]) * BOND_TOLERANCE;
      if (distSq < threshold * threshold && distSq > 0.01) {
        bonds.push([
          new THREE.Vector3(...pos[i]),
          new THREE.Vector3(...pos[j]),
        ]);
      }
    }
  }
  return bonds;
}

function tileSites(
  sites: CrystalStructureType["sites"],
  matrix: number[][],
  offsets: CellOffset[]
): CrystalStructureType["sites"] {
  if (offsets.length <= 1 && offsets[0]?.[0] === 0 && offsets[0]?.[1] === 0 && offsets[0]?.[2] === 0) {
    return sites;
  }

  const a = new THREE.Vector3(...matrix[0]);
  const b = new THREE.Vector3(...matrix[1]);
  const c = new THREE.Vector3(...matrix[2]);
  const tiled: CrystalStructureType["sites"] = [];

  for (const [ni, nj, nk] of offsets) {
    const off = a
      .clone()
      .multiplyScalar(ni)
      .add(b.clone().multiplyScalar(nj))
      .add(c.clone().multiplyScalar(nk));
    for (const site of sites) {
      tiled.push({
        element: site.element,
        xyz: [
          site.xyz[0] + off.x,
          site.xyz[1] + off.y,
          site.xyz[2] + off.z,
        ],
      });
    }
  }
  return tiled;
}

function LatticeWireframe({
  matrix,
  center,
  opacity,
  offsets,
}: {
  matrix: number[][];
  center: THREE.Vector3;
  opacity: number;
  offsets: CellOffset[];
}) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...matrix[0]);
    const b = new THREE.Vector3(...matrix[1]);
    const c = new THREE.Vector3(...matrix[2]);

    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 4], [1, 5],
      [2, 4], [2, 6],
      [3, 5], [3, 6],
      [4, 7], [5, 7], [6, 7],
    ];

    const points: number[] = [];

    for (const [ni, nj, nk] of offsets) {
      const off = a
        .clone()
        .multiplyScalar(ni)
        .add(b.clone().multiplyScalar(nj))
        .add(c.clone().multiplyScalar(nk));

      const corners = [
        off.clone(),
        off.clone().add(a),
        off.clone().add(b),
        off.clone().add(c),
        off.clone().add(a).add(b),
        off.clone().add(a).add(c),
        off.clone().add(b).add(c),
        off.clone().add(a).add(b).add(c),
      ];

      for (const [i, j] of edges) {
        const ci = corners[i].clone().sub(center);
        const cj = corners[j].clone().sub(center);
        points.push(ci.x, ci.y, ci.z, cj.x, cj.y, cj.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
    return geo;
  }, [matrix, center, offsets]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#6688cc"
        transparent
        opacity={opacity * 0.5}
      />
    </lineSegments>
  );
}

function Bond({
  start,
  end,
  center,
  opacity,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  center: THREE.Vector3;
  opacity: number;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const s = start.clone().sub(center);
    const e = end.clone().sub(center);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    dir.normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { position: mid, quaternion: quat, length: len };
  }, [start, end, center]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, length, 6]} />
      <meshStandardMaterial
        color="#999999"
        transparent
        opacity={opacity * 0.6}
      />
    </mesh>
  );
}

const ORIGIN_OFFSET: CellOffset[] = [[0, 0, 0]];

export default function CrystalStructureView({
  structure,
  opacity = 1,
  offsets = ORIGIN_OFFSET,
}: Props) {
  const tiledSites = useMemo(
    () => tileSites(structure.sites, structure.lattice.matrix, offsets),
    [structure, offsets]
  );

  const center = useMemo(() => computeCenter(tiledSites), [tiledSites]);

  const normalizeScale = useMemo(
    () => computeNormalizeScale(structure),
    [structure]
  );

  const bonds = useMemo(() => computeBonds(tiledSites), [tiledSites]);

  return (
    <group scale={[normalizeScale, normalizeScale, normalizeScale]}>
      <LatticeWireframe
        matrix={structure.lattice.matrix}
        center={center}
        opacity={opacity}
        offsets={offsets}
      />

      {tiledSites.map((site, i) => {
        const info = getElementInfo(site.element);
        const pos = new THREE.Vector3(...site.xyz).sub(center);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[info.radius * ATOM_SCALE, 16, 12]} />
            <meshStandardMaterial
              color={info.color}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}

      {bonds.map(([s, e], i) => (
        <Bond key={i} start={s} end={e} center={center} opacity={opacity} />
      ))}
    </group>
  );
}

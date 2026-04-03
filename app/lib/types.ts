export interface CrystalSite {
  element: string;
  xyz: [number, number, number];
}

export interface CrystalStructure {
  id: string;
  formula: string;
  lattice: {
    matrix: number[][];
  };
  sites: CrystalSite[];
}

export type AnimationPhase =
  | "loading"
  | "shuffling"
  | "settling"
  | "revealing"
  | "idle";

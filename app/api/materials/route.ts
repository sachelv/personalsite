import { NextResponse } from "next/server";
import type { CrystalStructure } from "@/app/lib/types";

const MATERIAL_IDS = [
  "mp-149",   // Si
  "mp-2534",  // GaAs
  "mp-5020",  // BaTiO3
  "mp-19009", // Fe2O3
  "mp-2657",  // Cu
  "mp-1143",  // NaCl
  "mp-66",    // C (diamond)
  "mp-19717", // TiO2
  "mp-5229",  // Al2O3
  "mp-22862", // CaTiO3
  "mp-1265",  // SrTiO3
  "mp-2664",  // ZnO
  "mp-8082",  // LiCoO2
  "mp-1960",  // BN
];

let cachedData: CrystalStructure[] | null = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION_MS) {
    return NextResponse.json(cachedData);
  }

  const apiKey = process.env.MP_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "MP_API_KEY not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const idsParam = MATERIAL_IDS.join(",");
    const url = `https://api.materialsproject.org/materials/summary/?material_ids=${idsParam}&_fields=material_id,formula_pretty,structure`;

    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Materials Project API error: ${res.status}`, detail: text },
        { status: 502 }
      );
    }

    const json = await res.json();
    const docs = json.data || [];

    const structures: CrystalStructure[] = docs.map(
      (doc: Record<string, unknown>) => {
        const structure = doc.structure as {
          lattice: { matrix: number[][] };
          sites: { label: string; xyz: number[] }[];
        };
        return {
          id: doc.material_id as string,
          formula: doc.formula_pretty as string,
          lattice: { matrix: structure.lattice.matrix },
          sites: structure.sites.map(
            (site: { label: string; xyz: number[] }) => ({
              element: site.label,
              xyz: site.xyz as [number, number, number],
            })
          ),
        };
      }
    );

    cachedData = structures;
    cacheTime = Date.now();

    return NextResponse.json(structures);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from Materials Project", detail: String(err) },
      { status: 500 }
    );
  }
}

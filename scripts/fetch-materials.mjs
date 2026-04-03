#!/usr/bin/env node

/**
 * Fetches crystal structures from the Materials Project API
 * and saves them as a static JSON file for the landing page shuffle.
 *
 * Samples from random positions across the database to get diverse formulas.
 * Filters for multi-element compounds with 8-30 atoms per unit cell.
 *
 * Usage: MP_API_KEY=<your_key> node scripts/fetch-materials.mjs
 *   or:  reads from .env.local automatically
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let apiKey = process.env.MP_API_KEY;
if (!apiKey) {
  try {
    const envContent = readFileSync(resolve(ROOT, ".env.local"), "utf-8");
    const match = envContent.match(/^MP_API_KEY=(.+)$/m);
    if (match) apiKey = match[1].trim();
  } catch {
    // ignore
  }
}

if (!apiKey || apiKey === "your_key_here") {
  console.error(
    "Error: MP_API_KEY not found. Set it in .env.local or as an env var."
  );
  process.exit(1);
}

const API_BASE = "https://api.materialsproject.org/materials/summary/";
const FIELDS = "material_id,formula_pretty,structure,nelements,nsites";
const PER_PAGE = 100;
const TARGET_COUNT = 1000;
const MIN_SITES = 8;
const MAX_SITES = 30;
const OUTPUT_PATH = resolve(ROOT, "public", "materials-data.json");

async function fetchPage(skip, nelementsMin, nsitesMin, nsitesMax) {
  const url =
    `${API_BASE}?_fields=${FIELDS}&_limit=${PER_PAGE}&_skip=${skip}` +
    `&nelements_min=${nelementsMin}` +
    `&nsites_min=${nsitesMin}&nsites_max=${nsitesMax}`;
  const res = await fetch(url, {
    headers: { "X-API-KEY": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

function countUniqueElements(sites) {
  const els = new Set();
  for (const s of sites) els.add(s.label);
  return els.size;
}

function transformDoc(doc) {
  const s = doc.structure;
  if (!s || !s.lattice || !s.sites) return null;
  if (s.sites.length > MAX_SITES || s.sites.length < MIN_SITES) return null;
  if (countUniqueElements(s.sites) < 2) return null;

  const EXCLUDED_ELEMENTS = new Set(["Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm"]);
  for (const site of s.sites) {
    if (EXCLUDED_ELEMENTS.has(site.label)) return null;
  }

  return {
    id: doc.material_id,
    formula: doc.formula_pretty,
    lattice: {
      matrix: s.lattice.matrix.map((row) =>
        row.map((v) => Math.round(v * 1000) / 1000)
      ),
    },
    sites: s.sites.map((site) => ({
      element: site.label,
      xyz: site.xyz.map((v) => Math.round(v * 1000) / 1000),
    })),
  };
}

async function main() {
  const seenIds = new Set();
  const structures = [];

  // Sample from many random offsets across the database to get diverse formulas.
  // The MP database has ~150k materials; with our filters maybe ~30k match.
  // We'll sample from ~50 random positions to get good variety.
  const sampleOffsets = [];
  const estimatedTotal = 30000;
  const numSamples = 50;
  for (let i = 0; i < numSamples; i++) {
    sampleOffsets.push(Math.floor(Math.random() * estimatedTotal));
  }
  // Also add some near the start to ensure coverage
  sampleOffsets.push(0, 500, 2000, 5000, 10000, 15000, 20000, 25000);
  // Shuffle the offsets
  for (let i = sampleOffsets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampleOffsets[i], sampleOffsets[j]] = [sampleOffsets[j], sampleOffsets[i]];
  }

  console.log(
    `Fetching ~${TARGET_COUNT} structures (${MIN_SITES}-${MAX_SITES} sites, 2+ elements) from ${sampleOffsets.length} random positions...`
  );

  for (const offset of sampleOffsets) {
    if (structures.length >= TARGET_COUNT) break;

    process.stdout.write(`  skip=${offset}... `);

    try {
      const json = await fetchPage(offset, 2, MIN_SITES, MAX_SITES);
      const docs = json.data || [];

      let added = 0;
      for (const doc of docs) {
        if (structures.length >= TARGET_COUNT) break;
        if (seenIds.has(doc.material_id)) continue;
        const transformed = transformDoc(doc);
        if (transformed) {
          seenIds.add(doc.material_id);
          structures.push(transformed);
          added++;
        }
      }

      console.log(
        `got ${docs.length}, kept ${added} (total: ${structures.length})`
      );
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`error: ${err.message}`);
    }
  }

  // Final shuffle
  for (let i = structures.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [structures[i], structures[j]] = [structures[j], structures[i]];
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(structures));
  const sizeKB = Math.round(readFileSync(OUTPUT_PATH).length / 1024);

  // Stats
  const elemCounts = {};
  const firstLetters = {};
  for (const s of structures) {
    const n = new Set(s.sites.map((st) => st.element)).size;
    elemCounts[n] = (elemCounts[n] || 0) + 1;
    const fl = s.formula[0];
    firstLetters[fl] = (firstLetters[fl] || 0) + 1;
  }

  console.log(
    `\nDone! Saved ${structures.length} structures to public/materials-data.json (${sizeKB} KB)`
  );
  console.log("Elements per compound:", elemCounts);
  console.log(
    "Formula first letters:",
    Object.entries(firstLetters)
      .sort(([, a], [, b]) => b - a)
      .map(([l, c]) => `${l}:${c}`)
      .join(" ")
  );
}

main();

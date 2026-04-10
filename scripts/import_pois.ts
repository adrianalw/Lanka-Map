/**
 * Lanka Map — POI Importer
 * ========================
 * Reads scripts/pois.json (output of fetch_pois.py) and upserts into Supabase.
 *
 * Usage:
 *   npm run seed:pois                  # Insert new POIs, skip existing names
 *   npm run seed:pois -- --replace     # Delete ALL locations first, then insert
 *   npm run seed:pois -- --dry-run     # Print what would be inserted, no DB writes
 *
 * The --replace flag gives a clean slate (recommended after a full OSM fetch).
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CATEGORIES = new Set([
  "Beach", "Temple", "Wildlife", "Hiking", "Waterfall",
  "Historical", "Viewpoint", "Museum", "Garden", "Other",
]);

const BATCH_SIZE = 100;

interface RawPOI {
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  entry_fee?: string;
  hours?: string;
  osm_id?: string;
  wikipedia?: string;
  wikidata?: string;
}

interface Location {
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  entry_fee: string;
  hours: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    replace: args.includes("--replace"),
    dryRun: args.includes("--dry-run"),
    file: (() => {
      const idx = args.findIndex(a => a === "--file");
      return idx !== -1 ? args[idx + 1] : path.resolve(__dirname, "pois.json");
    })(),
  };
}

function sanitise(raw: RawPOI): Location | null {
  if (!raw.name || typeof raw.lat !== "number" || typeof raw.lng !== "number") {
    return null;
  }
  // Clamp to Sri Lanka bounding box with a small margin
  if (raw.lat < 5.5 || raw.lat > 10.1 || raw.lng < 79.3 || raw.lng > 82.1) {
    return null;
  }
  const category = VALID_CATEGORIES.has(raw.category) ? raw.category : "Other";
  return {
    name: raw.name.trim().slice(0, 200),
    category,
    lat: Math.round(raw.lat * 1_000_000) / 1_000_000,
    lng: Math.round(raw.lng * 1_000_000) / 1_000_000,
    description: (raw.description || "").trim().slice(0, 2000),
    entry_fee: (raw.entry_fee || "Free").trim().slice(0, 200),
    hours: (raw.hours || "Open daily").trim().slice(0, 200),
  };
}

async function getExistingNames(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("locations")
    .select("name");
  if (error) throw new Error(`Failed to fetch existing names: ${error.message}`);
  return new Set((data || []).map((r: { name: string }) => r.name.toLowerCase()));
}

async function insertBatch(batch: Location[]): Promise<number> {
  const { error, count } = await supabase
    .from("locations")
    .insert(batch, { count: "exact" });
  if (error) {
    console.error(`  Batch insert error: ${error.message}`);
    return 0;
  }
  return count ?? batch.length;
}

async function main() {
  const { replace, dryRun, file } = parseArgs();

  console.log("━━━ Lanka Map POI Importer ━━━");
  console.log(`  File:     ${file}`);
  console.log(`  Mode:     ${replace ? "REPLACE (delete all first)" : "MERGE (skip existing names)"}`);
  console.log(`  Dry run:  ${dryRun}`);
  console.log();

  // 1. Read JSON
  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    console.error("Run  python scripts/fetch_pois.py  first to generate it.");
    process.exit(1);
  }
  const raw: RawPOI[] = JSON.parse(fs.readFileSync(file, "utf-8"));
  console.log(`Step 1: Read ${raw.length} POIs from ${path.basename(file)}`);

  // 2. Sanitise
  const sanitised: Location[] = [];
  let invalid = 0;
  for (const r of raw) {
    const loc = sanitise(r);
    if (loc) sanitised.push(loc);
    else invalid++;
  }
  console.log(`Step 2: Sanitised → ${sanitised.length} valid, ${invalid} discarded`);

  // 3. Optionally clear existing data
  if (replace && !dryRun) {
    console.log("\nStep 3: Deleting all existing locations…");
    const { error } = await supabase
      .from("locations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
    if (error) {
      console.error(`  ERROR: ${error.message}`);
      process.exit(1);
    }
    console.log("  ✓ Cleared");
  }

  // 4. Filter out duplicates (unless replacing)
  let toInsert = sanitised;
  if (!replace) {
    console.log("\nStep 3: Checking for existing names…");
    const existing = await getExistingNames();
    const before = toInsert.length;
    toInsert = toInsert.filter(l => !existing.has(l.name.toLowerCase()));
    console.log(`  ${before - toInsert.length} already in DB → ${toInsert.length} new to insert`);
  }

  if (toInsert.length === 0) {
    console.log("\nNothing new to insert. Done.");
    process.exit(0);
  }

  // 5. Dry run
  if (dryRun) {
    console.log(`\nDRY RUN — would insert ${toInsert.length} locations:`);
    const sample = toInsert.slice(0, 10);
    sample.forEach(l => console.log(`  [${l.category}] ${l.name} (${l.lat}, ${l.lng})`));
    if (toInsert.length > 10) console.log(`  … and ${toInsert.length - 10} more`);
    process.exit(0);
  }

  // 6. Insert in batches
  console.log(`\nStep 4: Inserting ${toInsert.length} locations in batches of ${BATCH_SIZE}…`);
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const n = await insertBatch(batch);
    inserted += n;
    console.log(`  Inserted ${inserted} / ${toInsert.length}`);
  }

  // 7. Summary by category
  console.log("\n━━━ Inserted by Category ━━━");
  const counts: Record<string, number> = {};
  for (const l of toInsert) counts[l.category] = (counts[l.category] || 0) + 1;
  for (const [cat, count] of Object.entries(counts).sort()) {
    console.log(`  ${cat.padEnd(15)} ${count}`);
  }
  console.log(`  ${"TOTAL".padEnd(15)} ${inserted}`);
  console.log("\n✓ Import complete");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});

// run with: node tools/import_gen1_locations.js
import fs from "fs/promises";
import path from "path";

const API = "https://pokeapi.co/api/v2";
const OUT_DIR = path.join(process.cwd(), "data", "locations");

await fs.mkdir(OUT_DIR, { recursive: true });

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

console.log("Fetching Kanto region...");

// 1️⃣ Pega a REGIÃO de Kanto
const regionRes = await fetch(`${API}/region/kanto`);
if (!regionRes.ok) throw new Error("Failed to fetch Kanto region");
const region = await regionRes.json();

// 2️⃣ Locations da região
for (const locRef of region.locations) {
  const locRes = await fetch(locRef.url);
  if (!locRes.ok) continue;

  const loc = await locRes.json();
  const slug = slugify(loc.name);

  const nameEn =
    loc.names.find(n => n.language.name === "en")?.name || loc.name;

  const namePt =
    loc.names.find(n => n.language.name === "pt")?.name || nameEn;

  const isCity =
    loc.name.includes("city") ||
    loc.name.includes("town");

  /* ---------- wild encounters ---------- */
  const wildEncounters = {};

  for (const area of loc.areas) {
    const areaRes = await fetch(area.url);
    if (!areaRes.ok) continue;

    const areaData = await areaRes.json();

    for (const enc of areaData.pokemon_encounters) {
      for (const v of enc.version_details) {
        if (!["red", "blue", "yellow"].includes(v.version.name)) continue;

        for (const d of v.encounter_details) {
          const method = d.method.name;

          if (!wildEncounters[method]) wildEncounters[method] = [];

          wildEncounters[method].push({
            pokemon: enc.pokemon.name,
            minLevel: d.min_level,
            maxLevel: d.max_level,
            chance: d.chance
          });
        }
      }
    }
  }

  /* ---------- final JSON ---------- */
  const output = {
    id: slug,
    name: {
      en: nameEn,
      pt: namePt
    },
    type: isCity ? "city" : "route",

    features: {
      wildPokemon: Object.keys(wildEncounters).length > 0,
      fishing: false,
      gym: false,
      pokecenter: false,
      pokemart: false,
      npcs: false
    },

    wildEncounters,
    connections: [],
    npcs: []
  };

  const outFile = path.join(OUT_DIR, `${slug}.json`);
  await fs.writeFile(outFile, JSON.stringify(output, null, 2));

  console.log("Saved:", slug);
}

console.log("DONE.");

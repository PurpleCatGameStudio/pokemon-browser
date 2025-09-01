// run with: node download_gen1.js   (Node 18+ recommended)
import fs from "fs/promises";
import path from "path";

const POKE_BASE = "https://pokeapi.co/api/v2";
const OUT = path.join(process.cwd(), "data");
const OUT_POKEMON = path.join(OUT, "pokemon");
const OUT_ENCOUNTERS = path.join(OUT, "encounters");
const OUT_GEN = path.join(OUT, "generation");
const OUT_SPRITES = path.join(process.cwd(), "sprites", "pokemon");

await fs.mkdir(OUT_POKEMON, { recursive: true });
await fs.mkdir(OUT_ENCOUNTERS, { recursive: true });
await fs.mkdir(OUT_GEN, { recursive: true });
await fs.mkdir(OUT_SPRITES, { recursive: true });

console.log("Fetching generation 1...");
const genRes = await fetch(`${POKE_BASE}/generation/1`);
if (!genRes.ok) throw new Error("Could not fetch generation 1");
const genJson = await genRes.json();
await fs.writeFile(path.join(OUT_GEN, "generation-1.json"), JSON.stringify(genJson, null, 2));
console.log("Saved generation-1.json");

for (const species of genJson.pokemon_species) {
  const name = species.name;
  try {
    console.log("Downloading:", name);
    // pokemon details (includes id and sprites)
    const pRes = await fetch(`${POKE_BASE}/pokemon/${name}`);
    if (!pRes.ok) { console.warn("skip pokemon:", name); continue; }
    const pJson = await pRes.json();
    await fs.writeFile(path.join(OUT_POKEMON, `${name}.json`), JSON.stringify(pJson, null, 2));

    // encounters (may be empty array)
    const eRes = await fetch(`${POKE_BASE}/pokemon/${name}/encounters`);
    if (eRes.ok) {
      const eJson = await eRes.json();
      await fs.writeFile(path.join(OUT_ENCOUNTERS, `${name}.json`), JSON.stringify(eJson, null, 2));
    }

    // download sprite (front_default preferred, fallback to official artwork)
    const spriteUrl = pJson.sprites.front_default
      || (pJson.sprites.other && pJson.sprites.other["official-artwork"] && pJson.sprites.other["official-artwork"].front_default);

    if (spriteUrl) {
      const imgRes = await fetch(spriteUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        await fs.writeFile(path.join(OUT_SPRITES, `${pJson.id}.png`), Buffer.from(arrayBuffer));
      } else {
        console.warn("sprite not found for", name);
      }
    }
  } catch (err) {
    console.error("error for", name, err);
  }
}
console.log("Done. Check /data and /sprites/pokemon");

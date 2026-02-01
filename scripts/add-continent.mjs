import fs from "fs/promises";
import path from "path";

const base = path.resolve("src/content/rate-virtual-number-by-country");

// Normalizes strings: remove diacritics, to lower, replace non-word with hyphen
function normalize(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Mapping: normalized slug / name -> continent key
const MAP = {
  // Europe
  alemana: "europe",
  alemania: "europe",
  austria: "europe",
  bielorrusia: "europe",
  bosnia: "europe",
  "bosnia-y-herzegovina": "europe",
  chipre: "europe",
  croacia: "europe",
  dinamarca: "europe",
  eslovenia: "europe",
  grecia: "europe",
  espana: "europe",
  francia: "europe",
  finlandia: "europe",
  estonia: "europe",
  polonia: "europe",
  portugal: "europe",
  belgica: "europe",
  belarus: "europe",
  italy: "europe",
  slovenia: "europe",
  czech: "europe",
  "czech-republic": "europe",
  ireland: "europe",
  islandia: "europe",
  latvia: "europe",
  lithuania: "europe",
  luxemburgo: "europe",
  luxembourg: "europe",
  netherlands: "europe",
  "paises-bajos": "europe",
  nederland: "europe",
  georgia: "europe",

  // North America
  canada: "north-america",
  "estados-unidos": "north-america",
  "united-states": "north-america",
  mexico: "north-america",
  guatemala: "north-america",
  panama: "north-america",
  "costa-rica": "north-america",
  "el-salvador": "north-america",
  nicaragua: "north-america",
  "puerto-rico": "north-america",
  "dominican-republic": "north-america",

  // South America
  argentina: "south-america",
  bolivia: "south-america",
  brazil: "south-america",
  brasil: "south-america",
  chile: "south-america",
  colombia: "south-america",
  ecuador: "south-america",
  peru: "south-america",
  uruguay: "south-america",
  venezuela: "south-america",

  // Asia
  china: "asia",
  "hong-kong": "asia",
  japon: "asia",
  japan: "asia",
  "corea-del-sur": "asia",
  korea: "asia",
  "korea-(republic-of)": "asia",
  malasia: "asia",
  malaysia: "asia",
  filipinas: "asia",
  philippines: "asia",
  israel: "asia",
  kazajistan: "asia",
  kazakhstan: "asia",
  bahrain: "asia",
  vietnam: "asia",

  // Africa
  kenia: "africa",
  uganda: "africa",
  zambia: "africa",
  zimbabue: "africa",
  zimbabwe: "africa",
  kenya: "africa",

  // Oceania
  australia: "oceania",
  "nueva-zelanda": "oceania",
  "new-zealand": "oceania",
};

async function walk(dir) {
  const res = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      res.push(...(await walk(full)));
    } else {
      res.push(full);
    }
  }
  return res;
}

(async function main() {
  const files = (await walk(base)).filter((f) => /\.(md|mdx)$/i.test(f));
  let modified = 0;
  for (const file of files) {
    // skip index files
    if (/(-index|index)\.(md|mdx)$/i.test(file)) continue;
    let src = await fs.readFile(file, "utf8");
    const fmMatch = src.match(/^---([\s\S]*?)---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    if (/\bcontinent\s*:/i.test(fm)) continue; // already has continent

    // determine a normalized key: use customSlug, or title, or filename
    let key = null;
    const slugMatch = fm.match(/customSlug\s*:\s*"?([^"\n]+)"?/i);
    if (slugMatch) key = normalize(slugMatch[1]);
    if (!key) {
      const titleMatch = fm.match(/title\s*:\s*"?([^"\n]+)"?/i);
      if (titleMatch) key = normalize(titleMatch[1]);
    }
    if (!key) key = normalize(path.basename(file).replace(/\.(md|mdx)$/i, ""));

    const continent = MAP[key] || MAP[key.replace(/\-.*$/, "")] || "other";

    // insert continent after the first line break inside frontmatter (best place is after title)
    // We'll insert just before the closing --- to keep near other metadata.
    const insertAt = fmMatch.index + fmMatch[0].length - 3; // position before final ---
    const newFm =
      src.slice(0, insertAt) +
      `\ncontinent: "${continent}"\n` +
      src.slice(insertAt);

    await fs.writeFile(file, newFm, "utf8");
    modified++;
    console.log(`${file} -> continent: ${continent}`);
  }
  console.log(`Modified ${modified} files`);
})();

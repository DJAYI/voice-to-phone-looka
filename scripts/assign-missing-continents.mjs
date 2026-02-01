import fs from "fs/promises";
import path from "path";

const base = path.resolve("src/content/rate-virtual-number-by-country");

function normalize(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Expanded mapping covering English and Spanish common names / slugs used in repo
const MAP = {
  // Europe
  austria: "europe",
  belgium: "europe",
  belgica: "europe",
  belarus: "europe",
  bosnia: "europe",
  "bosnia-and-herzegovina": "europe",
  "bosnia-y-herzegovina": "europe",
  chipre: "europe",
  cyprus: "europe",
  croatia: "europe",
  croacia: "europe",
  denmark: "europe",
  dinamarca: "europe",
  slovenia: "europe",
  eslovenia: "europe",
  greece: "europe",
  grecia: "europe",
  espa: "europe",
  espana: "europe",
  "espa-a": "europe",
  españa: "europe",
  finland: "europe",
  finlandia: "europe",
  estonia: "europe",
  estonia_es: "europe",
  france: "europe",
  francia: "europe",
  germany: "europe",
  alemania: "europe",
  italy: "europe",
  italia: "europe",
  "países-bajos": "europe",
  "paises-bajos": "europe",
  netherlands: "europe",
  nederland: "europe",
  luxembourg: "europe",
  luxemburgo: "europe",
  latvia: "europe",
  lithuania: "europe",
  poland: "europe",
  polonia: "europe",
  portugal: "europe",
  portugal_es: "europe",
  sweden: "europe",
  suecia: "europe",
  norway: "europe",
  noruega: "europe",
  iceland: "europe",
  islandia: "europe",
  czech: "europe",
  "czech-republic": "europe",
  "república-checa": "europe",
  slovakia: "europe",
  "república-eslovaca": "europe",
  slovenia: "europe",
  serbia: "europe",
  montenegro: "europe",

  // North America
  canada: "north-america",
  mexico: "north-america",
  "estados-unidos": "north-america",
  "united-states": "north-america",
  usa: "north-america",
  "puerto-rico": "north-america",
  "puerto-rico": "north-america",
  panama: "north-america",
  costarica: "north-america",
  "costa-rica": "north-america",
  "el-salvador": "north-america",
  nicaragua: "north-america",
  guatemala: "north-america",
  "dominican-republic": "north-america",

  // South America
  argentina: "south-america",
  chile: "south-america",
  colombia: "south-america",
  ecuador: "south-america",
  peru: "south-america",
  uruguay: "south-america",
  venezuela: "south-america",
  bolivia: "south-america",
  brasil: "south-america",
  brazil: "south-america",

  // Asia
  china: "asia",
  "hong-kong": "asia",
  japón: "asia",
  japon: "asia",
  japan: "asia",
  "corea-del-sur": "asia",
  "korea-(republic-of)": "asia",
  korea: "asia",
  malaysia: "asia",
  malasia: "asia",
  philippines: "asia",
  filipinas: "asia",
  israel: "asia",
  kazakhstan: "asia",
  kazajistan: "asia",
  bahrain: "asia",
  vietnam: "asia",
  "viet-nam": "asia",
  taiwan: "asia",
  taiwán: "asia",
  singapore: "asia",
  thailand: "asia",
  tailandia: "asia",

  // Africa
  kenya: "africa",
  kenia: "africa",
  uganda: "africa",
  zambia: "africa",
  zimbabwe: "africa",
  zimbabue: "africa",
  "south-africa": "africa",
  sudáfrica: "africa",

  // Oceania
  australia: "oceania",
  "new-zealand": "oceania",
  "nueva-zelanda": "oceania",
};

async function walk(dir) {
  const res = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res.push(...(await walk(full)));
    else res.push(full);
  }
  return res;
}

(async function main() {
  const files = (await walk(base)).filter((f) => /\.(md|mdx)$/i.test(f));
  let updated = 0;
  const changed = [];
  for (const file of files) {
    if (/(-index|index)\.(md|mdx)$/i.test(file)) continue;
    let s = await fs.readFile(file, "utf8");
    const fmMatch = s.match(/^---([\s\S]*?)---/);
    if (!fmMatch) continue;
    let fm = fmMatch[1];

    // try to find existing continent
    const continentMatch = fm.match(
      /continent\s*:\s*(?:"([^"]*)"|'([^']*)'|([^\n\r]*))/i,
    );
    const existing = continentMatch
      ? (
          continentMatch[1] ||
          continentMatch[2] ||
          continentMatch[3] ||
          ""
        ).trim()
      : "";
    if (existing && existing !== "other") continue; // skip already assigned

    // candidate keys
    let key = null;
    const slugMatch = fm.match(/customSlug\s*:\s*"?([^"\n]+)"?/i);
    if (slugMatch) key = normalize(slugMatch[1]);
    if (!key) {
      const titleMatch = fm.match(/title\s*:\s*"?([^"\n]+)"?/i);
      if (titleMatch) key = normalize(titleMatch[1]);
    }
    if (!key) key = normalize(path.basename(file).replace(/\.(md|mdx)$/i, ""));

    let assigned = null;
    // direct match
    if (MAP[key]) assigned = MAP[key];
    // try strip variants, like remove parenthesis or suffixes
    if (!assigned) {
      const compact = key
        .replace(/\(.+\)/, "")
        .replace(/-\d+$/, "")
        .replace(/_/, "-");
      if (MAP[compact]) assigned = MAP[compact];
    }

    if (!assigned) {
      // try common transformations
      const parts = key.split("-");
      for (const n of parts) {
        if (MAP[n]) {
          assigned = MAP[n];
          break;
        }
      }
    }

    if (assigned) {
      // replace if continent exists, else insert before closing ---
      if (continentMatch) {
        const oldLine = continentMatch[0];
        s = s.replace(oldLine, `continent: "${assigned}"`);
      } else {
        const insertAt = fmMatch.index + fmMatch[0].length - 3;
        s =
          s.slice(0, insertAt) +
          `\ncontinent: "${assigned}"\n` +
          s.slice(insertAt);
      }
      await fs.writeFile(file, s, "utf8");
      updated++;
      changed.push({ file, assigned });
    }
  }
  console.log("Updated", updated, "files");
  changed.forEach((c) => console.log(c.file, "->", c.assigned));
})();

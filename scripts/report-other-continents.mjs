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

// reuse map from assign script (subset)
const MAP = {
  austria: "europe",
  belgium: "europe",
  belgica: "europe",
  belarus: "europe",
  croatia: "europe",
  croacia: "europe",
  cyprus: "europe",
  denmark: "europe",
  dinamarca: "europe",
  finland: "europe",
  finlandia: "europe",
  france: "europe",
  francia: "europe",
  germany: "europe",
  alemania: "europe",
  greece: "europe",
  grecia: "europe",
  iceland: "europe",
  islandia: "europe",
  montenegro: "europe",
  montenegro_es: "europe",
  norway: "europe",
  noruega: "europe",
  poland: "europe",
  polonia: "europe",
  serbia: "europe",
  slovenia: "europe",
  slovakia: "europe",
  sweden: "europe",
  suecia: "europe",
  switzerland: "europe",
  suiza: "europe",
  italy: "europe",
  italia: "europe",
  spain: "europe",
  espana: "europe",
  "republica-checa": "europe",
  "república-checa": "europe",
  canada: "north-america",
  mexico: "north-america",
  usa: "north-america",
  "estados-unidos": "north-america",
  "puerto-rico": "north-america",
  panama: "north-america",
  "costa-rica": "north-america",
  "el-salvador": "north-america",
  nicaragua: "north-america",
  guatemala: "north-america",
  "dominican-republic": "north-america",
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
  china: "asia",
  "hong-kong": "asia",
  japan: "asia",
  japon: "asia",
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
  kenya: "africa",
  kenia: "africa",
  uganda: "africa",
  zambia: "africa",
  zimbabwe: "africa",
  zimbabue: "africa",
  "south-africa": "africa",
  sudáfrica: "africa",
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
  const rows = [];
  for (const file of files) {
    if (/(-index|index)\.(md|mdx)$/i.test(file)) continue;
    const s = await fs.readFile(file, "utf8");
    const fmMatch = s.match(/^---([\s\S]*?)---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const continentMatch = fm.match(
      /continent\s*:\s*(?:"([^"]*)"|'([^']*)'|([^\n\r]*))/i,
    );
    const continent = continentMatch
      ? (
          continentMatch[1] ||
          continentMatch[2] ||
          continentMatch[3] ||
          ""
        ).trim()
      : "";
    if (continent !== "other") continue;

    const titleMatch = fm.match(/title\s*:\s*"?([^"\n]+)"?/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const slugMatch = fm.match(/customSlug\s*:\s*"?([^"\n]+)"?/i);
    const slug = slugMatch
      ? slugMatch[1].trim()
      : path.basename(file).replace(/\.(md|mdx)$/i, "");

    // suggest
    let key = normalize(slug || title);
    let suggested = MAP[key] || "";
    if (!suggested) {
      const compact = key
        .replace(/\(.+\)/, "")
        .replace(/-\d+$/, "")
        .replace(/_/, "-");
      suggested = MAP[compact] || "";
      if (!suggested) {
        const parts = key.split("-");
        for (const p of parts) {
          if (MAP[p]) {
            suggested = MAP[p];
            break;
          }
        }
      }
    }

    rows.push({
      file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
      title,
      slug,
      continent,
      suggested,
    });
  }

  const csv = ["file,title,slug,continent,suggested"]
    .concat(
      rows.map(
        (r) =>
          `"${r.file}","${r.title.replace(/"/g, '""')}","${r.slug}","${r.continent}","${r.suggested}"`,
      ),
    )
    .join("\n");
  await fs.writeFile(
    path.resolve("scripts", "other-continents.csv"),
    csv,
    "utf8",
  );
  console.log("Wrote scripts/other-continents.csv with", rows.length, "rows");
})();

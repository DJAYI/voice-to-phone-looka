import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const csvPath = path.join(repoRoot, "scripts", "other-continents.csv");
if (!fs.existsSync(csvPath)) {
  console.error("CSV not found:", csvPath);
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).slice(1);

// Manual mapping for ISO suggestions (keys: normalized slug/title)
const SUGGESTED = {
  // English
  hungary: "hu",
  malta: "mt",
  "russian-federation": "ru",
  spain: "es",
  switzerland: "ch",
  ukraine: "ua",
  "united-kingdom": "gb",
  // Spanish variants / slugs
  bahrein: "bh",
  hungria: "hu",
  irlanda: "ie",
  letonia: "lv",
  lituania: "lt",
  "reino-unido": "gb",
  "republica-checa": "cz",
  "republica-dominicana": "do",
  "republica-eslovaca": "sk",
  rusia: "ru",
  singapur: "sg",
  sudafrica: "za",
  suiza: "ch",
  ucrania: "ua",
};

// A small helper to normalize keys similar to index.astro
function normalizeKey(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let updated = 0;
const updatedFiles = [];

for (const line of lines) {
  // CSV format: "file","title","slug","continent","suggested"
  const m = line.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]*)","([^"]*)"$/);
  if (!m) continue;
  const fileRel = m[1];
  const title = m[2];
  const slug = m[3];
  const filePath = path.join(repoRoot, fileRel);
  if (!fs.existsSync(filePath)) {
    console.warn("Missing file:", filePath);
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const fmMatch = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)/);
  if (!fmMatch) {
    console.warn("No frontmatter found for:", fileRel);
    continue;
  }
  const fm = fmMatch[1];
  if (/^.*\niso:\s*/m.test(fm)) {
    // has iso already
    continue;
  }

  const candidates = [slug, title, normalizeKey(title)];
  let foundIso = null;
  for (const c of candidates) {
    const key = normalizeKey(c);
    if (SUGGESTED[key]) {
      foundIso = SUGGESTED[key];
      break;
    }
  }

  if (!foundIso) {
    // Try to infer from common names
    const kSlug = normalizeKey(slug);
    if (kSlug === "republica-checa" || kSlug === "republica-checa")
      foundIso = "cz";
    if (kSlug === "republica-dominicana") foundIso = "do";
    if (kSlug === "republica-eslovaca") foundIso = "sk";
  }

  if (!foundIso) {
    console.info("No ISO suggestion for:", fileRel);
    continue;
  }

  // Insert iso into frontmatter before the closing ---
  const newFm = fm.replace(/\n---\s*$/, `\niso: "${foundIso}"\n---`);
  const newRaw = raw.replace(fm, newFm);
  fs.writeFileSync(filePath, newRaw, "utf8");
  updated++;
  updatedFiles.push({ file: fileRel, iso: foundIso });
  console.log(`Updated ${fileRel} -> iso: ${foundIso}`);
}

console.log(`\nDone. Files updated: ${updated}`);
if (updated > 0) process.exit(0);
else process.exit(0);

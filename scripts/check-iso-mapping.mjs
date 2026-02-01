import fs from "fs";
import path from "path";

const root = process.cwd();
const indexPath = path.join(
  root,
  "src",
  "pages",
  "[...lang]",
  "rates",
  "virtual-numbers",
  "index.astro",
);
const contentDir = path.join(
  root,
  "src",
  "content",
  "rate-virtual-number-by-country",
);

const indexRaw = fs.readFileSync(indexPath, "utf8");

// Extract ISO_MAP block
const isoMatch = indexRaw.match(
  /const ISO_MAP: Record<string, string> = \{([\s\S]*?)\};/m,
);
if (!isoMatch) {
  console.error("ISO_MAP not found in index.astro");
  process.exit(1);
}
const body = isoMatch[1];

const map = {};
const entryRe = /(["'`]?)([a-z0-9\-áéíóúñüçãäö]+)\1\s*:\s*"([a-z]{2})"/gi;
let m;
while ((m = entryRe.exec(body))) {
  map[m[2]] = m[3];
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(md|mdx)$/.test(name)) out.push(full);
  }
  return out;
}
function normalizeKey(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const files = walk(contentDir);
const missing = [];

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const fmMatch = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)/);
  const fm = fmMatch ? fmMatch[1] : "";
  if (/\niso:\s*"[a-z]{2}"/i.test(fm)) continue; // has iso already

  // get slug
  const customSlugM = fm.match(/\ncustomSlug:\s*"([^"]+)"/i);
  const slug = customSlugM
    ? customSlugM[1]
    : path.basename(f).replace(/\.(md|mdx)$/, "");
  const titleM = fm.match(/\ntitle:\s*"([^"]+)"/i);
  const title = titleM ? titleM[1] : "";
  const keySlug = normalizeKey(slug);
  const keyTitle = normalizeKey(title);
  const bySlug = map[keySlug];
  const byTitle = map[keyTitle];
  if (!bySlug && !byTitle) {
    missing.push({ file: f, slug, title, keySlug, keyTitle });
  }
}

console.log(`ISO_MAP size: ${Object.keys(map).length}`);
console.log(`Files checked: ${files.length}`);
console.log(
  `Files lacking iso frontmatter AND no ISO_MAP match: ${missing.length}\n`,
);
for (const m2 of missing)
  console.log(`${m2.file} — keySlug: ${m2.keySlug} titleKey: ${m2.keyTitle}`);

process.exit(0);

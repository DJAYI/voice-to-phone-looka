import fs from "fs";
import path from "path";

const root = process.cwd();
const contentDir = path.join(
  root,
  "src",
  "content",
  "rate-virtual-number-by-country",
);

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

function readFrontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)/);
  if (!m) return null;
  return m[1];
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
  const fm = readFrontmatter(f);
  if (!fm) {
    missing.push({ file: f, reason: "no-frontmatter" });
    continue;
  }
  if (!/\niso:\s*"[a-z]{2}"/i.test(fm)) {
    // Attempt to extract title and slug
    const titleM = fm.match(/\ntitle:\s*"([^"]+)"/i);
    const customSlugM = fm.match(/\ncustomSlug:\s*"([^"]+)"/i);
    const slug = customSlugM
      ? customSlugM[1]
      : path.basename(f).replace(/\.(md|mdx)$/, "");
    const title = titleM ? titleM[1] : "";
    missing.push({
      file: f,
      slug,
      title,
      key: normalizeKey(customSlugM ? customSlugM[1] : slug),
    });
  }
}

console.log(`Checked ${files.length} files.`);
console.log(`Missing ISO in ${missing.length} files:\n`);
for (const m of missing) {
  if (m.reason) console.log(`${m.file} — ${m.reason}`);
  else
    console.log(
      `${m.file} — slug: ${m.slug} — title: ${m.title} — key: ${m.key}`,
    );
}

process.exit(0);

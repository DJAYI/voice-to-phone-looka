import fs from "fs/promises";
import path from "path";

function getCliKey() {
  const idx = process.argv.indexOf("--key");
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

const API_KEY = process.env.PEXELS_API_KEY || getCliKey();
if (!API_KEY) {
  console.error(
    "ERROR: PEXELS_API_KEY not set. Do not commit API keys. Run with: PEXELS_API_KEY=your_key node scripts/scrape-pexels.mjs or node scripts/scrape-pexels.mjs --key <your_key>",
  );
  process.exit(1);
}

const outPublic = path.resolve("public/images/pexels");
const outAssets = path.resolve("src/assets/images/pexels");
await Promise.all([
  fs.mkdir(outPublic, { recursive: true }),
  fs.mkdir(outAssets, { recursive: true }),
]);

const queries = [
  { slug: "call-center", q: "call center" },
  { slug: "computer", q: "computer" },
];

const perQueryLimit = 6; // images per query
const manifest = {};

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

for (const { slug, q } of queries) {
  console.log(`Searching Pexels for: ${q}`);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perQueryLimit}&page=1`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) {
    console.error(
      `Pexels API error for query ${q}: ${res.status} ${res.statusText}`,
    );
    continue;
  }
  const data = await res.json();
  manifest[slug] = [];

  await fs.mkdir(path.join(outPublic, slug), { recursive: true });
  await fs.mkdir(path.join(outAssets, slug), { recursive: true });

  for (let i = 0; i < Math.min(perQueryLimit, data.photos.length); i++) {
    const photo = data.photos[i];
    const src =
      photo.src && (photo.src.large2x || photo.src.large || photo.src.original);
    if (!src) continue;

    const filename = `${slug}-${i + 1}.jpg`;
    const publicPath = path.join(outPublic, slug, filename);
    const assetPath = path.join(outAssets, slug, filename);

    console.log(`Downloading ${src} -> ${publicPath}`);
    try {
      await download(src, publicPath);
      await fs.copyFile(publicPath, assetPath);
      manifest[slug].push({
        filename,
        path: `/images/pexels/${slug}/${filename}`,
      });
    } catch (err) {
      console.error(`Failed to process photo id=${photo.id} - ${err}`);
    }
  }
}

const manifestPath = path.resolve("scripts/pexels-manifest.json");
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Done. Manifest written to ${manifestPath}`);
console.log(`Usage:
 - Set your API key (do not commit it) and run:
   PEXELS_API_KEY=your_key node scripts/scrape-pexels.mjs

Files will be saved to:
 - public/images/pexels/<query-slug>/
 - src/assets/images/pexels/<query-slug>/
`);

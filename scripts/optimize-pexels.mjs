import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const dir = path.resolve("public/images/pexels");

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return;
  const tmp = file + ".opt";
  try {
    const image = sharp(file);
    const meta = await image.metadata();

    // Resize to max width 1600 if larger
    if (meta.width && meta.width > 1600) image.resize(1600);

    if (ext === ".png") {
      await image
        .png({ quality: 80, compressionLevel: 8, adaptiveFiltering: true })
        .toFile(tmp);
    } else {
      await image.jpeg({ quality: 80, mozjpeg: true }).toFile(tmp);
    }

    await fs.rename(tmp, file);
    console.log(`Optimized ${path.relative(process.cwd(), file)}`);
  } catch (err) {
    console.error(`Failed to optimize ${file}: ${err}`);
    try {
      await fs.unlink(tmp);
    } catch (e) {}
  }
}

(async () => {
  try {
    const files = await walk(dir);
    for (const f of files) await optimize(f);
    console.log("Done optimizing pexels images");
  } catch (err) {
    console.error("Error optimizing images", err);
    process.exit(1);
  }
})();

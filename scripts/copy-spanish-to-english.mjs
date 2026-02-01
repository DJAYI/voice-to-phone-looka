import { promises as fs } from "fs";
import path from "path";

const root = path.resolve(process.cwd(), "src", "content");

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const data = await fs.readFile(src);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, data);
  }
}

async function main() {
  try {
    const items = await fs.readdir(root, { withFileTypes: true });
    for (const item of items) {
      if (!item.isDirectory()) continue;
      const spanishDir = path.join(root, item.name, "spanish");
      const englishDir = path.join(root, item.name, "english");
      if (await exists(spanishDir)) {
        console.log("Copying", spanishDir, "->", englishDir);
        await copyRecursive(spanishDir, englishDir);
      }
    }
    console.log("Done copying all spanish -> english.");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();

import fs from "fs/promises";
import path from "path";

const base = path.resolve("src/content/rate-virtual-number-by-country");

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
  let fixed = 0;
  for (const file of files) {
    let s = await fs.readFile(file, "utf8");
    // Find 'continent: "..."---' or continent without quotes followed by '---' on the same line
    const regex = /(continent\s*:\s*(?:"[^"]*"|'[^']*'|[^\n\r]*?))(?:\s*)---/g;
    if (regex.test(s)) {
      const newS = s.replace(regex, (m, g1) => {
        // ensure there's a newline before closing ---
        return `${g1}\n---`;
      });
      if (newS !== s) {
        await fs.writeFile(file, newS, "utf8");
        fixed++;
        console.log("Fixed", file);
      }
    }
  }
  console.log("Fixed files:", fixed);
})();

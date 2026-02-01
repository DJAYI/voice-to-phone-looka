#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import matter from "gray-matter";
import pkg from "he";
const { decode } = pkg;
import slugify from "slugify";

const BASE = "https://www.voicetophone.com";
const HELP_INDEX = `${BASE}/help/es`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "src", "content", "help", "spanish");

async function ensureOut() {
  await fs.ensureDir(OUT_DIR);
  await fs.ensureDir(path.join(__dirname, "..", "public", "images", "help"));
}

function cleanText(raw) {
  if (!raw) return "";
  // remove script blocks entirely
  let s = String(raw).replace(/<script[\s\S]*?<\/script>/gi, " ");
  // handle lists: replace <li> with - and keep structure
  s = s.replace(/<li[^>]*>/gi, "\n- ");
  s = s.replace(/<\/li>/gi, "");
  s = s.replace(/<ul[^>]*>|<\/ul>/gi, "\n");
  s = s.replace(/<ol[^>]*>/gi, "\n");
  s = s.replace(/<\/ol>/gi, "\n");
  // convert anchors to markdown [text](href)
  s = s.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (m, href, text) => `[${text.replace(/<[^>]+>/g, "").trim()}](${href})`,
  );
  // replace breaks with newlines
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n");
  // remove remaining tags
  s = s.replace(/<[^>]+>/g, " ");
  // remove common JS snippets left as text (e.g., jQuery calls)
  s = s.replace(/\$\([^)]+\)[\s\S]*?;?/g, " ");
  s = s.replace(/document\.[a-zA-Z0-9_]+\([^)]+\)[\s\S]*?;?/g, " ");
  // decode HTML entities
  try {
    s = decode(s);
  } catch (e) {}
  // normalize whitespace and trim
  s = s.replace(/[ \t\f\v\u00A0\u2028\u2029]+/g, " ");
  s = s.replace(/\n\s+/g, "\n");
  s = s.replace(/\s*\n\s*/g, "\n\n");
  s = s.replace(/ {2,}/g, " ");
  s = s.trim();
  return s;
}

async function getHelpSubpages(page) {
  await page.goto(HELP_INDEX, { waitUntil: "networkidle2" });
  const links = await page.$$eval('a[href*="/help/"]', (anchors) => {
    const set = new Set();
    anchors.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      const match = href.match(/\/help\/\d+\/es/);
      if (match) set.add(match[0]);
    });
    return Array.from(set);
  });
  return links.map((l) => (l.startsWith("http") ? l : BASE + l));
}

async function extractFAQFromPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    document
      .querySelectorAll(
        '[role="button"], .accordion, .accordion-toggle, .faq-question, .faq-toggle',
      )
      .forEach((el) => {
        try {
          el.click();
        } catch (e) {}
      });
  });
  await new Promise((r) => setTimeout(r, 200));

  // Instrument network responses to capture dynamic content during interactions
  const xhrResponses = [];
  const onResponse = async (resp) => {
    try {
      const req = resp.request();
      const ct = (resp.headers && (resp.headers()["content-type"] || "")) || "";
      if (
        req.resourceType &&
        (req.resourceType() === "xhr" ||
          req.resourceType() === "fetch" ||
          ct.includes("application/json") ||
          ct.includes("text/html"))
      ) {
        const text = await resp.text().catch(() => "");
        if (text && text.length) xhrResponses.push({ url: resp.url(), text });
      }
    } catch (e) {}
  };
  page.on("response", onResponse);

  // First pass: try DOM-based extraction
  let data = await page.evaluate(async () => {
    function textOf(el) {
      return el ? el.innerText.trim() : "";
    }

    const title = textOf(document.querySelector("h1")) || "";
    // Strategy 0: find elements that use data-id and post to /respuesta2 (common pattern)
    const items = Array.from(
      document.querySelectorAll("a.item[data-id], .item[data-id]"),
    );
    if (items.length > 0) {
      const qas0 = [];
      for (const it of items) {
        const id = it.getAttribute("data-id") || it.dataset.id;
        const question = textOf(it);
        if (!id) continue;
        try {
          const resp = await fetch("/respuesta2", {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({ id: id, idioma: "es" }),
          });
          const html = await resp.text();
          // keep raw HTML to clean on Node side
          qas0.push({ question, answer: html });
        } catch (e) {
          qas0.push({ question, answer: "" });
        }
      }
      if (qas0.length > 0) return { title, qas: qas0 };
    }

    const qas = [];

    // Strategy A: explicit FAQ containers
    const containers = Array.from(
      document.querySelectorAll(
        ".faq-item, .help-item, .faq, .accordion-item, .panel, .card, .faq-list, .help-list, .help-accordion",
      ),
    );
    containers.forEach((c) => {
      // try to find question node
      const qNode = c.querySelector(".question, .faq-question, h2, h3, a");
      const aNode = c.querySelector(
        ".answer, .faq-answer, .accordion-content, .panel-body, p, div",
      );
      const question =
        textOf(qNode) ||
        textOf(c.querySelector("a")) ||
        textOf(c.querySelector("h2,h3"));
      let answer = textOf(aNode);
      if (!answer) {
        const ps = Array.from(c.querySelectorAll("p"))
          .map((p) => p.innerText.trim())
          .filter(Boolean);
        answer = ps.join("\n\n");
      }
      if (!answer) {
        const containerIndex = Array.prototype.indexOf.call(
          document.querySelectorAll(".help-list, .faq-list, .help-accordion"),
          c,
        );
        if (containerIndex >= 0) {
          const panels = Array.from(
            document.querySelectorAll(
              ".help-panel, .faq-panel, .collapse, .accordion-content",
            ),
          );
          if (panels[containerIndex]) {
            answer = panels[containerIndex].innerText.trim();
          }
        }
      }
      if (question) qas.push({ question, answer });
    });

    if (qas.length > 0) return { title, qas };

    // Strategy B: heading followed by paragraphs
    const headings = Array.from(document.querySelectorAll("h2, h3"));
    headings.forEach((h) => {
      const question = textOf(h);
      let el = h.nextElementSibling;
      const parts = [];
      while (el && !/H1|H2|H3/.test(el.tagName)) {
        if (el.innerText && el.innerText.trim().length)
          parts.push(el.innerText.trim());
        el = el.nextElementSibling;
      }
      const answer = parts.join("\n\n");
      if (question && answer) qas.push({ question, answer });
    });
    if (qas.length > 0) return { title, qas };

    // Strategy C: anchors that toggle or refer to IDs
    const anchors = Array.from(document.querySelectorAll("a")).filter((a) =>
      (a.getAttribute("href") || "").startsWith("#"),
    );
    anchors.forEach((a) => {
      const question = textOf(a);
      if (!question) return;
      const href = a.getAttribute("href") || "";
      let answer = "";
      if (href.length > 1) {
        const id = href.substring(1);
        const target = document.getElementById(id);
        if (target) answer = textOf(target);
      }
      if (!answer) {
        let el = a.parentElement;
        for (let i = 0; i < 8 && el; i++) {
          el = el.nextElementSibling;
          if (el && el.innerText && el.innerText.trim().length) {
            answer = el.innerText.trim();
            break;
          }
        }
      }
      qas.push({ question, answer });
    });
    if (qas.length > 0) return { title, qas };

    // Strategy D: try to parse inline scripts that contain JSON-like QA arrays
    const scripts = Array.from(document.querySelectorAll("script")).map(
      (s) => s.innerText,
    );
    for (const text of scripts) {
      if (/question|faq|answer/i.test(text)) {
        const match = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (match) {
          try {
            const json = JSON.parse(match[0]);
            if (Array.isArray(json)) {
              json.forEach((item) => {
                const q = item.question || item.title || item.title_q || "";
                const a = item.answer || item.content || item.description || "";
                if (q)
                  qas.push({
                    question: String(q).trim(),
                    answer: String(a).trim(),
                  });
              });
              if (qas.length > 0) return { title, qas };
            }
          } catch (e) {
            /* ignore parse errors */
          }
        }
      }
    }

    return { title, qas };
  });

  // If DOM extraction didn't find Q/A (or answers are short), try clicking anchors and inspect XHR responses
  if (
    !data.qas ||
    data.qas.length === 0 ||
    (data.qas.length > 0 &&
      data.qas.every((q) => !q.answer || q.answer.length < 20))
  ) {
    const anchors = await page.$$('a[href^="#"]');

    // Save full page HTML for debugging
    try {
      const html = await page.content();
      const slug =
        url
          .replace(BASE + "/help/", "")
          .replace("/es", "")
          .replace(/\//g, "-") || "help";
      const debugPath = path.join(
        __dirname,
        "..",
        "scripts",
        `debug-${slug}.html`,
      );
      await fs.writeFile(debugPath, html, "utf8");
      console.log(`Wrote debug HTML to ${debugPath}`);
      // quick search for common question strings
      const interesting = [
        "Cómo empezar",
        "Como pagar",
        "Que es telefonía",
        "Como comprar",
        "Que es un Call shop",
        "Cómo empezar ?",
      ];
      interesting.forEach((q) => {
        if (html.indexOf(q) !== -1)
          console.log(`Found question string "${q}" in HTML of ${url}`);
      });
    } catch (e) {
      console.error("Failed to write debug HTML:", e.message);
    }

    for (const a of anchors) {
      const q = await page
        .evaluate((el) => el.innerText.trim(), a)
        .catch(() => "");
      const beforeCount = xhrResponses.length;
      try {
        await a.click();
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 400));

      let answer = "";
      for (let i = beforeCount; i < xhrResponses.length; i++) {
        const r = xhrResponses[i];
        if (/question|answer|faq|content|body|respuesta/i.test(r.text)) {
          try {
            const j = JSON.parse(r.text);
            if (Array.isArray(j)) {
              for (const item of j) {
                if (
                  item.answer &&
                  typeof item.answer === "string" &&
                  item.answer.length > 10
                ) {
                  answer = item.answer;
                  break;
                }
              }
            } else if (j && (j.answer || j.content || j.description)) {
              answer = j.answer || j.content || j.description || "";
            }
            if (answer && answer.length) break;
          } catch (e) {
            // keep raw response text for Node-side cleaning
            if (r.text && r.text.length > answer.length) answer = r.text;
          }
        }
      }

      if (!answer) {
        const visibleNow = await page.evaluate(() =>
          Array.from(document.querySelectorAll("*"))
            .filter((el) => el.offsetParent !== null)
            .map((el) => el.innerText.trim())
            .filter(Boolean)
            .join("\n\n"),
        );
        if (visibleNow && visibleNow.length > 80) answer = visibleNow;
      }

      if (q) data.qas.push({ question: q, answer });
    }
  }

  page.off("response", onResponse);

  return data;
}

async function downloadImage(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buffer);
    return true;
  } catch (e) {
    return false;
  }
}

function basenameFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).pop() || "";
  } catch (e) {
    return url.split("/").filter(Boolean).pop() || "";
  }
}

async function processAnswerHtml(rawHtml, sourceUrl, slug, index) {
  if (!rawHtml) return "";
  let html = String(rawHtml);
  // find img tags
  const imgs = [];
  const imgRe = /<img[^>]*src=["']?([^"'>\s]+)["']?[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    imgs.push(m[1]);
  }
  for (const [i, src] of imgs.entries()) {
    let imgUrl = src;
    if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
    else if (imgUrl.startsWith("/")) imgUrl = BASE + imgUrl;
    else if (!/^https?:\/\//i.test(imgUrl)) {
      try {
        imgUrl = new URL(imgUrl, sourceUrl).href;
      } catch (e) {}
    }
    const baseName = basenameFromUrl(imgUrl) || `${slug}-${i}`;
    const ext = baseName.includes(".")
      ? baseName.split(".").pop().split("?")[0]
      : "png";
    const fname = `${slug}-${index}-${i}.${ext}`.replace(
      /[^a-zA-Z0-9\.\-_]/g,
      "",
    );
    const outPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "help",
      fname,
    );
    try {
      const ok = await downloadImage(imgUrl, outPath);
      if (ok) {
        html = html.replace(
          new RegExp(
            `<img[^>]*src=["']?${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?[^>]*>`,
            "gi",
          ),
          `![image](/images/help/${fname})`,
        );
      } else {
        html = html.replace(
          new RegExp(
            `<img[^>]*src=["']?${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?[^>]*>`,
            "gi",
          ),
          "",
        );
      }
    } catch (e) {
      html = html.replace(
        new RegExp(
          `<img[^>]*src=["']?${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?[^>]*>`,
          "gi",
        ),
        "",
      );
    }
  }

  // replace anchors with markdown
  html = html.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (m, href, text) => {
      let hrefResolved = href;
      try {
        hrefResolved = href.startsWith("//")
          ? "https:" + href
          : href.startsWith("http")
            ? href
            : new URL(href, sourceUrl).href;
      } catch (e) {}
      return `[${text.replace(/<[^>]+>/g, "").trim()}](${hrefResolved})`;
    },
  );

  return html;
}

async function formatBody(body) {
  // Remove duplicate question lines e.g. heading then immediate repeat
  body = body.replace(/##\s*(.+)\n\n\1\n\n/gi, "## $1\n\n");
  // Convert numbered steps like '1) ' to '1. '
  body = body.replace(/^\s*([0-9]+)\)\s+/gm, "$1. ");
  // Normalize multiple blank lines
  body = body.replace(/\n{3,}/g, "\n\n");
  return body.trim();
}

async function saveSection(url, data) {
  const oldSlug =
    url
      .replace(BASE + "/help/", "")
      .replace("/es", "")
      .replace(/\//g, "-") || "help";
  const titleClean = cleanText(data.title || oldSlug);
  const fileSlug =
    (titleClean
      ? slugify(titleClean, { lower: true, strict: true })
      : oldSlug) || oldSlug;
  const filename = `${fileSlug}.md`;
  const filePath = path.join(OUT_DIR, filename);
  const front = {
    title: data.title || filename,
    source_url: url,
    date_scraped: new Date().toISOString(),
    route: `/help/${fileSlug}/es/`,
    draft: false,
  };
  const questions = [];
  let body = "";
  const questionsDir = path.join(OUT_DIR, fileSlug);
  await fs.ensureDir(questionsDir);
  for (const [i, qa] of data.qas.entries()) {
    const q = cleanText(qa.question);
    let aRaw = qa.answer || "";
    // process images and convert links in the raw HTML to local assets or markdown before cleaning
    const processed = await processAnswerHtml(aRaw, url, fileSlug, i);
    const a = cleanText(processed);
    if (!q && !a) continue;
    const qslug = slugify(q || `q-${i}`, { lower: true, strict: true }).slice(
      0,
      60,
    );
    const qid = `${fileSlug}-q-${i}-${qslug}`;
    const openAttr = i === 0 ? " open" : "";

    // create question page file
    const qFilename = `${qslug}.md`;
    const qFilePath = path.join(questionsDir, qFilename);
    const qFront = {
      title: q,
      parent: fileSlug,
      source_url: url,
      date_scraped: new Date().toISOString(),
      route: `/help/${fileSlug}/${qslug}/`,
      id: qid,
      draft: false,
    };
    const qBody = `# ${q}\n\n${a}\n\n[Volver a la sección](/help/${fileSlug}/es/)`;
    const qContent = matter.stringify(qBody, qFront);
    await fs.writeFile(qFilePath, qContent, "utf8");

    questions.push({ q, qslug, qid, path: qFilePath });

    body += `<details id="${qid}"${openAttr}>\n<summary>${q}</summary>\n\n${a}\n\n</details>\n\n`;
  }
  // add small script to auto-open based on hash when navigated to this page
  body += `<script>\n(function(){\n  try{ const hash = location.hash && location.hash.substring(1); if(hash){ const el = document.getElementById(hash); if(el && el.tagName==='DETAILS'){ el.open = true; setTimeout(()=> el.scrollIntoView({behavior:'smooth', block:'center'}),100); } }\n  window.addEventListener('hashchange', ()=>{ const h = location.hash.substring(1); const el2 = document.getElementById(h); if(el2 && el2.tagName==='DETAILS'){ el2.open = true; setTimeout(()=> el2.scrollIntoView({behavior:'smooth', block:'center'}),100); } }); }catch(e){} })();\n</script>`;
  body = await formatBody(body);
  // Use first question as a short description to help static page previews
  front.description =
    cleanText((data.qas && data.qas[0] && data.qas[0].question) || "") || "";
  const content = matter.stringify(body, {
    ...front,
    qids: questions.map((x) => x.qid),
  });
  await fs.writeFile(filePath, content, "utf8");

  // remove old numeric file if different
  const oldFilePath = path.join(OUT_DIR, `${oldSlug}.md`);
  if (oldSlug !== fileSlug) {
    try {
      await fs.remove(oldFilePath);
      console.log(`Removed old file ${oldFilePath}`);
    } catch (e) {}
  }

  return { filePath, fileSlug, questions };
}

async function generateAggregatedIndex(sections) {
  // read existing -index.md frontmatter if present
  const indexPath = path.join(OUT_DIR, "-index.md");
  let front = {};
  try {
    if (await fs.pathExists(indexPath)) {
      const raw = await fs.readFile(indexPath, "utf8");
      const parsed = matter(raw);
      front = parsed.data || {};
    }
  } catch (e) {}

  // Build cards grid at the top linking to each section by its english slug
  let cardsHtml = `<div class="help-cards">`;
  for (const sec of sections) {
    const title = cleanText(sec.data.title) || path.basename(sec.path, ".md");
    const slug = sec.slug || path.basename(sec.path, ".md");
    const firstQ =
      sec.data.qas && sec.data.qas.length
        ? cleanText(sec.data.qas[0].question)
        : "";
    // Cards link to the section page where questions live (use trailing slash to match site config)
    const href = `/help/${slug}/es/`;
    cardsHtml += `<a class="help-card" href="${href}"><h3>${title}</h3><p>${firstQ}</p></a>`;
  }
  cardsHtml += `</div>\n\n`;

  // The index only contains the cards grid; individual questions live on each section page
  let body = cardsHtml + "\n\n";
  body +=
    "Selecciona una tarjeta para ver las preguntas y respuestas de esa sección.\n\n";

  const content = matter.stringify(body, front);
  await fs.writeFile(indexPath, content, "utf8");
  return indexPath;
}

(async () => {
  await ensureOut();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  try {
    console.log("Fetching help index...");
    const subpages = await getHelpSubpages(page);
    console.log("Found subpages:", subpages);
    const processedSections = [];
    for (const url of subpages) {
      console.log("Processing", url);
      const data = await extractFAQFromPage(page, url);
      const { filePath, fileSlug, questions } = await saveSection(url, data);
      console.log("Saved to", filePath);
      processedSections.push({
        url,
        path: filePath,
        slug: fileSlug,
        data,
        questions,
      });
    }

    // After processing sections, generate an aggregated index file that includes each section and its questions
    try {
      await generateAggregatedIndex(processedSections);
      console.log("Aggregated index updated.");
    } catch (e) {
      console.error("Failed to generate aggregated index:", e.message);
    }

    console.log("Done.");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

// Usage : node render.mjs <dossier> <t1> <t2> …  (temps en secondes, images PNG 1920×1080)
import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

// Playwright from the project if installed, otherwise from the global npm packages.
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(`${execSync("npm root -g").toString().trim()}/playwright`);
}
const { chromium } = playwright;
const [, , outdir, ...times] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto("file://" + process.cwd() + "/equimarge-film.html?capture=1");
await p.waitForFunction(() => window.FILM);
for (const t of times) {
  const data = await p.evaluate((t) => {
    window.FILM.seek(t);
    return document.getElementById("film").toDataURL("image/png");
  }, Number(t));
  fs.writeFileSync(
    `${outdir}/t${Number(t).toFixed(3)}.png`,
    Buffer.from(data.split(",")[1], "base64"),
  );
}
if (errors.length) console.log("errors:", errors);
await b.close();

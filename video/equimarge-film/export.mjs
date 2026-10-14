// Usage : node export.mjs <sortie.mp4>  — rend les 900 images et les encode en H.264.
import { execSync, spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(`${execSync("npm root -g").toString().trim()}/playwright`);
}
const out = process.argv[2] || "equimarge-film.mp4";
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("file://" + process.cwd() + "/equimarge-film.html?capture=1");
await page.waitForFunction(() => window.FILM);
const { frames, FPS } = await page.evaluate(() => ({
  frames: window.FILM.frames,
  FPS: window.FILM.FPS,
}));
const ff = spawn(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "16",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
for (let i = 0; i < frames; i++) {
  const data = await page.evaluate((t) => {
    window.FILM.seek(t);
    return document.getElementById("film").toDataURL("image/png");
  }, i / FPS);
  if (!ff.stdin.write(Buffer.from(data.split(",")[1], "base64"))) {
    await new Promise((r) => ff.stdin.once("drain", r));
  }
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log(`${out} : ${frames} images`);

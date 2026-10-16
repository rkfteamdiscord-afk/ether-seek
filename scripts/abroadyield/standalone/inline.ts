// Inlines the built JS and CSS into one HTML file that works offline.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dist = new URL("../../../dist-abroadyield/", import.meta.url);
const htmlPath = new URL("scripts/abroadyield/standalone/index.html", dist);
let html = readFileSync(htmlPath, "utf8");
const assets = new URL("assets/", dist);
for (const file of readdirSync(assets)) {
  const code = readFileSync(new URL(file, assets), "utf8");
  if (file.endsWith(".js")) {
    html = html.replace(
      new RegExp(`<script[^>]*src="[^"]*${file}"[^>]*></script>`),
      () => `<script type="module">${code.replace(/<\/script/gi, "<\\/script")}</script>`,
    );
  } else if (file.endsWith(".css")) {
    html = html.replace(
      new RegExp(`<link[^>]*href="[^"]*${file}"[^>]*>`),
      () => `<style>${code}</style>`,
    );
  }
}
writeFileSync(new URL("abroadyield.html", dist), html);
console.log(`dist-abroadyield/abroadyield.html (${Math.round(html.length / 1024)} KB)`);

// Regenerates public/abroadyield-sitemap.xml: `SITE_URL=https://example.com bun run ay:sitemap`.
// Uses published countries and blog posts from Supabase when VITE_SUPABASE_URL/KEY are set,
// otherwise the seed data.
import { writeFileSync } from "node:fs";
import { seedBlog } from "../../src/abroadyield/data/config";
import { seedCountries } from "../../src/abroadyield/data/countries";

const site = (process.env["SITE_URL"] ?? "https://zrk.lol").replace(/\/$/, "");
const base = `${site}/abroadyield`;

async function load<T>(collection: string, fallback: T[]): Promise<T[]> {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key) return fallback;
  const res = await fetch(`${url}/rest/v1/ay_documents?collection=eq.${collection}&select=data`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  const rows = (await res.json()) as Array<{ data: T }>;
  return rows.length ? rows.map((r) => r.data) : fallback;
}

const countries = (await load("countries", seedCountries)).filter((c) => c.published);
const posts = (await load("blog", seedBlog)).filter((p) => p.published);
const today = new Date().toISOString().slice(0, 10);
const urls: Array<[string, string]> = [
  [base, today],
  [`${base}/start`, today],
  [`${base}/guides`, today],
  [`${base}/methodology`, today],
  [`${base}/blog`, today],
  [`${base}/experts`, today],
  ...countries.map((c): [string, string] => [`${base}/guides/${c.slug}`, c.lastVerified]),
  ...posts.map((p): [string, string] => [`${base}/blog/${p.slug}`, p.publishedAt]),
  ...["terms", "privacy", "cookies", "refunds", "partner-disclosure"].map((p): [string, string] => [
    `${base}/legal/${p}`,
    today,
  ]),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, mod]) => `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("../../public/abroadyield-sitemap.xml", import.meta.url), xml);
console.log(`Wrote ${urls.length} URLs for ${site}`);

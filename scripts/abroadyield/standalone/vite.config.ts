// Client-only build of AbroadYield into a single self-contained HTML file.
// Run: bun run ay:standalone  →  dist-abroadyield/abroadyield.html
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("../../..", import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": `${root}/src` } },
  // The standalone file always runs in demo mode (data stays in the visitor's browser).
  define: {
    "import.meta.env.VITE_SUPABASE_URL": "undefined",
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": "undefined",
    "import.meta.env.VITE_SUPABASE_ANON_KEY": "undefined",
  },
  build: {
    outDir: `${root}/dist-abroadyield`,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: `${root}/scripts/abroadyield/standalone/index.html`,
      output: { inlineDynamicImports: true },
    },
  },
});

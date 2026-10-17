import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter (SIL Open Font License), bundled so rendering never depends on a font CDN.
export const fontFamily = "Inter";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/inter-latin-wght.woff2"),
  weight: "100 900",
});

/** AbroadYield charter: midnight navy, ivory, champagne; one grotesk family. */
export const C = {
  navy: "#0f1f3a",
  ink: "#08111f",
  ivory: "#fbf9f5",
  champagne: "#c9a66b",
  sand: "#eadfcb",
  steel: "#9fb6d6",
  white: "#ffffff",
};

export const PHOTOS = [
  { file: "photos/lisbon.jpg", city: "Lisbon" },
  { file: "photos/malaga.jpg", city: "Málaga" },
  { file: "photos/rome.jpg", city: "Rome" },
  { file: "photos/athens.jpg", city: "Athens" },
  { file: "photos/playa-del-carmen.jpg", city: "Playa del Carmen" },
  { file: "photos/tamarindo.jpg", city: "Costa Rica" },
  { file: "photos/dubai-marina.jpg", city: "Dubai" },
];

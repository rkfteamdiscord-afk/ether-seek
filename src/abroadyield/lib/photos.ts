/**
 * Bundled destination photos (Unsplash License; see public/abroadyield/photos/CREDITS.md).
 * A photo URL set for a country in the admin always takes precedence.
 */
const PHOTOS: Record<string, { file: string; shows: string }> = {
  pt: { file: "lisbon", shows: "Baixa, Lisbon" },
  es: { file: "malaga", shows: "A white village in Andalusia" },
  it: { file: "rome", shows: "St. Peter's from the Tiber, Rome" },
  gr: { file: "athens", shows: "The Acropolis, Athens" },
  mx: { file: "playa-del-carmen", shows: "The Mexican Caribbean coast" },
  cr: { file: "tamarindo", shows: "Costa Rica" },
  ae: { file: "dubai-marina", shows: "Downtown Dubai" },
};

export function bundledPhoto(countryId: string): { src: string; shows: string } | undefined {
  const photo = PHOTOS[countryId];
  return photo ? { src: `/abroadyield/photos/${photo.file}.jpg`, shows: photo.shows } : undefined;
}

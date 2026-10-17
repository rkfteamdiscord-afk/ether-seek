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
  fr: { file: "paris", shows: "The Eiffel Tower, Paris" },
  gb: { file: "london", shows: "The Thames and Tower Bridge, London" },
  ie: { file: "cliffs-of-moher", shows: "The Cliffs of Moher, Ireland" },
  de: { file: "berlin", shows: "The Spree and the TV Tower, Berlin" },
  hr: { file: "dubrovnik", shows: "The old town of Dubrovnik" },
  pa: { file: "guna-yala", shows: "An island in Guna Yala, Panama" },
  co: { file: "la-serrana", shows: "Mountains at La Serrana, Colombia" },
  do: { file: "punta-cana", shows: "Palm trees in Punta Cana" },
  th: { file: "krabi", shows: "Longtail boats on Thailand's Andaman coast" },
  jp: { file: "kyoto", shows: "Yasaka Pagoda, Kyoto" },
};

export function bundledPhoto(countryId: string): { src: string; shows: string } | undefined {
  const photo = PHOTOS[countryId];
  return photo ? { src: `/abroadyield/photos/${photo.file}.jpg`, shows: photo.shows } : undefined;
}

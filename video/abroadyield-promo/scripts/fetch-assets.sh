#!/usr/bin/env sh
# Fetches the photos the 45-second promo needs (not committed, to keep the repository light).
# Aerial photos: Unsplash License; locations from the Unsplash dataset metadata.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/drone public/photos
while read -r name id; do
  [ -f "public/drone/$name.jpg" ] || curl -fsS -o "public/drone/$name.jpg" \
    "https://images.unsplash.com/photo-$id?w=3000&q=68&auto=format&fm=jpg"
done <<LIST
gaztelugatxe-spain 1518623489648-a173ef7824f3
navagio-greece 1548773668-75dd91b5f5bb
krka-croatia 1551482850-d649f078ed01
lagos-portugal 1526737511523-ba685f246e8c
santorini-greece 1548581148-4c17a21415d7
calanques-france 1514857887101-a6796efc65da
dubai-uae 1504556647341-3ce6ab157835
tokyo-japan 1496112933996-1aa94ac8a23f
azenhas-portugal 1473073826085-dafe61d85c04
durdle-door-uk 1452952797148-d161124db4c8
koh-adang-thailand 1567051961234-29b29288297a
paris-france 1439392929143-75708d4118e2
sayulita-mexico 1585337104660-008df43ed698
LIST
# Destination photos shared with the website.
for f in paris london cliffs-of-moher berlin dubrovnik guna-yala la-serrana punta-cana krabi kyoto; do
  [ -f "public/photos/$f.jpg" ] || cp "../../public/abroadyield/photos/$f.jpg" public/photos/
done
echo "Assets ready."

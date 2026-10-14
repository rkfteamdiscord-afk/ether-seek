# Film EquiMarge (15 s, 1920×1080, 60 i/s)

Film de motion design en boucle pour le site EquiMarge. Un point orange relie toutes les scènes :
l'interrupteur, le point du « i », le graphique en ressort, la forme, l'anneau de mots et la carte finale.

Tout tient dans `film.js` : chaque image est une fonction pure du temps, `seek(t)`. Il n'y a ni
transition CSS, ni minuteur, ni état conservé d'une image à l'autre (le contexte du canvas est remis
à zéro à chaque image). La dernière image est identique, au pixel près, à la première.

## Fabriquer et prévisualiser

```sh
python3 build.py                 # écrit equimarge-film.html (polices intégrées)
open equimarge-film.html         # lecteur : Espace, ← → image par image, Maj + ← → temps par temps
node render.mjs out 0 5.4 13.125 # images PNG aux instants voulus
node export.mjs equimarge-film.mp4 # vidéo MP4 H.264, 900 images (ffmpeg requis)
```

`equimarge-film.html?t=5.4` ouvre le film arrêté à 5,4 s ; `?capture=1` masque les commandes.

## Grille rythmique

128 BPM, 32 temps = 8 mesures = 15,00 s. Toutes les dates de `T` (dans `film.js`) sont exprimées
en temps : pour caler le film sur un autre morceau, il suffit de changer `BPM`.

| Temps | Instant | Événement                                                                     |
| ----- | ------- | ----------------------------------------------------------------------------- |
| 1     | 0,00 s  | Le curseur avance vers l'interrupteur                                         |
| 2     | 0,47 s  | Clic : l'interrupteur s'allume                                                |
| 3–4   | 0,94 s  | Le point s'envole, « librer ma » se plie, « Équi » et « marge » se rejoignent |
| 5     | 1,88 s  | Le point se pose sur le i ; É devient E, m devient M                          |
| 7–8   | 2,81 s  | Saut : le mot s'écrase en ligne, qui devient l'axe ; le point atterrit        |
| 9     | 3,75 s  | Pic du ressort (dépassement de la cible)                                      |
| 11–12 | 4,69 s  | Légende « +1 440 €/an » ; le point se pose à côté                             |
| 13–14 | 5,63 s  | Le point file sur la ligne puis remplit l'image en orange                     |
| 15–17 | 6,56 s  | Carré arrondi noir : deux quarts de tour, puis pilule                         |
| 18    | 7,97 s  | Contraction : un point orange sur noir                                        |
| 19–22 | 8,44 s  | Les mots sortent du point et tournent par crans                               |
| 23–25 | 10,31 s | L'anneau s'ouvre en trame, qui grossit au-delà du cadre                       |
| 26–28 | 11,72 s | Retournement : « EquiMarge », puis les deux lignes                            |
| 30–32 | 13,59 s | Retour par la trame, le graphique et l'interrupteur ; boucle à 15,00 s        |

Polices : Fraunces et Source Sans 3, sous licence SIL Open Font License 1.1 (téléchargées depuis
Google Fonts par `build.py`).

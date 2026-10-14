"""Assemble equimarge-film.html: shell + film.js + fonts embedded in base64.

The fonts (Fraunces and Source Sans 3, SIL Open Font License 1.1) are fetched
from Google Fonts on first build and cached in ./fonts.
"""

import base64
import pathlib
import re
import urllib.request

HERE = pathlib.Path(__file__).parent
FONTS = HERE / "fonts"
CSS_URL = (
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700"
    "&family=Source+Sans+3:wght@600;700&display=swap"
)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})) as r:
        return r.read()


def ensure_fonts() -> None:
    wanted = {"Fraunces": FONTS / "fraunces.woff2", "Source Sans 3": FONTS / "sourcesans3.woff2"}
    if all(p.exists() for p in wanted.values()):
        return
    FONTS.mkdir(exist_ok=True)
    css = fetch(CSS_URL).decode()
    for subset, body in re.findall(r"/\* (\S+) \*/\s*@font-face \{(.*?)\}", css, re.S):
        family = re.search(r"font-family: '([^']+)'", body).group(1)
        if subset != "latin" or wanted[family].exists():
            continue
        wanted[family].write_bytes(fetch(re.search(r"url\((\S+?)\)", body).group(1)))


def main() -> None:
    ensure_fonts()
    b64 = lambda name: base64.b64encode((FONTS / name).read_bytes()).decode()
    html = (HERE / "shell.html").read_text()
    html = html.replace("__FRAUNCES__", b64("fraunces.woff2")).replace("__SOURCESANS__", b64("sourcesans3.woff2"))
    html = html.replace("__FILMJS__", (HERE / "film.js").read_text())
    (HERE / "equimarge-film.html").write_text(html)
    print(f"equimarge-film.html: {len(html) // 1024} KB")


if __name__ == "__main__":
    main()

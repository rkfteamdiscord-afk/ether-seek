"use strict";
/*
 * EquiMarge — film de 15 s en motion design (1920×1080, 60 i/s).
 * Chaque image est une fonction pure du temps : seek(t) redessine tout.
 * Aucune transition CSS, aucun minuteur, aucun état conservé entre deux images.
 */
(() => {
  const W = 1920;
  const H = 1080;
  const FPS = 60;
  const BPM = 128;
  const BEAT = 60 / BPM; // 0,46875 s
  const DUR = 32 * BEAT; // 8 mesures = 15 s pile
  const b = (n) => n * BEAT;

  const COL = {
    paper: "#F6F1E7", // beige du site
    ink: "#171B14", // encre vert-noir du site, assombrie
    accent: "#F26A21", // l'unique accent : le point orange
    muted: "#8A8474",
    dash: "#C4BCAA",
    mutedInk: "#B4AE9F",
  };

  const COPY = {
    label: "Équilibrer ma marge",
    keep: [0, 1, 2, 3, 14, 15, 16, 17, 18], // É q u i … m a r g e
    hero: "EquıMarge", // « ı » sans point : le point orange devient son point
    heroFrom: ["É", "q", "u", "ı", "m", "a", "r", "g", "e"],
    axis: "MARGE",
    caption: "PENSIONS +20 €",
    value: "+1 440 €/an",
    ring: ["COÛT RÉEL", "PENSIONS", "ALERTES", "SIMULATEUR", "RAPPORT PDF"],
    title: "EquıMarge",
    line2: "Le vrai coût de chaque cheval.",
    line3: "0 TABLEUR",
  };

  // Temps forts, calés sur la grille de 128 BPM.
  const T = {
    click: b(1),
    launch: b(2),
    gather: b(2) + 0.3,
    land1: b(4),
    jump: b(6),
    land2: b(7),
    peak: b(8),
    callout: b(10),
    arrive: b(11),
    shoot: b(12),
    fill: b(13),
    square: b(13) + 0.06,
    turn1: b(14),
    turn2: b(15),
    pill: b(16),
    contract: b(17),
    ringIn: b(17) + 0.3,
    click1: b(19),
    click2: b(20),
    click3: b(21),
    openOut: b(22),
    grow: b(23),
    flip: b(24.25),
    title: b(25),
    line2: b(26),
    line3: b(27),
    ret: b(29),
    echo: b(30),
    rebuild: b(31),
  };

  /* ---------------------------------------------------------------- */
  /* Maths                                                             */
  /* ---------------------------------------------------------------- */

  const clamp = (x, a = 0, z = 1) => Math.min(z, Math.max(a, x));
  const lerp = (a, z, p) => a + (z - a) * p;
  const inv = (a, z, x) => clamp((x - a) / (z - a));
  const easeInCubic = (p) => p * p * p;
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
  const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeInOutQuart = (p) => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2);
  const easeInOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
  const smooth = (p) => p * p * (3 - 2 * p);

  /** Réponse indicielle fermée d'un ressort amorti (0 → 1). */
  function spring(t, w = 18, z = 0.55) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }

  // Le ressort du graphique : son dépassement maximal tombe pile un temps après le départ.
  const GZ = 0.4;
  const GW = Math.PI / BEAT / Math.sqrt(1 - GZ * GZ);
  const springG = (tau) => spring(tau, GW, GZ);

  /** Écrasement à l'impact (0 → pic → 0), pour les atterrissages du point. */
  const impact = (tau) => (tau <= 0 ? 0 : 1.6 * Math.exp(-9 * tau) * Math.sin(30 * tau));

  /** Ramène à zéro les résidus de ressort dans les dernières images, pour une boucle exacte. */
  const loopWindow = (t) => 1 - smooth(inv(DUR - 0.16, DUR - 1 / FPS, t));

  /* ---------------------------------------------------------------- */
  /* Matrices 2D                                                       */
  /* ---------------------------------------------------------------- */

  const mul = (m, n) => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
  const ID = [1, 0, 0, 1, 0, 0];
  const tr = (x, y) => [1, 0, 0, 1, x, y];
  const sc = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
  const about = (cx, cy, m) => mul(tr(cx, cy), mul(m, tr(-cx, -cy)));
  const pt = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  /** Translation, rotation, inclinaison horizontale puis échelle. */
  const tf = (x, y, sx = 1, sy = 1, rot = 0, skew = 0) => {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    return [c * sx, s * sx, c * skew * sy - s * sy, s * skew * sy + c * sy, x, y];
  };

  /* ---------------------------------------------------------------- */
  /* Mise en page (mesurée une fois, jamais modifiée ensuite)          */
  /* ---------------------------------------------------------------- */

  const FD = (s) => `700 ${s}px Fraunces`;
  const FU = (s, w = 700) => `${w} ${s}px "Source Sans 3"`;

  let ctx = null;
  let L = null;

  function measureTittle() {
    const size = 400;
    const c = document.createElement("canvas");
    c.width = 700;
    c.height = 700;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.font = FD(size);
    const ox = 250;
    const oy = 550;
    g.fillText("i", ox, oy);
    const a = g.getImageData(0, 0, 700, 700).data;
    g.clearRect(0, 0, 700, 700);
    g.fillText("ı", ox, oy);
    const d = g.getImageData(0, 0, 700, 700).data;
    let x0 = 1e9;
    let y0 = 1e9;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < 700; y++) {
      for (let x = 0; x < 700; x++) {
        const k = (y * 700 + x) * 4 + 3;
        if (a[k] > 128 && d[k] < 40) {
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
      }
    }
    return {
      dx: ((x0 + x1) / 2 - ox) / size,
      dy: ((y0 + y1) / 2 - oy) / size,
      r: (Math.max(x1 - x0, y1 - y0) / 2 + 1) / size,
    };
  }

  function layout() {
    const m = document.createElement("canvas").getContext("2d");
    const prefixes = (text, font, track = 0) => {
      m.font = font;
      const xs = [];
      for (let i = 0; i <= text.length; i++)
        xs.push(m.measureText(text.slice(0, i)).width + track * i);
      return xs;
    };
    const tit = measureTittle();

    // Ouverture : libellé + interrupteur, centrés ensemble.
    const label = { size: 116, text: COPY.label };
    label.xs = prefixes(label.text, FD(label.size));
    label.w = label.xs[label.text.length];
    const tg = { w: 196, h: 112, kr: 40, gap: 78 };
    const total = label.w + tg.gap + tg.w;
    label.x0 = W / 2 - total / 2;
    label.y = 580;
    tg.x = label.x0 + label.w + tg.gap;
    tg.y = 540 - tg.h / 2;
    tg.off = tg.x + tg.h / 2;
    tg.on = tg.x + tg.w - tg.h / 2;

    // Mot vedette.
    const hero = { size: 236, text: COPY.hero };
    hero.xs = prefixes(hero.text, FD(hero.size));
    hero.w = hero.xs[hero.text.length];
    hero.x0 = W / 2 - hero.w / 2;
    hero.y = 636;
    hero.cx = W / 2;
    hero.cy = hero.y - 0.36 * hero.size;

    // Graphique : la ligne cible passe par le centre de l'image.
    const G = { x0: 360, x1: 1560, y0: 800, yT: 540 };
    G.T = T.arrive - T.land2;

    const caption = { size: 36, track: 5, text: COPY.caption };
    caption.xs = prefixes(caption.text, FU(caption.size), caption.track);
    const value = { size: 112, text: COPY.value, font: FU(112, 800) };
    value.xs = prefixes(value.text, value.font);
    const axis = { size: 30, track: 6, text: COPY.axis };
    axis.xs = prefixes(axis.text, FU(axis.size), axis.track);

    // Anneau de mots.
    const ringSize = 64;
    const track = 7;
    m.font = FU(ringSize);
    const items = [];
    COPY.ring.forEach((word) => {
      for (const ch of word) items.push({ ch, w: m.measureText(ch).width + track, word: true });
      items.push({ ch: "•", w: 60, sep: true });
    });
    const len = items.reduce((s, it) => s + it.w, 0);
    const R = len / (2 * Math.PI);
    let acc = 0;
    for (const it of items) {
      it.a = (acc + it.w / 2) / R;
      acc += it.w;
    }
    const firstWord = items.findIndex((it) => it.sep);
    const ringOffset = -Math.PI / 2 - items[Math.floor(firstWord / 2)].a;

    // Carte finale.
    const title = { size: 196, text: COPY.title };
    title.xs = prefixes(title.text, FD(title.size));
    title.x0 = W / 2 - title.xs[title.text.length] / 2;
    title.y = 470;
    const line2 = { size: 62, text: COPY.line2, font: FU(62, 600) };
    line2.xs = prefixes(line2.text, line2.font);
    line2.x0 = W / 2 - line2.xs[line2.text.length] / 2;
    line2.y = 646;
    const line3 = { size: 40, track: 9, text: COPY.line3, font: FU(40, 700) };
    line3.xs = prefixes(line3.text, line3.font, line3.track);
    line3.x0 = W / 2 - (line3.xs[line3.text.length] - line3.track) / 2;
    line3.y = 744;

    const DR = tit.r * hero.size; // rayon du point orange
    const cursor = {
      p0: { x: tg.off + 128, y: 540 + 150 },
      pk: { x: tg.off + 6, y: 540 + 8 },
    };

    // Grille de trame.
    const SP = 30;
    const grid = [];
    for (let gx = W / 2 - SP * 32.5; gx <= W + SP; gx += SP) {
      for (let gy = H / 2 - SP * 18.5; gy <= H + SP; gy += SP) grid.push(gx, gy);
    }

    return {
      tit,
      label,
      tg,
      hero,
      G,
      caption,
      value,
      axis,
      ring: { items, R, size: ringSize, offset: ringOffset },
      title,
      line2,
      line3,
      DR,
      RBIG: 1180,
      cursor,
      SP,
      RMAX: SP * 0.74,
      grid,
      E0: { x: 300, y: 770 },
    };
  }

  /* ---------------------------------------------------------------- */
  /* Briques de dessin                                                 */
  /* ---------------------------------------------------------------- */

  const apply = (m) => ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

  function pillPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  }

  function disc(x, y, r, color, sx = 1, sy = 1) {
    if (r <= 0) return;
    apply(tf(x, y, sx, sy));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Texte lettre par lettre qui monte depuis sa ligne de base (entrée)
   * puis redescend sous elle (sortie), masqué par une bande horizontale.
   */
  function riseText(t, o) {
    const {
      base = ID,
      text,
      xs,
      x,
      y,
      size,
      font,
      color,
      tin,
      tout = null,
      stagger = 0.022,
      ghost = null,
    } = o;
    ctx.save();
    apply(base);
    ctx.beginPath();
    ctx.rect(-4000, y - 1.4 * size, 9000, 1.72 * size);
    ctx.clip();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === " ") continue;
      const pin = tin == null ? 1 : spring(t - (tin + i * stagger), 20, 0.66);
      if (pin <= 0) continue;
      const tOut = tout == null ? 1e9 : tout + i * stagger * 0.5;
      const pout = easeInCubic(inv(tOut, tOut + 0.16, t));
      if (pout >= 1) continue;
      const settle = o.window ?? 1;
      const dy = (1 - pin) * settle * 1.08 * size + pout * 1.15 * size;
      apply(mul(base, tr(x + xs[i], y + dy)));
      ctx.fillText(ch, 0, 0);
      if (ghost && ghost.index === i) {
        ctx.beginPath();
        ctx.arc(L.tit.dx * size, L.tit.dy * size, L.tit.r * size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------------------------------------------------------------- */
  /* Ouverture : clic, lettres, point sur le i                         */
  /* ---------------------------------------------------------------- */

  const knobX = (t) => L.tg.off + (L.tg.on - L.tg.off) * spring(t - T.click, 24, 0.5);
  const press = (t) =>
    t < T.click
      ? 1 - 0.14 * easeInOutSine(inv(T.click - 0.07, T.click, t))
      : 1 - 0.14 * (1 - spring(t - T.click, 26, 0.45));

  /** État d'une lettre conservée, du libellé vers le mot vedette. */
  function kept(k, t) {
    const li = COPY.keep[k];
    // Chaque mot se déplace d'un bloc (pas de chevauchement) ; chaque lettre
    // traîne un peu derrière son mot, ce qui la fait plier puis se redresser.
    const word = k < 4 ? 0 : 1;
    const t0 = T.gather + word * 0.07;
    const p = spring(t - t0, 13, 0.62);
    const lag = spring(t - (t0 + 0.03 * (k - word * 4)), 13, 0.62);
    const bend = -0.75 * (p - lag);
    let x = lerp(L.label.x0 + L.label.xs[li], L.hero.x0 + L.hero.xs[k], p);
    let y = lerp(L.label.y, L.hero.y, p);
    let size = lerp(L.label.size, L.hero.size, p);
    const push = 1 + 0.035 * easeInOutSine(inv(T.land1, T.jump, t));
    x = L.hero.cx + (x - L.hero.cx) * push;
    y = L.hero.cy + (y - L.hero.cy) * push;
    size *= push;
    let ch = COPY.heroFrom[k];
    let sy = 1;
    if (k === 0 || k === 4) {
      const q = inv(T.land1 - 0.08, T.land1 + 0.08, t);
      sy = Math.abs(Math.cos(Math.PI * q));
      if (q >= 0.5) ch = COPY.hero[k];
    }
    // Écrasement des lettres sur la ligne de base au moment du saut.
    const s0 = T.jump + 0.018 * Math.abs(k - 3);
    const squash = easeInCubic(inv(s0, s0 + 0.14, t));
    const adv = (L.hero.xs[k + 1] - L.hero.xs[k]) * (size / L.hero.size);
    return { x, y, size, ch, sy: sy * (1 - squash), adv, bend, squashed: squash >= 0.96 };
  }

  const heroTittle = (t) => {
    const s = kept(3, t);
    return { x: s.x + L.tit.dx * s.size, y: s.y + L.tit.dy * s.size, r: L.tit.r * s.size };
  };

  function drawOpen(t) {
    if (t >= T.land2) return;
    ctx.fillStyle = COL.ink;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";

    // Interrupteur.
    if (t < T.launch + 0.3) {
      const { x, y, w, h } = L.tg;
      const c = easeInCubic(inv(T.launch + 0.02, T.launch + 0.24, t));
      const ax = x + w - h / 2;
      const ay = y + h / 2;
      apply(about(ax, ay, sc(1 - c)));
      if (t >= T.click) {
        pillPath(x, y, knobX(t) + h / 2 - x, h, h / 2);
        ctx.fillStyle = COL.ink;
        ctx.fill();
      }
      pillPath(x + 3, y + 3, w - 6, h - 6, (h - 6) / 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = COL.ink;
      ctx.stroke();
    }

    if (t < T.launch) {
      // Libellé au repos : même tracé que la reconstruction de fin, pour une boucle exacte.
      riseText(t, {
        text: L.label.text.slice(0, 3) + "ı" + L.label.text.slice(4),
        xs: L.label.xs,
        x: L.label.x0,
        y: L.label.y,
        size: L.label.size,
        font: FD(L.label.size),
        color: COL.ink,
        tin: null,
        ghost: { index: 3 },
      });
      return;
    }
    // Lettres qui s'en vont : elles se plient et se couchent sur la ligne de base.
    ctx.font = FD(L.label.size);
    ctx.fillStyle = COL.ink;
    let j = 0;
    for (let i = 4; i <= 13; i++) {
      const ch = L.label.text[i];
      if (ch === " ") continue;
      const t0 = T.launch + 0.018 * j++;
      const f = easeInCubic(inv(t0, t0 + 0.17, t));
      if (f >= 1) continue;
      apply(tf(L.label.x0 + L.label.xs[i], L.label.y, 1, 1 - f, 0, -0.9 * f));
      ctx.fillText(ch, 0, 0);
    }

    // Lettres conservées, puis écrasées en une ligne qui devient l'axe du graphique.
    const lineStart = T.jump + 0.24;
    if (t < lineStart) {
      for (let k = 0; k < 9; k++) {
        const s = kept(k, t);
        if (s.squashed) {
          apply(ID);
          ctx.fillStyle = COL.ink;
          ctx.fillRect(s.x, s.y - 3, s.adv + 0.5, 6);
          continue;
        }
        ctx.font = FD(s.size);
        apply(tf(s.x, s.y, 1, Math.max(0.0001, s.sy), 0, s.bend));
        ctx.fillStyle = COL.ink;
        ctx.fillText(s.ch, 0, 0);
        // Le i garde son point d'encre jusqu'à l'arrivée du point orange.
        if (k === 3 && t < T.land1) {
          ctx.beginPath();
          ctx.arc(L.tit.dx * s.size, L.tit.dy * s.size, L.tit.r * s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      const first = kept(0, lineStart);
      const last = kept(8, lineStart);
      const m = easeInOutCubic(inv(lineStart, T.land2 - 0.03, t));
      const x0 = lerp(first.x, L.G.x0, m);
      const x1 = lerp(last.x + last.adv, L.G.x1, m);
      const y = lerp(first.y, L.G.y0, m);
      apply(ID);
      ctx.fillStyle = COL.ink;
      pillPath(x0, y - 3, x1 - x0, 6, 3);
      ctx.fill();
    }
  }

  /* ---------------------------------------------------------------- */
  /* Le point orange, d'un bout à l'autre du film                     */
  /* ---------------------------------------------------------------- */

  const graphPoint = (tau) => ({
    x: L.G.x0 + (L.G.x1 - L.G.x0) * clamp(tau / L.G.T),
    y: L.G.y0 - (L.G.y0 - L.G.yT) * springG(tau),
  });

  const echoPoint = (tau) => {
    const K = { x: L.tg.off, y: 540 };
    return {
      x: lerp(L.E0.x, K.x, clamp(tau / BEAT)),
      y: L.E0.y - (L.E0.y - K.y) * springG(3 * tau),
    };
  };

  function hop(a, z, p, height) {
    return { x: lerp(a.x, z.x, p), y: lerp(a.y, z.y, p) - 4 * height * p * (1 - p) };
  }

  function cardMatrix(t) {
    const open = spring(t - (T.flip + 0.15), 22, 0.55);
    const push = 1 + 0.02 * easeInOutSine(inv(T.title, T.ret, t));
    return about(W / 2, H / 2, sc(open * push, push));
  }

  function titleTittle(t) {
    const m = cardMatrix(t);
    const { title, tit } = L;
    const [x, y] = pt(
      m,
      title.x0 + title.xs[3] + tit.dx * title.size,
      title.y + tit.dy * title.size,
    );
    return { x, y, r: tit.r * title.size * Math.hypot(m[2], m[3]) };
  }

  function dot(t) {
    const C = { x: W / 2, y: H / 2 };
    const squash = (t0) => {
      const k = 0.3 * impact(t - t0);
      return { sx: 1 + k, sy: 1 - k };
    };
    if (t < T.launch) return { x: knobX(t), y: 540, r: L.tg.kr * press(t), sx: 1, sy: 1 };
    if (t < T.land1) {
      const u = inv(T.launch, T.land1, t);
      const e = heroTittle(T.land1);
      const p = hop({ x: knobX(T.launch), y: 540 }, e, u, 230);
      return { ...p, r: lerp(L.tg.kr, e.r, easeInOutSine(u)), sx: 1, sy: 1 };
    }
    if (t < T.jump) return { ...heroTittle(t), ...squash(T.land1) };
    if (t < T.land2) {
      const s = heroTittle(T.jump);
      const p = hop(s, { x: L.G.x0, y: L.G.y0 }, inv(T.jump, T.land2, t), 170);
      return { ...p, r: s.r, sx: 1, sy: 1 };
    }
    const r0 = heroTittle(T.jump).r;
    if (t < T.shoot) return { ...graphPoint(t - T.land2), r: r0, ...squash(T.land2) };
    if (t < T.shoot + 0.2) {
      const s = graphPoint(T.shoot - T.land2);
      const e = easeInOutQuart(inv(T.shoot, T.shoot + 0.2, t));
      return { x: lerp(s.x, C.x, e), y: lerp(s.y, C.y, e), r: r0, sx: 1, sy: 1 };
    }
    if (t < T.flip + 0.15) {
      let r = r0;
      if (t < T.contract) r = r0 + (L.RBIG - r0) * easeInCubic(inv(T.shoot + 0.2, T.fill, t));
      else r = r0 + (L.RBIG - r0) * (1 - easeInOutCubic(inv(T.contract, T.contract + 0.34, t)));
      return { ...C, r, sx: 1, sy: 1 };
    }
    if (t < T.title) {
      const e = titleTittle(T.title);
      const p = hop(C, e, inv(T.flip + 0.15, T.title, t), 90);
      return { ...p, r: lerp(r0, e.r, inv(T.flip + 0.15, T.title, t)), sx: 1, sy: 1 };
    }
    if (t < T.ret) return { ...titleTittle(t), ...squash(T.title) };
    if (t < T.echo) {
      const s = titleTittle(T.ret);
      const p = hop(s, L.E0, inv(T.ret, T.echo, t), 120);
      return { ...p, r: lerp(s.r, r0, inv(T.ret, T.echo, t)), sx: 1, sy: 1 };
    }
    const w = loopWindow(t);
    const e = echoPoint(t - T.echo);
    const grow = spring(t - T.rebuild, 22, 0.6);
    const k = 0.3 * impact(t - T.rebuild) * w;
    return {
      x: e.x,
      y: 540 + (e.y - 540) * w,
      r: r0 + (L.tg.kr - r0) * (1 - (1 - grow) * w),
      sx: 1 + k,
      sy: 1 - k,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Graphique : le point dessine sa propre courbe de ressort          */
  /* ---------------------------------------------------------------- */

  function drawGraph(t, d) {
    if (t < T.land2 || t > T.fill + 0.02) return;
    const { G } = L;
    apply(ID);
    // Ligne cible en pointillés, qui se lève depuis l'axe.
    const yd = G.y0 - (G.y0 - G.yT) * spring(t - T.land2, 14, 0.72);
    const xEnd = t < T.shoot ? G.x1 : Math.min(G.x1, d.x);
    ctx.setLineDash([16, 14]);
    ctx.lineWidth = 4;
    ctx.lineCap = "butt";
    ctx.strokeStyle = COL.dash;
    ctx.beginPath();
    ctx.moveTo(G.x0, yd);
    ctx.lineTo(xEnd, yd);
    ctx.stroke();
    ctx.setLineDash([]);
    // Axe (né des lettres écrasées).
    ctx.fillStyle = COL.ink;
    pillPath(G.x0, G.y0 - 3, G.x1 - G.x0, 6, 3);
    ctx.fill();

    riseText(t, {
      text: L.axis.text,
      xs: L.axis.xs,
      x: G.x0,
      y: yd - 24,
      size: L.axis.size,
      font: FU(L.axis.size),
      color: COL.muted,
      tin: T.land2 + 0.12,
      stagger: 0.02,
    });

    // Tracé : exactement la fonction qui déplace le point.
    const tauNow = Math.min(t - T.land2, T.shoot - T.land2);
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = COL.ink;
    ctx.beginPath();
    const steps = Math.max(2, Math.ceil(tauNow * 240));
    for (let i = 0; i <= steps; i++) {
      const p = graphPoint((tauNow * i) / steps);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Légende.
    const vw = L.value.xs[L.value.text.length];
    const cw = L.caption.xs[L.caption.text.length] - L.caption.track;
    riseText(t, {
      text: L.caption.text,
      xs: L.caption.xs,
      x: G.x1 - cw,
      y: G.yT - 184,
      size: L.caption.size,
      font: FU(L.caption.size),
      color: COL.muted,
      tin: T.callout,
      stagger: 0.018,
    });
    riseText(t, {
      text: L.value.text,
      xs: L.value.xs,
      x: G.x1 - vw,
      y: G.yT - 66,
      size: L.value.size,
      font: L.value.font,
      color: COL.ink,
      tin: T.callout + 0.07,
      stagger: 0.026,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Forme : cercle → carré arrondi → pilule, puis contraction        */
  /* ---------------------------------------------------------------- */

  function drawShape(t, d) {
    if (t < T.square || t > T.contract + 0.3) return;
    const s1 = spring(t - T.square, 16, 0.55);
    const size = 340 * s1;
    const rot = (Math.PI / 2) * (spring(t - T.turn1, 16, 0.42) + spring(t - T.turn2, 16, 0.42));
    const p = spring(t - T.pill, 15, 0.6);
    const z = d.r / L.RBIG;
    const hc = 1 - easeInCubic(inv(T.contract, T.contract + 0.2, t));
    const w = lerp(size, 1000, p) * z;
    const h = lerp(size, 210, p) * z * hc;
    const cr =
      lerp(size * lerp(0.5, 0.24, clamp(s1)), h / Math.max(z * hc, 1e-6) / 2, clamp(p)) * z;
    if (w <= 0.5 || h <= 0.5) return;
    apply(tf(d.x, d.y, 1, 1, rot));
    pillPath(-w / 2, -h / 2, w, h, Math.min(cr, h / 2, w / 2));
    ctx.fillStyle = COL.ink;
    ctx.fill();
  }

  /* ---------------------------------------------------------------- */
  /* Typo cinétique : un anneau de mots autour du point               */
  /* ---------------------------------------------------------------- */

  const front = (t) => 1800 * easeInCubic(inv(T.openOut - 0.05, T.grow + 0.05, t));

  function drawRing(t, d) {
    if (t < T.ringIn || t > T.grow + 0.1) return;
    const { items, R, size, offset } = L.ring;
    const F = front(t);
    const spin =
      offset +
      0.12 * (t - T.ringIn) +
      (Math.PI / 4) *
        (spring(t - T.click1, 20, 0.5) +
          spring(t - T.click2, 20, 0.5) +
          spring(t - T.click3, 20, 0.5));
    ctx.font = FU(size);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = COL.paper;
    items.forEach((it, j) => {
      const rin = R * spring(t - (T.ringIn + 0.008 * j), 15, 0.6);
      if (rin <= 0) return;
      const r = Math.max(rin, F > R ? F : 0);
      const sIn = clamp(rin / R);
      const sOut = 1 - clamp((F - R) / 140);
      const a = spin + it.a;
      const s = sIn * sOut;
      if (sOut < 0.22) {
        // La lettre devient un point de la trame.
        disc(d.x + r * Math.cos(a), d.y + r * Math.sin(a), 2.4, COL.paper);
        return;
      }
      if (it.sep) {
        const rr = r + 0.33 * size * s;
        disc(d.x + rr * Math.cos(a), d.y + rr * Math.sin(a), 6.5 * s, COL.paper);
        return;
      }
      apply(tf(d.x + r * Math.cos(a), d.y + r * Math.sin(a), s, s, a + Math.PI / 2));
      ctx.fillText(it.ch, 0, 0);
    });
    ctx.textAlign = "left";
  }

  /* ---------------------------------------------------------------- */
  /* Trame de points                                                   */
  /* ---------------------------------------------------------------- */

  function drawHalftone(t, d) {
    const inField = t >= T.openOut - 0.05 && t < T.flip;
    const inFlood = t >= T.ret + 0.06 && t < T.echo;
    if (!inField && !inFlood) return;
    const { grid, RMAX } = L;
    apply(ID);
    ctx.fillStyle = COL.paper;
    ctx.beginPath();
    if (inField) {
      const F = front(t);
      const Gr = 1750 * easeInCubic(inv(T.grow, T.flip, t));
      for (let i = 0; i < grid.length; i += 2) {
        const x = grid[i];
        const y = grid[i + 1];
        const dist = Math.hypot(x - d.x, y - d.y);
        // Les points naissent derrière le front de l'onde, jamais devant.
        const appear = clamp((F + 10 - dist) / 40);
        if (appear <= 0) continue;
        let r =
          (2.3 + 5 * Math.exp(-((dist / 150) ** 2)) + 6 * Math.exp(-(((dist - F) / 34) ** 2))) *
          appear;
        if (Gr > 0) r = lerp(r, RMAX, smooth(clamp((Gr - dist) / 300)));
        else r = Math.min(r, Math.max(0, dist - d.r - 5));
        if (r <= 0.2) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    } else {
      const Gf = 2300 * easeInCubic(inv(T.ret + 0.06, T.echo, t));
      for (let i = 0; i < grid.length; i += 2) {
        const x = grid[i];
        const y = grid[i + 1];
        const dist = Math.hypot(x - d.x, y - d.y);
        if (dist > Gf + 160) continue;
        let r;
        if (dist > Gf) r = 2.3 * (1 - (dist - Gf) / 160);
        else
          r = lerp(
            2.3 + 5 * Math.exp(-((dist / 150) ** 2)),
            RMAX,
            smooth(clamp((Gf - dist) / 240)),
          );
        if (r <= 0.2) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  /* ---------------------------------------------------------------- */
  /* Retournement et carte finale                                      */
  /* ---------------------------------------------------------------- */

  function drawCard(t) {
    if (t >= T.flip && t < T.flip + 0.15) {
      const sx = 1 - easeInCubic(inv(T.flip, T.flip + 0.15, t));
      apply(ID);
      ctx.fillStyle = COL.paper;
      ctx.fillRect(W / 2 - (W / 2) * sx, 0, W * sx, H);
      return;
    }
    if (t < T.flip + 0.15 || t >= T.echo) return;
    const base = cardMatrix(t);
    const { title, line2, line3 } = L;
    riseText(t, {
      base,
      text: title.text,
      xs: title.xs,
      x: title.x0,
      y: title.y,
      size: title.size,
      font: FD(title.size),
      color: COL.paper,
      tin: null,
      tout: T.ret,
      stagger: 0.02,
    });
    riseText(t, {
      base,
      text: line2.text,
      xs: line2.xs,
      x: line2.x0,
      y: line2.y,
      size: line2.size,
      font: line2.font,
      color: COL.mutedInk,
      tin: T.line2,
      tout: T.ret + 0.04,
      stagger: 0.012,
    });
    riseText(t, {
      base,
      text: line3.text,
      xs: line3.xs,
      x: line3.x0,
      y: line3.y,
      size: line3.size,
      font: line3.font,
      color: COL.paper,
      tin: T.line3,
      tout: T.ret + 0.06,
      stagger: 0.02,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Retour : écho du graphique puis reconstruction de l'ouverture     */
  /* ---------------------------------------------------------------- */

  function drawEcho(t) {
    if (t < T.echo || t > T.rebuild + 0.25) return;
    const tau = t - T.echo;
    const tail = 0.15;
    const from = Math.max(0, tau - tail);
    if (tau - from <= 0.001) return;
    apply(ID);
    ctx.strokeStyle = COL.ink;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const p = echoPoint(lerp(from, tau, i / steps));
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function drawRebuild(t) {
    if (t < T.rebuild - 0.08) return;
    const w = loopWindow(t);
    const { label, tg } = L;
    // Contour de l'interrupteur, tracé depuis le point.
    const q = easeOutCubic(inv(T.rebuild, T.rebuild + 0.34, t));
    const per = 2 * (tg.w - tg.h) + Math.PI * (tg.h - 6);
    apply(ID);
    ctx.lineWidth = 6;
    ctx.strokeStyle = COL.ink;
    if (q >= 1) {
      pillPath(tg.x + 3, tg.y + 3, tg.w - 6, tg.h - 6, (tg.h - 6) / 2);
      ctx.stroke();
    } else {
      ctx.setLineDash([per * q, per]);
      ctx.lineDashOffset = 0;
      ctx.beginPath();
      // On part du point (bord gauche) et on fait le tour dans les deux sens visuels.
      const r = (tg.h - 6) / 2;
      const x0 = tg.x + 3;
      const y0 = tg.y + 3;
      const ww = tg.w - 6;
      ctx.moveTo(x0, y0 + r);
      ctx.arc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5);
      ctx.lineTo(x0 + ww - r, y0);
      ctx.arc(x0 + ww - r, y0 + r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x0 + r, y0 + 2 * r);
      ctx.arc(x0 + r, y0 + r, r, Math.PI / 2, Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Libellé, lettre par lettre.
    riseText(t, {
      text: label.text.slice(0, 3) + "ı" + label.text.slice(4),
      xs: label.xs,
      x: label.x0,
      y: label.y,
      size: label.size,
      font: FD(label.size),
      color: COL.ink,
      tin: T.rebuild - 0.08,
      stagger: 0.011,
      window: w,
      ghost: { index: 3 },
    });
  }

  /* ---------------------------------------------------------------- */
  /* Curseur                                                           */
  /* ---------------------------------------------------------------- */

  const CURSOR = [
    [0, 0],
    [0, 32],
    [7.5, 25],
    [12.5, 36.5],
    [17.6, 34.3],
    [12.7, 23],
    [22.6, 23],
  ];

  function cursorState(t) {
    const { p0, pk } = L.cursor;
    const pressC =
      t < T.click
        ? 1 - 0.16 * easeInOutSine(inv(T.click - 0.07, T.click, t))
        : 1 - 0.16 * (1 - spring(t - T.click, 28, 0.5));
    if (t < T.click) {
      const e = easeInOutCubic(t / T.click);
      return { x: lerp(p0.x, pk.x, e), y: lerp(p0.y, pk.y, e), s: pressC };
    }
    if (t < T.rebuild) {
      const e = easeInCubic(inv(T.click + 0.14, T.launch + 0.3, t));
      return { x: lerp(pk.x, pk.x + 560, e), y: lerp(pk.y, 1290, e), s: pressC };
    }
    // Le curseur se pose avant la dernière image : première et dernière images identiques.
    const e = easeOutCubic(inv(T.rebuild + 0.04, DUR - 0.1, t));
    return { x: lerp(p0.x + 440, p0.x, e), y: lerp(1290, p0.y, e), s: 1 };
  }

  function drawCursor(t) {
    const c = cursorState(t);
    if (c.y > H + 10) return;
    apply(tf(c.x, c.y, 2.35 * c.s, 2.35 * c.s));
    ctx.beginPath();
    CURSOR.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = COL.paper;
    ctx.fillStyle = COL.ink;
    ctx.fill();
    ctx.stroke();
  }

  /* ---------------------------------------------------------------- */
  /* Image                                                             */
  /* ---------------------------------------------------------------- */

  function seek(time) {
    const t = ((time % DUR) + DUR) % DUR;
    // Contexte remis à neuf : aucun réglage ne passe d'une image à la suivante.
    if (typeof ctx.reset === "function") ctx.reset();
    else {
      ctx.restore();
      ctx.setLineDash([]);
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      ctx.lineDashOffset = 0;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    apply(ID);
    ctx.globalAlpha = 1;
    ctx.fillStyle = t < T.fill || t >= T.echo ? COL.paper : COL.ink;
    ctx.fillRect(0, 0, W, H);

    const d = dot(t);
    drawHalftone(t, d);
    drawCard(t);
    drawOpen(t);
    drawGraph(t, d);
    drawRing(t, d);
    drawEcho(t);
    drawRebuild(t);
    disc(d.x, d.y, d.r, COL.accent, d.sx, d.sy);
    drawShape(t, d);
    drawCursor(t);
    apply(ID);
    return t;
  }

  /* ---------------------------------------------------------------- */
  /* Lecteur                                                           */
  /* ---------------------------------------------------------------- */

  const beats = Object.fromEntries(
    Object.entries(T).map(([k, v]) => [k, Math.round((v / BEAT) * 100) / 100]),
  );

  async function boot() {
    const canvas = document.getElementById("film");
    ctx = canvas.getContext("2d");
    await Promise.all([
      document.fonts.load(FD(100)),
      document.fonts.load(FU(40, 700)),
      document.fonts.load(FU(40, 600)),
    ]);
    L = layout();
    window.FILM = { seek, W, H, FPS, BPM, BEAT, DUR, T, beats, frames: Math.round(DUR * FPS) };

    const params = new URLSearchParams(location.search);
    const ui = document.getElementById("ui");
    if (params.has("capture")) {
      document.body.classList.add("capture");
      seek(Number(params.get("t") || 0));
      return;
    }
    const scrub = document.getElementById("scrub");
    const readout = document.getElementById("readout");
    const playBtn = document.getElementById("play");
    scrub.max = String(window.FILM.frames - 1);
    let playing = !params.has("t");
    let origin = performance.now() - Number(params.get("t") || 0) * 1000;
    let current = Number(params.get("t") || 0);

    const show = (t) => {
      current = seek(t);
      const frame = Math.floor(current * FPS + 1e-6);
      scrub.value = String(frame);
      readout.textContent = `${current.toFixed(2).replace(".", ",")} s · temps ${Math.floor(current / BEAT + 1e-6) + 1}/32 · image ${frame + 1}/${window.FILM.frames}`;
    };
    const tick = (now) => {
      if (playing) show((now - origin) / 1000);
      requestAnimationFrame(tick);
    };
    const setPlaying = (p) => {
      playing = p;
      origin = performance.now() - current * 1000;
      playBtn.textContent = p ? "Pause" : "Lecture";
      playBtn.setAttribute("aria-pressed", String(p));
    };
    playBtn.addEventListener("click", () => setPlaying(!playing));
    scrub.addEventListener("input", () => {
      setPlaying(false);
      show(Number(scrub.value) / FPS);
    });
    document.getElementById("prevBeat").addEventListener("click", () => {
      setPlaying(false);
      show(Math.max(0, Math.ceil(current / BEAT - 1.001) * BEAT));
    });
    document.getElementById("nextBeat").addEventListener("click", () => {
      setPlaying(false);
      show(Math.min(DUR - 1 / FPS, Math.floor(current / BEAT + 1.001) * BEAT));
    });
    window.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement && e.key !== " ") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying(!playing);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        setPlaying(false);
        const step = e.shiftKey ? BEAT : 1 / FPS;
        show(current + (e.key === "ArrowRight" ? step : -step) + DUR);
      }
    });
    ui.hidden = false;
    setPlaying(playing);
    show(current);
    requestAnimationFrame(tick);
  }

  boot();
})();

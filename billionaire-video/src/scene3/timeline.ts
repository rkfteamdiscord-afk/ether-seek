import { Easing, interpolate } from "remotion";

// Scene 3 runs 7 s at 30 fps (210 frames). The music is 120 BPM, so one beat
// is 15 frames and every cut lands on a beat.
export const SCENE3_FPS = 30;
export const SCENE3_FRAMES = 210;

export const T = {
  cutToDeck: 30, // wide yacht -> deck (beat 3, accented kick)
  sighStart: 90, // after two full seconds of looking at the view
  watchStart: 105,
  phoneStart: 122,
  tossStart: 138,
  phoneRelease: 141,
  phoneLands: 147, // musical accent at 4.9 s
  cutToEyeRoll: 150,
  drop: 165, // comic brass drop, impassive close-up
  zoomOutStart: 180,
  end: 210, // hard cut
} as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.45, 0, 0.2, 1);

export const ramp = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = smooth,
) => interpolate(frame, input, output, { ...clamp, easing });

// The deck set (a 1080 x 1920 frame, eye level) is placed on the yacht's aft
// deck inside the aerial world, so the final zoom out is one continuous move.
export const DECK = { x: 212.7, y: 1045.4, k: 0.032 } as const;
export const deckToWorld = (x: number, y: number) => ({
  x: DECK.x + x * DECK.k,
  y: DECK.y + y * DECK.k,
});

export type Camera = { z: number; fx: number; fy: number };

const deckShot = (zoom: number, x: number, y: number): Camera => {
  const p = deckToWorld(x, y);
  return { z: zoom / DECK.k, fx: p.x, fy: p.y };
};

const FACE = { x: 540, y: 845 };

export const cameraAt = (frame: number): Camera => {
  if (frame < T.cutToDeck) {
    // Drone push-in on the superyacht.
    return {
      z: ramp(frame, [0, T.cutToDeck], [1, 1.16], Easing.out(Easing.quad)),
      fx: ramp(frame, [0, T.cutToDeck], [560, 470]),
      fy: ramp(frame, [0, T.cutToDeck], [980, 1040]),
    };
  }
  if (frame < T.sighStart) {
    // Slow luxurious dolly while he contemplates the horizon.
    return deckShot(
      ramp(frame, [T.cutToDeck, T.sighStart], [1, 1.1]),
      ramp(frame, [T.cutToDeck, T.sighStart], [540, 560]),
      ramp(frame, [T.cutToDeck, T.sighStart], [960, 930]),
    );
  }
  if (frame < T.cutToEyeRoll) {
    // Medium shot: sigh, watch, phone, toss.
    return deckShot(
      ramp(frame, [T.sighStart, T.cutToEyeRoll], [1.18, 1.3]),
      ramp(frame, [T.sighStart, T.cutToEyeRoll], [540, 520]),
      1060,
    );
  }
  if (frame < T.zoomOutStart) {
    // Close-up on the face: eye roll, then the impassive stare.
    return deckShot(
      ramp(frame, [T.cutToEyeRoll, T.zoomOutStart], [3.3, 3.75]),
      FACE.x,
      ramp(frame, [T.cutToEyeRoll, T.zoomOutStart], [870, 860]),
    );
  }
  // One continuous exponential zoom out revealing the whole yacht.
  const start = deckShot(3.75, FACE.x, 860);
  const end = { z: 0.92, fx: 560, fy: 1010 };
  const t = ramp(frame, [T.zoomOutStart, T.end - 2], [0, 1], Easing.bezier(0.55, 0, 0.25, 1));
  const z = Math.exp(Math.log(start.z) + (Math.log(end.z) - Math.log(start.z)) * t);
  // Moving the focus with 1/z keeps the face anchored on screen as it shrinks.
  const s = (1 / z - 1 / start.z) / (1 / end.z - 1 / start.z);
  return { z, fx: start.fx + (end.fx - start.fx) * s, fy: start.fy + (end.fy - start.fy) * s };
};

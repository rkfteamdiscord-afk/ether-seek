// Measured narration timings, keyed by line id: word start times and line end, in seconds
// from the start of each voice clip. Written by scripts/voice-launch.py (Kokoro, voice af_heart).
export const MEASURED: Record<string, { starts: number[]; end: number }> = {
  "01-open": {
    starts: [0.0, 0.247, 0.493, 1.064, 1.309, 1.708, 1.953],
    end: 2.463,
  },
  "02-listing": {
    starts: [0.0, 0.212, 0.556, 1.032, 1.377],
    end: 1.87,
  },
  "03-reality": {
    starts: [0.0, 0.196, 0.515, 0.957, 1.153, 1.349, 1.546, 1.865],
    end: 2.24,
  },
  "04-nobody": {
    starts: [0.0, 0.483, 0.697, 0.911, 1.126, 1.717, 2.15],
    end: 2.477,
  },
  "05-logo": {
    starts: [0.0, 0.31],
    end: 1.094,
  },
  "06-promise": {
    starts: [
      0.0, 0.225, 0.451, 0.817, 1.042, 1.549, 2.341, 2.832, 3.323, 3.625, 4.324,
      4.589, 4.854, 5.119,
    ],
    end: 5.476,
  },
  "07-questions": {
    starts: [0.0, 0.487, 0.786, 1.643, 1.853],
    end: 2.383,
  },
  "08-ranking": {
    starts: [0.0, 0.216, 0.433, 0.649, 1.348, 1.818, 2.158, 2.498, 2.707],
    end: 3.052,
  },
  "09-numbers": {
    starts: [0.0, 0.604, 1.756, 2.225, 2.513, 2.801, 3.661, 3.941, 4.22, 4.499],
    end: 4.876,
  },
  "10-unlock": {
    starts: [0.0, 0.226, 0.592, 0.818, 1.043],
    end: 1.532,
  },
  "11-waterfall": {
    starts: [
      0.0, 0.492, 0.848, 1.066, 1.285, 1.504, 1.723, 1.941, 2.434, 2.652, 2.871,
      3.09,
    ],
    end: 3.745,
  },
  "12-simulator": {
    starts: [
      0.0, 0.278, 0.556, 1.355, 1.643, 1.931, 2.579, 3.649, 3.883, 4.263, 4.788,
    ],
    end: 5.141,
  },
  "13-sections": {
    starts: [
      0.0, 0.534, 1.26, 1.843, 2.544, 3.587, 3.885, 4.695, 5.548, 5.788, 6.028,
      6.567,
    ],
    end: 7.08,
  },
  "14-assistant": {
    starts: [0.0, 1.002, 1.249, 1.497, 2.238, 2.611, 2.84, 3.069, 3.299, 3.528],
    end: 4.045,
  },
  "15-deliver": {
    starts: [0.0, 0.535, 0.865, 1.558, 1.798, 2.039, 2.429],
    end: 2.93,
  },
  "16-trust": {
    starts: [0.0, 0.476, 0.82, 1.164, 1.376],
    end: 1.87,
  },
  "17-pricing": {
    starts: [0.0, 0.229, 0.602, 0.831, 1.413, 1.671, 1.93, 2.693, 3.334, 3.797],
    end: 4.203,
  },
  "18-next": {
    starts: [0.0, 0.215, 0.43, 0.779, 0.993, 1.208],
    end: 1.547,
  },
  "19-finale": {
    starts: [0.0, 1.184, 1.385, 1.586, 1.787, 1.988, 2.315],
    end: 2.631,
  },
};

// True once public/launch/voice/<id>.mp3 files exist for every line.
export const VOICE_READY = true;

import { normalizeDeg } from '../core/angles.js';

export const HUMAN_DESIGN_GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60
];

export const HUMAN_DESIGN_GATE_SPAN_DEG = 360 / 64;
export const HUMAN_DESIGN_LINE_SPAN_DEG = HUMAN_DESIGN_GATE_SPAN_DEG / 6;
export const HUMAN_DESIGN_COLOR_SPAN_DEG = HUMAN_DESIGN_LINE_SPAN_DEG / 6;
export const HUMAN_DESIGN_TONE_SPAN_DEG = HUMAN_DESIGN_COLOR_SPAN_DEG / 6;
export const HUMAN_DESIGN_BASE_SPAN_DEG = HUMAN_DESIGN_TONE_SPAN_DEG / 5;

// Gate 41 begins at 02°00'00" Aquarius in the standard Rave Mandala.
export const HUMAN_DESIGN_MANDALA_START_DEG = 302;

export const HUMAN_DESIGN_MANDALA = HUMAN_DESIGN_GATE_SEQUENCE.map((gate, index) => {
  const startDeg = normalizeDeg(HUMAN_DESIGN_MANDALA_START_DEG + index * HUMAN_DESIGN_GATE_SPAN_DEG);
  const endDeg = normalizeDeg(startDeg + HUMAN_DESIGN_GATE_SPAN_DEG);

  return {
    gate,
    index,
    startDeg,
    endDeg
  };
});

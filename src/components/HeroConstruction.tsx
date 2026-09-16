import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { clamp, lerp } from '../utils/formatters';

interface HeroConstructionProps {
  onOpenEnquiry: () => void;
}

const TOTAL_FRAMES = 30;
const FRAME_PATHS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/assets/construction_frames/frame_${String(i + 1).padStart(2, '0')}.webp`
);

interface Chapter {
  id: string;
  num: string;
  navTitle: string;
  timeLabel: string;
  phaseName: string;
  label: string;
  primaryHeadline: string;
  secondaryHeadline: string;
  statement: string;
  range: [number, number]; // [start, end]
  position: 'bottom-left' | 'top-left' | 'bottom-right' | 'top-right';
  align: 'left' | 'right';
  focalLabel: string;
  shotType: string;
  cta?: {
    type: 'scroll' | 'explore' | 'enquire';
    label: string;
  };
}

const CHAPTERS: Chapter[] = [
  {
    id: 'day',
    num: '01',
    navTitle: 'DAY',
    timeLabel: '11:30 AM',
    phaseName: 'DAYLIGHT',
    label: '01 / THE DAY BEGINS',
    primaryHeadline: 'THE DAY BEGINS',
    secondaryHeadline: 'NATURAL ARCHITECTURAL LIGHT.',
    statement: 'PURE MONOLITHIC CONCRETE ELEVATION IN CRISP DAYLIGHT.',
    range: [0.00, 0.20],
    position: 'bottom-left',
    align: 'left',
    focalLabel: '24mm F/2.8',
    shotType: 'NATURAL DAYLIGHT ESTABLISHING',
    cta: {
      type: 'scroll',
      label: 'SCROLL TO EXPERIENCE',
    },
  },
  {
    id: 'afternoon',
    num: '02',
    navTitle: 'AFTERNOON',
    timeLabel: '04:15 PM',
    phaseName: 'LATE AFTERNOON',
    label: '02 / LATE AFTERNOON',
    primaryHeadline: 'WHERE SHADOW',
    secondaryHeadline: 'DEFINES FORM.',
    statement: 'RAKING SUNLIGHT CASTS DELICATE SHADOWS ALONG THE TOWER AXIS.',
    range: [0.20, 0.40],
    position: 'top-left',
    align: 'left',
    focalLabel: '35mm F/2.8',
    shotType: 'WARM AFTERNOON SHADOW FORM',
  },
  {
    id: 'golden_hour',
    num: '03',
    navTitle: 'GOLDEN HOUR',
    timeLabel: '06:40 PM',
    phaseName: 'GOLDEN HOUR',
    label: '03 / GOLDEN HOUR',
    primaryHeadline: 'WHERE LIGHT',
    secondaryHeadline: 'MEETS ARCHITECTURE.',
    statement: 'RADIANT SUNSET EMBERS GRAZE PRIVATE BALCONIES & FAÇADE LOUVERS.',
    range: [0.40, 0.60],
    position: 'bottom-right',
    align: 'right',
    focalLabel: '50mm F/2.0',
    shotType: 'DIRECTIONAL SUNSET GRAZING',
  },
  {
    id: 'dusk',
    num: '04',
    navTitle: 'DUSK',
    timeLabel: '07:25 PM',
    phaseName: 'DUSK TWILIGHT',
    label: '04 / THE DUSK',
    primaryHeadline: 'THE CITY',
    secondaryHeadline: 'CHANGES.',
    statement: 'DEEP BLUE-HOUR SKY SETTLES AS NATURAL DAYLIGHT QUIETLY RECEDES.',
    range: [0.60, 0.75],
    position: 'bottom-left',
    align: 'left',
    focalLabel: '70mm F/1.8',
    shotType: 'BLUE HOUR SKY & RESIDENCE DETAIL',
  },
  {
    id: 'evening',
    num: '05',
    navTitle: 'EVENING',
    timeLabel: '08:30 PM',
    phaseName: 'EVENING ILLUMINATION',
    label: '05 / RESIDENCES AWAKEN',
    primaryHeadline: 'THE RESIDENCES',
    secondaryHeadline: 'COME ALIVE.',
    statement: 'WARM PRIVATE INTERIORS ILLUMINATE FLOOR BY FLOOR ACROSS THE TOWER.',
    range: [0.75, 0.88],
    position: 'top-right',
    align: 'right',
    focalLabel: '50mm F/2.0',
    shotType: 'RESIDENTIAL OCCUPANCY EMERGENCE',
  },
  {
    id: 'night',
    num: '06',
    navTitle: 'NIGHT',
    timeLabel: '09:45 PM',
    phaseName: 'MIDNIGHT HERO',
    label: '06 / THE NIGHT',
    primaryHeadline: 'AMEER HEIGHTS',
    secondaryHeadline: 'TOWER 10',
    statement: 'MAIN BZU CHOWK · BOSAN ROAD',
    range: [0.88, 1.00],
    position: 'bottom-left',
    align: 'left',
    focalLabel: '35mm F/2.8',
    shotType: 'COMMANDING NIGHT ARCHITECTURE',
    cta: {
      type: 'enquire',
      label: 'DISCOVER YOUR RESIDENCE',
    },
  },
];

interface CameraState {
  scale: number;
  panX: number;
  panY: number;
}

/**
 * Calculates continuous, mathematically stable camera state across scroll progress.
 * Strictly deterministic function: scale = scaleForProgress(currentProgress).
 * Zero transform accumulation, zero angular tilt wobble, zero horizontal jitter.
 */
function getCameraState(p: number): CameraState {
  const clamped = clamp(p, 0, 1);

  // Smooth architectural zoom trajectory:
  // 0.00 -> 0.94 (Establishing site view)
  // 0.25 -> 1.04 (Approach & lower columns)
  // 0.55 -> 1.15 (Mid-rise balconies & details)
  // 0.80 -> 1.10 (Vertical ascent towards crown)
  // 1.00 -> 1.02 (Majestic complete tower framing)
  let scale: number;
  let panY: number;

  if (clamped < 0.25) {
    const t = clamped / 0.25;
    const s = t * t * (3 - 2 * t);
    scale = lerp(0.94, 1.04, s);
    panY = lerp(0.020, 0.005, s);
  } else if (clamped < 0.55) {
    const t = (clamped - 0.25) / 0.30;
    const s = t * t * (3 - 2 * t);
    scale = lerp(1.04, 1.15, s);
    panY = lerp(0.005, -0.025, s);
  } else if (clamped < 0.80) {
    const t = (clamped - 0.55) / 0.25;
    const s = t * t * (3 - 2 * t);
    scale = lerp(1.15, 1.10, s);
    panY = lerp(-0.025, -0.012, s);
  } else {
    const t = (clamped - 0.80) / 0.20;
    const s = t * t * (3 - 2 * t);
    scale = lerp(1.10, 1.02, s);
    panY = lerp(-0.012, 0.000, s);
  }

  return {
    scale,
    panX: 0,
    panY,
  };
}

// =========================================================================
// ENVIRONMENTAL LIGHTING & ATMOSPHERE ENGINE
// Mathematical interpolation for Day -> Late Afternoon -> Golden Hour -> Dusk -> Night
// =========================================================================

type RGB = [number, number, number];

function lerpRGB(c1: RGB, c2: RGB, factor: number): RGB {
  const f = clamp(factor, 0, 1);
  return [
    Math.round(lerp(c1[0], c2[0], f)),
    Math.round(lerp(c1[1], c2[1], f)),
    Math.round(lerp(c1[2], c2[2], f)),
  ];
}

function rgbStr(c: RGB): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

interface EnvironmentState {
  skyZenith: string;
  skyHorizon: string;
  skyGround: string;
  skyCssGradient: string;
  goldenRake: number;
  nightMultiply: number;
  duskMultiplyTop: RGB;
  duskMultiplyBot: RGB;
  architecturalLight: number;
  windowLightActive: boolean;
  starsOpacity: number;
}

/**
 * Pure deterministic environmental calculation.
 * No cumulative state, perfectly repeatable forward & backward.
 */
function getEnvironmentState(progress: number): EnvironmentState {
  const p = clamp(progress, 0, 1);

  // Keyframe Sky Palettes
  // Day (0.00 - 0.20): Crisp architectural azure daylight & luminous horizon
  const DAY_ZENITH: RGB = [142, 167, 194];   // #8EA7C2
  const DAY_HORIZON: RGB = [221, 231, 240];  // #DDE7F0
  const DAY_GROUND: RGB = [185, 192, 198];

  // Afternoon (0.32): Warm sunlit sky with softening horizon
  const AFT_ZENITH: RGB = [96, 126, 158];    // #607E9E
  const AFT_HORIZON: RGB = [232, 218, 194];  // #E8DAC2
  const AFT_GROUND: RGB = [172, 164, 154];

  // Golden Hour (0.50): Deep cyan zenith into rich amber horizon glow
  const GLD_ZENITH: RGB = [42, 68, 102];     // #2A4466
  const GLD_HORIZON: RGB = [236, 156, 90];   // #EC9C5A
  const GLD_GROUND: RGB = [135, 96, 72];

  // Dusk (0.68): Deep blue-hour twilight zenith with sunset ember horizon
  const DSK_ZENITH: RGB = [18, 25, 38];      // #121926
  const DSK_HORIZON: RGB = [78, 48, 52];     // #4E3034
  const DSK_GROUND: RGB = [38, 30, 36];

  // Night (0.86 - 1.00): Deep obsidian midnight with faint city ambient horizon
  const NIT_ZENITH: RGB = [7, 10, 15];       // #070A0F
  const NIT_HORIZON: RGB = [18, 23, 34];     // #121722
  const NIT_GROUND: RGB = [14, 16, 21];

  let currentZenith: RGB;
  let currentHorizon: RGB;
  let currentGround: RGB;

  if (p <= 0.30) {
    const t = p / 0.30;
    const s = t * t * (3 - 2 * t);
    currentZenith = lerpRGB(DAY_ZENITH, AFT_ZENITH, s);
    currentHorizon = lerpRGB(DAY_HORIZON, AFT_HORIZON, s);
    currentGround = lerpRGB(DAY_GROUND, AFT_GROUND, s);
  } else if (p <= 0.50) {
    const t = (p - 0.30) / 0.20;
    const s = t * t * (3 - 2 * t);
    currentZenith = lerpRGB(AFT_ZENITH, GLD_ZENITH, s);
    currentHorizon = lerpRGB(AFT_HORIZON, GLD_HORIZON, s);
    currentGround = lerpRGB(AFT_GROUND, GLD_GROUND, s);
  } else if (p <= 0.68) {
    const t = (p - 0.50) / 0.18;
    const s = t * t * (3 - 2 * t);
    currentZenith = lerpRGB(GLD_ZENITH, DSK_ZENITH, s);
    currentHorizon = lerpRGB(GLD_HORIZON, DSK_HORIZON, s);
    currentGround = lerpRGB(GLD_GROUND, DSK_GROUND, s);
  } else {
    const t = clamp((p - 0.68) / 0.20, 0, 1);
    const s = t * t * (3 - 2 * t);
    currentZenith = lerpRGB(DSK_ZENITH, NIT_ZENITH, s);
    currentHorizon = lerpRGB(DSK_HORIZON, NIT_HORIZON, s);
    currentGround = lerpRGB(DSK_GROUND, NIT_GROUND, s);
  }

  // Golden Hour directional sun rake intensity (smooth bell curve peaking at 0.50)
  let goldenRake = 0;
  if (p >= 0.22 && p <= 0.66) {
    if (p < 0.50) {
      const t = (p - 0.22) / 0.28;
      goldenRake = t * t * (3 - 2 * t);
    } else {
      const t = (0.66 - p) / 0.16;
      goldenRake = t * t * (3 - 2 * t);
    }
  }

  // Dusk/Night Shading (Atmospheric Multiply Tone Curve)
  // Gently begins around 0.44, ramps through dusk (0.65) to full night (0.85)
  let nightMultiply = 0;
  if (p > 0.42) {
    const t = clamp((p - 0.42) / 0.44, 0, 1);
    nightMultiply = t * t * (3 - 2 * t);
  }

  // Multiply target colors for atmospheric twilight
  const duskMultiplyTop: RGB = [18, 24, 38];
  const duskMultiplyBot: RGB = [28, 34, 46];

  // Architectural Lighting (Crown, Fins, Lobby):
  // 0% in day -> 10% hint at golden hour -> 60% at dusk -> 100% at night
  let architecturalLight = 0;
  if (p > 0.45) {
    const t = clamp((p - 0.45) / 0.40, 0, 1);
    architecturalLight = t * t * (3 - 2 * t);
  }

  // Window Lights turn active starting at dusk (0.58)
  const windowLightActive = p >= 0.58;

  // Stars in night sky (above crown)
  let starsOpacity = 0;
  if (p > 0.68) {
    const t = clamp((p - 0.68) / 0.18, 0, 1);
    starsOpacity = t * t * (3 - 2 * t);
  }

  const skyZenithStr = rgbStr(currentZenith);
  const skyHorizonStr = rgbStr(currentHorizon);
  const skyGroundStr = rgbStr(currentGround);

  return {
    skyZenith: skyZenithStr,
    skyHorizon: skyHorizonStr,
    skyGround: skyGroundStr,
    skyCssGradient: `linear-gradient(to bottom, ${skyZenithStr} 0%, ${skyHorizonStr} 65%, ${skyGroundStr} 100%)`,
    goldenRake,
    nightMultiply,
    duskMultiplyTop,
    duskMultiplyBot,
    architecturalLight,
    windowLightActive,
    starsOpacity,
  };
}

// Pre-computed residential windows across 12 floor tiers and 5 architectural window bays
// Each unit has a staggered turnOn progress between 0.61 and 0.86 for physical realism
interface WindowUnit {
  u: number;
  v: number;
  w: number;
  h: number;
  turnOn: number;
  color: RGB;
  maxAlpha: number;
  hasSpill: boolean;
}

const RESIDENTIAL_WINDOWS: WindowUnit[] = [
  // Penthouse & Upper Levels (Floors 12-10)
  { u: 0.194, v: 0.297, w: 0.138, h: 0.022, turnOn: 0.663, color: [255, 228, 185], maxAlpha: 0.68, hasSpill: true },
  { u: 0.375, v: 0.297, w: 0.083, h: 0.022, turnOn: 0.724, color: [255, 218, 160], maxAlpha: 0.75, hasSpill: false },
  { u: 0.472, v: 0.297, w: 0.083, h: 0.022, turnOn: 0.615, color: [250, 235, 210], maxAlpha: 0.72, hasSpill: false },
  { u: 0.569, v: 0.297, w: 0.097, h: 0.022, turnOn: 0.810, color: [255, 205, 145], maxAlpha: 0.64, hasSpill: true },
  { u: 0.708, v: 0.297, w: 0.111, h: 0.022, turnOn: 0.645, color: [255, 218, 160], maxAlpha: 0.78, hasSpill: true },

  { u: 0.194, v: 0.336, w: 0.138, h: 0.022, turnOn: 0.742, color: [255, 205, 145], maxAlpha: 0.66, hasSpill: true },
  { u: 0.375, v: 0.336, w: 0.083, h: 0.022, turnOn: 0.680, color: [255, 228, 185], maxAlpha: 0.80, hasSpill: false },
  { u: 0.472, v: 0.336, w: 0.083, h: 0.022, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: false }, // Dark/unoccupied
  { u: 0.569, v: 0.336, w: 0.097, h: 0.022, turnOn: 0.630, color: [250, 235, 210], maxAlpha: 0.74, hasSpill: true },
  { u: 0.708, v: 0.336, w: 0.111, h: 0.022, turnOn: 0.768, color: [255, 228, 185], maxAlpha: 0.70, hasSpill: true },

  { u: 0.194, v: 0.375, w: 0.138, h: 0.022, turnOn: 0.620, color: [255, 218, 160], maxAlpha: 0.72, hasSpill: true },
  { u: 0.375, v: 0.375, w: 0.083, h: 0.022, turnOn: 0.825, color: [255, 205, 145], maxAlpha: 0.65, hasSpill: false },
  { u: 0.472, v: 0.375, w: 0.083, h: 0.022, turnOn: 0.705, color: [255, 228, 185], maxAlpha: 0.76, hasSpill: false },
  { u: 0.569, v: 0.375, w: 0.097, h: 0.022, turnOn: 0.672, color: [255, 218, 160], maxAlpha: 0.70, hasSpill: true },
  { u: 0.708, v: 0.375, w: 0.111, h: 0.022, turnOn: 0.840, color: [250, 235, 210], maxAlpha: 0.62, hasSpill: true },

  // Mid-Rise Suites (Floors 9-6)
  { u: 0.194, v: 0.414, w: 0.138, h: 0.022, turnOn: 0.785, color: [255, 228, 185], maxAlpha: 0.75, hasSpill: true },
  { u: 0.375, v: 0.414, w: 0.083, h: 0.022, turnOn: 0.638, color: [255, 218, 160], maxAlpha: 0.82, hasSpill: false },
  { u: 0.472, v: 0.414, w: 0.083, h: 0.022, turnOn: 0.750, color: [255, 205, 145], maxAlpha: 0.68, hasSpill: false },
  { u: 0.569, v: 0.414, w: 0.097, h: 0.022, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: true },  // Dark
  { u: 0.708, v: 0.414, w: 0.111, h: 0.022, turnOn: 0.660, color: [250, 235, 210], maxAlpha: 0.74, hasSpill: true },

  { u: 0.194, v: 0.453, w: 0.138, h: 0.022, turnOn: 0.612, color: [255, 218, 160], maxAlpha: 0.78, hasSpill: true },
  { u: 0.375, v: 0.453, w: 0.083, h: 0.022, turnOn: 0.730, color: [255, 228, 185], maxAlpha: 0.70, hasSpill: false },
  { u: 0.472, v: 0.453, w: 0.083, h: 0.022, turnOn: 0.690, color: [255, 218, 160], maxAlpha: 0.80, hasSpill: false },
  { u: 0.569, v: 0.453, w: 0.097, h: 0.022, turnOn: 0.835, color: [255, 205, 145], maxAlpha: 0.64, hasSpill: true },
  { u: 0.708, v: 0.453, w: 0.111, h: 0.022, turnOn: 0.718, color: [255, 228, 185], maxAlpha: 0.72, hasSpill: true },

  { u: 0.194, v: 0.492, w: 0.138, h: 0.023, turnOn: 0.655, color: [250, 235, 210], maxAlpha: 0.76, hasSpill: true },
  { u: 0.375, v: 0.492, w: 0.083, h: 0.023, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: false }, // Dark
  { u: 0.472, v: 0.492, w: 0.083, h: 0.023, turnOn: 0.628, color: [255, 205, 145], maxAlpha: 0.74, hasSpill: false },
  { u: 0.569, v: 0.492, w: 0.097, h: 0.023, turnOn: 0.760, color: [255, 228, 185], maxAlpha: 0.70, hasSpill: true },
  { u: 0.708, v: 0.492, w: 0.111, h: 0.023, turnOn: 0.795, color: [255, 218, 160], maxAlpha: 0.82, hasSpill: true },

  { u: 0.194, v: 0.539, w: 0.138, h: 0.023, turnOn: 0.710, color: [255, 218, 160], maxAlpha: 0.80, hasSpill: true },
  { u: 0.375, v: 0.539, w: 0.083, h: 0.023, turnOn: 0.640, color: [255, 228, 185], maxAlpha: 0.72, hasSpill: false },
  { u: 0.472, v: 0.539, w: 0.083, h: 0.023, turnOn: 0.852, color: [255, 205, 145], maxAlpha: 0.65, hasSpill: false },
  { u: 0.569, v: 0.539, w: 0.097, h: 0.023, turnOn: 0.675, color: [250, 235, 210], maxAlpha: 0.76, hasSpill: true },
  { u: 0.708, v: 0.539, w: 0.111, h: 0.023, turnOn: 0.740, color: [255, 218, 160], maxAlpha: 0.78, hasSpill: true },

  // Lower Suites & Podium (Floors 5-1)
  { u: 0.194, v: 0.586, w: 0.138, h: 0.024, turnOn: 0.622, color: [255, 228, 185], maxAlpha: 0.75, hasSpill: true },
  { u: 0.375, v: 0.586, w: 0.083, h: 0.024, turnOn: 0.772, color: [255, 218, 160], maxAlpha: 0.68, hasSpill: false },
  { u: 0.472, v: 0.586, w: 0.083, h: 0.024, turnOn: 0.685, color: [250, 235, 210], maxAlpha: 0.84, hasSpill: false },
  { u: 0.569, v: 0.586, w: 0.097, h: 0.024, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: true },  // Dark
  { u: 0.708, v: 0.586, w: 0.111, h: 0.024, turnOn: 0.635, color: [255, 205, 145], maxAlpha: 0.72, hasSpill: true },

  { u: 0.194, v: 0.648, w: 0.138, h: 0.024, turnOn: 0.815, color: [255, 218, 160], maxAlpha: 0.70, hasSpill: true },
  { u: 0.375, v: 0.648, w: 0.083, h: 0.024, turnOn: 0.650, color: [255, 228, 185], maxAlpha: 0.80, hasSpill: false },
  { u: 0.472, v: 0.648, w: 0.083, h: 0.024, turnOn: 0.735, color: [255, 218, 160], maxAlpha: 0.76, hasSpill: false },
  { u: 0.569, v: 0.648, w: 0.097, h: 0.024, turnOn: 0.618, color: [255, 205, 145], maxAlpha: 0.82, hasSpill: true },
  { u: 0.708, v: 0.648, w: 0.111, h: 0.024, turnOn: 0.845, color: [250, 235, 210], maxAlpha: 0.66, hasSpill: true },

  { u: 0.194, v: 0.710, w: 0.138, h: 0.024, turnOn: 0.695, color: [255, 228, 185], maxAlpha: 0.74, hasSpill: true },
  { u: 0.375, v: 0.710, w: 0.083, h: 0.024, turnOn: 0.780, color: [255, 218, 160], maxAlpha: 0.78, hasSpill: false },
  { u: 0.472, v: 0.710, w: 0.083, h: 0.024, turnOn: 0.642, color: [255, 205, 145], maxAlpha: 0.72, hasSpill: false },
  { u: 0.569, v: 0.710, w: 0.097, h: 0.024, turnOn: 0.725, color: [250, 235, 210], maxAlpha: 0.80, hasSpill: true },
  { u: 0.708, v: 0.710, w: 0.111, h: 0.024, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: true },  // Dark

  { u: 0.194, v: 0.773, w: 0.138, h: 0.024, turnOn: 0.632, color: [255, 218, 160], maxAlpha: 0.76, hasSpill: true },
  { u: 0.375, v: 0.773, w: 0.083, h: 0.024, turnOn: 0.830, color: [255, 205, 145], maxAlpha: 0.68, hasSpill: false },
  { u: 0.472, v: 0.773, w: 0.083, h: 0.024, turnOn: 0.715, color: [255, 228, 185], maxAlpha: 0.75, hasSpill: false },
  { u: 0.569, v: 0.773, w: 0.097, h: 0.024, turnOn: 0.668, color: [255, 218, 160], maxAlpha: 0.82, hasSpill: true },
  { u: 0.708, v: 0.773, w: 0.111, h: 0.024, turnOn: 0.762, color: [250, 235, 210], maxAlpha: 0.70, hasSpill: true },

  { u: 0.194, v: 0.835, w: 0.138, h: 0.024, turnOn: 0.702, color: [255, 228, 185], maxAlpha: 0.78, hasSpill: true },
  { u: 0.375, v: 0.835, w: 0.083, h: 0.024, turnOn: 0.625, color: [255, 218, 160], maxAlpha: 0.74, hasSpill: false },
  { u: 0.472, v: 0.835, w: 0.083, h: 0.024, turnOn: 99.00, color: [255, 218, 160], maxAlpha: 0.00, hasSpill: false }, // Dark
  { u: 0.569, v: 0.835, w: 0.097, h: 0.024, turnOn: 0.788, color: [255, 205, 145], maxAlpha: 0.72, hasSpill: true },
  { u: 0.708, v: 0.835, w: 0.111, h: 0.024, turnOn: 0.658, color: [250, 235, 210], maxAlpha: 0.80, hasSpill: true },
];

// Fixed deterministic night stars
const NIGHT_STARS = [
  { x: 0.08, y: 0.06, size: 0.9, alpha: 0.7 },
  { x: 0.14, y: 0.12, size: 1.2, alpha: 0.8 },
  { x: 0.19, y: 0.04, size: 0.8, alpha: 0.6 },
  { x: 0.24, y: 0.16, size: 1.4, alpha: 0.9 },
  { x: 0.29, y: 0.08, size: 1.0, alpha: 0.7 },
  { x: 0.33, y: 0.03, size: 0.7, alpha: 0.5 },
  { x: 0.68, y: 0.05, size: 1.1, alpha: 0.8 },
  { x: 0.72, y: 0.14, size: 0.9, alpha: 0.7 },
  { x: 0.78, y: 0.08, size: 1.3, alpha: 0.9 },
  { x: 0.83, y: 0.18, size: 0.8, alpha: 0.6 },
  { x: 0.87, y: 0.04, size: 1.2, alpha: 0.8 },
  { x: 0.92, y: 0.11, size: 1.0, alpha: 0.7 },
  { x: 0.95, y: 0.07, size: 0.9, alpha: 0.6 },
  { x: 0.42, y: 0.04, size: 0.8, alpha: 0.6 },
  { x: 0.58, y: 0.03, size: 0.8, alpha: 0.5 },
];

export const HeroConstruction: React.FC<HeroConstructionProps> = ({ onOpenEnquiry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const timelineBarRef = useRef<HTMLDivElement>(null);

  // Preloaded image elements in memory
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedFlagsRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));

  // High-precision scroll & animation tracking (Mutable refs outside React render cycle)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnProgressRef = useRef(-1);
  const isReducedMotionRef = useRef(false);

  // Cached scroll dimensions (Eliminates repeated getBoundingClientRect / layout thrashing)
  const scrollMetricsRef = useRef({
    containerTop: 0,
    totalScrollable: 1,
  });

  // Track active chapter index in ref to guard React state updates
  const activeChapterRef = useRef(0);

  // React state ONLY updates at deliberate story points when active chapter changes
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isFrame01Loaded, setIsFrame01Loaded] = useState(false);

  // Find nearest loaded and decoded frame if a specific frame is not ready
  const getNearestLoadedImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const loaded = loadedFlagsRef.current;

    if (loaded[targetIndex] && images[targetIndex]) {
      return images[targetIndex];
    }

    // Search backwards first (prior stage)
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (loaded[i] && images[i]) return images[i];
    }

    // Search forwards
    for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
      if (loaded[i] && images[i]) return images[i];
    }

    return null;
  }, []);

  // 60fps cinematic camera frame rendering with Day -> Golden Hour -> Night lighting pipeline
  // Uses floating-point subpixel coordinates to eliminate 1px integer rounding jitter
  const drawInterpolatedFrame = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      const clampedProgress = clamp(progress, 0, 1);
      const continuousFrame = clampedProgress * (TOTAL_FRAMES - 1);
      const baseIndex = clamp(Math.floor(continuousFrame), 0, TOTAL_FRAMES - 1);
      const nextIndex = Math.min(baseIndex + 1, TOTAL_FRAMES - 1);
      const blendFactor = continuousFrame - baseIndex;

      const baseImg = getNearestLoadedImage(baseIndex);
      if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;

      // Compute virtual camera parameters deterministically
      const isReduced = isReducedMotionRef.current;
      const camera = isReduced
        ? { scale: 1.0, panX: 0, panY: 0 }
        : getCameraState(clampedProgress);

      // Compute environmental lighting state from progress
      const env = getEnvironmentState(clampedProgress);

      // Directly update DOM backdrop and vignette with zero React state overhead
      if (backdropRef.current) {
        backdropRef.current.style.background = env.skyCssGradient;
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String(lerp(0.18, 0.48, env.nightMultiply));
      }

      // Natural contain-scaling preserving exact building proportions
      const imgW = baseImg.naturalWidth;
      const imgH = baseImg.naturalHeight;
      const fitScale = Math.min(cw / imgW, ch / imgH);
      const effectiveScale = fitScale * camera.scale;

      // Sub-pixel floating point positioning (prevents 1px integer rounding stutter)
      const centerX = cw / 2 + cw * camera.panX;
      const centerY = ch / 2 + ch * camera.panY;

      // =========================================================================
      // PASS 1: CONTINUOUS SKY BACKDROP ACROSS ENTIRE CANVAS
      // Seamlessly fills entire canvas from zenith to horizon to ground
      // =========================================================================
      ctx.globalCompositeOperation = 'source-over';
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
      skyGrad.addColorStop(0, env.skyZenith);
      skyGrad.addColorStop(0.65, env.skyHorizon);
      skyGrad.addColorStop(1, env.skyGround);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, ch);

      // =========================================================================
      // PASS 2: SUBTLE NIGHT STARS (In upper sky above crown at night)
      // =========================================================================
      if (env.starsOpacity > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < NIGHT_STARS.length; i++) {
          const star = NIGHT_STARS[i];
          const sx = cw * star.x;
          const sy = ch * star.y;
          if (sy > ch * 0.42) continue; // Keep stars in upper atmospheric sky
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * env.starsOpacity})`;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // =========================================================================
      // PASS 3: ARCHITECTURAL CAMERA FRAME TRANSFORM
      // =========================================================================
      ctx.save();
      ctx.translate(centerX, centerY);

      // CRITICAL: Floating-point dimensions render smoothly without integer snapping
      const dw = imgW * effectiveScale;
      const dh = imgH * effectiveScale;
      const dx = -dw / 2;
      const dy = -dh / 2;

      const nextImg = baseIndex !== nextIndex ? getNearestLoadedImage(nextIndex) : null;

      // Draw base architectural frame
      if (!nextImg || blendFactor < 0.06) {
        ctx.globalAlpha = 1.0;
        ctx.drawImage(baseImg, dx, dy, dw, dh);
      } else if (blendFactor > 0.94) {
        ctx.globalAlpha = 1.0;
        ctx.drawImage(nextImg, dx, dy, dw, dh);
      } else {
        const t = (blendFactor - 0.06) / 0.88;
        const smoothT = t * t * (3 - 2 * t);

        ctx.globalAlpha = 1.0;
        ctx.drawImage(baseImg, dx, dy, dw, dh);

        ctx.globalAlpha = smoothT;
        ctx.drawImage(nextImg, dx, dy, dw, dh);
      }
      ctx.globalAlpha = 1.0;

      // =========================================================================
      // PASS 4: GOLDEN HOUR WARM SUNLIGHT RAKE
      // Directional natural sunlight grazing west-facing balconies & louvers
      // =========================================================================
      if (env.goldenRake > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';

        const sunGrad = ctx.createLinearGradient(
          dx + dw * 0.95, dy + dh * 0.12,
          dx + dw * 0.05, dy + dh * 0.88
        );
        sunGrad.addColorStop(0, `rgba(255, 175, 75, ${env.goldenRake * 0.52})`);
        sunGrad.addColorStop(0.45, `rgba(255, 210, 130, ${env.goldenRake * 0.26})`);
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(dx, dy, dw, dh);

        // Subtle specular highlight on the west architectural edge
        const rimGrad = ctx.createLinearGradient(dx + dw * 0.80, 0, dx + dw, 0);
        rimGrad.addColorStop(0, 'rgba(255, 220, 150, 0)');
        rimGrad.addColorStop(1, `rgba(255, 220, 150, ${env.goldenRake * 0.32})`);
        ctx.fillStyle = rimGrad;
        ctx.fillRect(dx, dy, dw, dh);

        ctx.restore();
      }

      // =========================================================================
      // PASS 5: DUSK & NIGHT ATMOSPHERIC MULTIPLY TONE CURVE
      // Transforms daylight image into deep luxury architectural twilight & night
      // Preserves concrete texture, balcony edges, and razor-sharp silhouette
      // =========================================================================
      if (env.nightMultiply > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';

        const duskGrad = ctx.createLinearGradient(0, dy, 0, dy + dh);
        const topR = Math.round(lerp(255, env.duskMultiplyTop[0], env.nightMultiply));
        const topG = Math.round(lerp(255, env.duskMultiplyTop[1], env.nightMultiply));
        const topB = Math.round(lerp(255, env.duskMultiplyTop[2], env.nightMultiply));

        const botR = Math.round(lerp(255, env.duskMultiplyBot[0], env.nightMultiply));
        const botG = Math.round(lerp(255, env.duskMultiplyBot[1], env.nightMultiply));
        const botB = Math.round(lerp(255, env.duskMultiplyBot[2], env.nightMultiply));

        duskGrad.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
        duskGrad.addColorStop(0.65, `rgb(${topR + 8}, ${topG + 8}, ${topB + 6})`);
        duskGrad.addColorStop(1, `rgb(${botR}, ${botG}, ${botB})`);
        ctx.fillStyle = duskGrad;
        ctx.fillRect(dx, dy, dw, dh);

        ctx.restore();
      }

      // =========================================================================
      // PASS 6: ARCHITECTURAL LIGHTING & RESIDENTIAL APARTMENT WINDOWS
      // Staggered interior window illumination + crown, fins, lobby lights
      // =========================================================================
      if (env.architecturalLight > 0.01 || env.windowLightActive) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // 1. Crown Uplighting: Champagne gold grazing upward on the tower crown parapet
        if (env.architecturalLight > 0.01) {
          const crownGrad = ctx.createLinearGradient(0, dy + dh * 0.16, 0, dy + dh * 0.07);
          crownGrad.addColorStop(0, `rgba(255, 230, 180, ${env.architecturalLight * 0.45})`);
          crownGrad.addColorStop(0.65, `rgba(240, 205, 145, ${env.architecturalLight * 0.20})`);
          crownGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = crownGrad;
          ctx.fillRect(dx + dw * 0.36, dy + dh * 0.07, dw * 0.28, dh * 0.09);

          // 2. Vertical Architectural Fin Grazers (Subtle structural ribs)
          const finXs = [0.26, 0.36, 0.50, 0.64, 0.72];
          for (let f = 0; f < finXs.length; f++) {
            const fx = dx + dw * finXs[f];
            const finGrad = ctx.createLinearGradient(0, dy + dh * 0.85, 0, dy + dh * 0.25);
            finGrad.addColorStop(0, `rgba(255, 225, 170, ${env.architecturalLight * 0.30})`);
            finGrad.addColorStop(0.5, `rgba(255, 215, 150, ${env.architecturalLight * 0.18})`);
            finGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = finGrad;
            ctx.fillRect(fx - dw * 0.004, dy + dh * 0.25, dw * 0.008, dh * 0.60);
          }

          // 3. Grand Entrance Lobby & Canopy Warm Illumination
          const lobbyGrad = ctx.createRadialGradient(
            dx + dw * 0.50, dy + dh * 0.87, dw * 0.02,
            dx + dw * 0.50, dy + dh * 0.87, dw * 0.28
          );
          lobbyGrad.addColorStop(0, `rgba(255, 235, 195, ${env.architecturalLight * 0.50})`);
          lobbyGrad.addColorStop(0.5, `rgba(220, 185, 130, ${env.architecturalLight * 0.25})`);
          lobbyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = lobbyGrad;
          ctx.fillRect(dx + dw * 0.24, dy + dh * 0.82, dw * 0.52, dh * 0.12);

          // 4. Crown Aviation Obstruction Beacon
          const beaconAlpha = env.architecturalLight * (0.45 + 0.45 * Math.sin(Date.now() * 0.004));
          ctx.fillStyle = `rgba(245, 55, 55, ${beaconAlpha})`;
          ctx.beginPath();
          ctx.arc(dx + dw * 0.50, dy + dh * 0.071, Math.max(2, dw * 0.0035), 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Staggered Interior Residential Windows (Natural, physical lamp warmup)
        if (env.windowLightActive) {
          for (let i = 0; i < RESIDENTIAL_WINDOWS.length; i++) {
            const win = RESIDENTIAL_WINDOWS[i];
            if (clampedProgress < win.turnOn) continue;

            // Physical lamp warmup (0.025 progress delta ramp)
            const t = clamp((clampedProgress - win.turnOn) / 0.025, 0, 1);
            const ramp = t * t * (3 - 2 * t);
            const alpha = win.maxAlpha * ramp;
            if (alpha < 0.01) continue;

            const wx = dx + win.u * dw;
            const wy = dy + win.v * dh;
            const ww = win.w * dw;
            const wh = win.h * dh;

            // Warm interior room wash
            ctx.fillStyle = `rgba(${win.color[0]}, ${win.color[1]}, ${win.color[2]}, ${alpha * 0.85})`;
            ctx.fillRect(wx, wy, ww, wh);

            // Slightly brighter luminous interior center
            ctx.fillStyle = `rgba(255, 248, 230, ${alpha * 0.50})`;
            ctx.fillRect(wx + ww * 0.2, wy + wh * 0.2, ww * 0.6, wh * 0.6);

            // Architectural window mullion shadow (divider line)
            ctx.fillStyle = 'rgba(10, 14, 20, 0.45)';
            ctx.fillRect(wx + ww * 0.48, wy, ww * 0.04, wh);

            // Subtle balcony floor light spill
            if (win.hasSpill) {
              const spillGrad = ctx.createLinearGradient(wx, wy + wh, wx, wy + wh * 1.5);
              spillGrad.addColorStop(0, `rgba(${win.color[0]}, ${win.color[1]}, ${win.color[2]}, ${alpha * 0.25})`);
              spillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = spillGrad;
              ctx.fillRect(wx - ww * 0.08, wy + wh, ww * 1.16, wh * 0.5);
            }
          }
        }

        ctx.restore();
      }

      ctx.restore();
      lastDrawnProgressRef.current = progress;
    },
    [getNearestLoadedImage]
  );

  // Sync canvas resolution with display device pixel ratio, capped for 60fps performance
  const syncCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const isMobile = window.innerWidth < 768;
    const maxDpr = isMobile ? 1.5 : 1.75;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    let targetW = Math.round(rect.width * dpr);
    let targetH = Math.round(rect.height * dpr);

    // Bound maximum buffer size to avoid redundant memory allocations
    if (targetW > 1920) {
      targetH = Math.round(targetH * (1920 / targetW));
      targetW = 1920;
    }
    if (targetH > 1280) {
      targetW = Math.round(targetW * (1280 / targetH));
      targetH = 1280;
    }

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = isMobile ? 'medium' : 'high';
      }

      if (lastDrawnProgressRef.current >= 0) {
        drawInterpolatedFrame(lastDrawnProgressRef.current);
      }
    }
  }, [drawInterpolatedFrame]);

  // Priority-based async image preloading & hardware decoding pipeline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    let isMounted = true;

    // Asynchronously load and decode image off main thread
    const loadAndDecode = async (index: number): Promise<HTMLImageElement | null> => {
      try {
        const img = new Image();
        img.src = FRAME_PATHS[index];
        if (typeof img.decode === 'function') {
          await img.decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
          });
        }
        if (!isMounted) return null;
        imagesRef.current[index] = img;
        loadedFlagsRef.current[index] = true;
        return img;
      } catch {
        return null;
      }
    };

    const runPreload = async () => {
      // Stage 1: Load & decode initial frame 01 immediately for zero-delay presentation
      const f1 = await loadAndDecode(0);
      if (!isMounted) return;

      if (f1) {
        setIsFrame01Loaded(true);
        syncCanvasDimensions();
        drawInterpolatedFrame(0);
      }

      // Stage 2: Immediately decode early sequence frames (02 to 06) so initial scroll is buttery smooth
      for (let i = 1; i < Math.min(6, TOTAL_FRAMES); i++) {
        if (!isMounted) return;
        await loadAndDecode(i);
        const curProgress = currentProgressRef.current;
        if (Math.abs(curProgress * (TOTAL_FRAMES - 1) - i) < 1.0) {
          drawInterpolatedFrame(curProgress);
        }
      }

      // Stage 3: Progressively preload and decode all remaining frames in parallel batches of 3
      const remaining: number[] = [];
      for (let i = 6; i < TOTAL_FRAMES; i++) {
        remaining.push(i);
      }

      const batchSize = 3;
      for (let i = 0; i < remaining.length; i += batchSize) {
        if (!isMounted) return;
        const chunk = remaining.slice(i, i + batchSize);
        await Promise.all(chunk.map((idx) => loadAndDecode(idx)));

        const curProgress = currentProgressRef.current;
        const activeIdx = Math.round(curProgress * (TOTAL_FRAMES - 1));
        if (chunk.includes(activeIdx)) {
          drawInterpolatedFrame(curProgress);
        }
      }
    };

    runPreload();

    return () => {
      isMounted = false;
    };
  }, [syncCanvasDimensions, drawInterpolatedFrame]);

  // Single dedicated requestAnimationFrame animation loop
  // Smoothly interpolates currentProgress -> targetProgress
  // Direct DOM updates for continuous elements, React state ONLY for discrete chapter transitions
  useEffect(() => {
    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      if (isReducedMotionRef.current) {
        drawInterpolatedFrame(1);
        return;
      }

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      const delta = target - current;
      let nextProgress: number;

      if (Math.abs(delta) < 0.00015) {
        nextProgress = target;
      } else {
        // Responsive smoothing factor (0.20): follows wheel/touch with zero delay and zero jagged steps
        nextProgress = current + delta * 0.20;
      }

      currentProgressRef.current = nextProgress;

      // 1. Render architectural canvas when progress moves
      if (Math.abs(nextProgress - lastDrawnProgressRef.current) > 0.0001) {
        drawInterpolatedFrame(nextProgress);
      }

      // 2. Update timeline progress bar directly via DOM transform (0 React re-renders)
      if (timelineBarRef.current) {
        timelineBarRef.current.style.transform = `scaleY(${nextProgress})`;
      }

      // 3. Deliberate story points: update active chapter ONLY when boundary is crossed
      let activeIdx = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        const [start, end] = CHAPTERS[i].range;
        if (nextProgress >= start && nextProgress < end) {
          activeIdx = i;
          break;
        }
      }
      if (nextProgress >= 0.88) {
        activeIdx = CHAPTERS.length - 1;
      }

      if (activeIdx !== activeChapterRef.current) {
        activeChapterRef.current = activeIdx;
        setActiveChapterIndex(activeIdx);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [drawInterpolatedFrame]);

  // Native scroll handler: ONLY calculates targetProgress from cached metrics
  // Zero layout thrashing, zero getBoundingClientRect in scroll event, zero React state calls
  useEffect(() => {
    const updateScrollMetrics = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const containerTop = rect.top + scrollTop;
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalScrollable = Math.max(containerHeight - windowHeight, 1);

      scrollMetricsRef.current = {
        containerTop,
        totalScrollable,
      };
    };

    updateScrollMetrics();

    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const { containerTop, totalScrollable } = scrollMetricsRef.current;
      const progress = clamp((scrollTop - containerTop) / totalScrollable, 0, 1);
      targetProgressRef.current = progress;
    };

    handleScroll();
    currentProgressRef.current = targetProgressRef.current;

    const handleResize = () => {
      updateScrollMetrics();
      syncCanvasDimensions();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [syncCanvasDimensions]);

  // Smooth click navigation to any chapter using cached metrics
  const scrollToChapter = useCallback((index: number) => {
    if (!containerRef.current) return;
    const targetChapter = CHAPTERS[index];
    const midpoint = (targetChapter.range[0] + targetChapter.range[1]) / 2;
    const { containerTop, totalScrollable } = scrollMetricsRef.current;
    const targetScroll = containerTop + midpoint * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  const getPositionClasses = (position: Chapter['position']) => {
    switch (position) {
      case 'bottom-left':
        return 'left-6 sm:left-12 md:left-16 lg:left-24 bottom-12 sm:bottom-16 md:bottom-20 text-left items-start';
      case 'top-left':
        return 'left-6 sm:left-12 md:left-16 lg:left-24 top-28 sm:top-36 md:top-40 text-left items-start';
      case 'bottom-right':
        return 'right-6 sm:right-12 md:right-16 lg:right-24 bottom-12 sm:bottom-16 md:bottom-20 text-right items-end';
      case 'top-right':
        return 'right-6 sm:right-12 md:right-16 lg:right-24 top-28 sm:top-36 md:top-40 text-right items-end';
      default:
        return 'left-6 sm:left-12 md:left-16 lg:left-24 bottom-12 sm:bottom-16 md:bottom-20 text-left items-start';
    }
  };

  const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[450vh] bg-[#111315] select-none"
      aria-label="Ameer Heights Architectural Day to Night Experience"
    >
      {/* 100vh Sticky Viewport Window */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Layer 1: Continuous Atmospheric Backdrop (Directly updated from environmental engine) */}
        <div
          ref={backdropRef}
          className="absolute inset-0 z-0 transition-colors duration-200 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #8EA7C2 0%, #DDE7F0 65%, #B9C0C6 100%)',
          }}
        />

        {/* Precision Blueprint Architectural Coordinates Grid (Subtle luxury texture) */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#B59A6A15_1px,transparent_1px),linear-gradient(to_bottom,#B59A6A15_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Layer 2: Pure Canvas Architectural Stage */}
        <div className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center z-10">
          {/* HTML5 Canvas: 60fps hardware accelerated virtual camera & environmental lighting */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none z-10"
            aria-label="Ameer Heights Tower 10 Day to Night Architectural Transformation"
          />

          {/* Fallback & Initial Loading State */}
          {!isFrame01Loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111315] z-30">
              <div className="w-8 h-8 rounded-full border border-[#B59A6A]/30 border-t-[#B59A6A] animate-spin" />
            </div>
          )}

          {/* Dynamic Architectural Vignette (Subtly deepens at night, direct GPU update) */}
          <div
            ref={vignetteRef}
            className="absolute inset-0 pointer-events-none z-15 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 48%, rgba(10, 13, 18, 0.95) 100%)',
              opacity: 0.20,
            }}
          />

          {/* Precision Architectural Geographic Coordinates */}
          <div
            className="absolute top-28 left-6 md:left-12 hidden sm:flex items-center gap-3 font-mono text-[9px] text-[#FAF9F6]/80 tracking-[0.25em] z-20 pointer-events-none"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            <div className="w-2.5 h-2.5 border-t border-l border-[#B59A6A]/80" />
            <span>30.2585° N, 71.5149° E</span>
          </div>

          {/* Live Cinematic Environmental Telemetry HUD */}
          <div
            className="absolute top-28 right-6 md:right-12 hidden sm:flex items-center gap-2.5 font-mono text-[9px] text-[#B59A6A] tracking-[0.25em] z-20 pointer-events-none transition-opacity duration-300"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A] animate-pulse" />
            <span className="text-[#FAF9F6]/90 font-medium">{currentChapter.navTitle}</span>
            <span className="text-[#B59A6A]/50">·</span>
            <span className="text-[#FAF9F6]/80">{currentChapter.timeLabel}</span>
            <span className="text-[#B59A6A]/50">·</span>
            <span className="text-[#FAF9F6]/60 hidden lg:inline">{currentChapter.focalLabel}</span>
          </div>

          {/* ========================================================= */}
          {/* EDITORIAL FLOATING TYPOGRAPHY                             */}
          {/* Stable overlay: Only transitions at deliberate story points*/}
          {/* Zero continuous recalculation or scale during scrolling   */}
          {/* ========================================================= */}
          {CHAPTERS.map((chapter, idx) => {
            const isActive = idx === activeChapterIndex;
            const isPast = idx < activeChapterIndex;
            const posClasses = getPositionClasses(chapter.position);

            return (
              <div
                key={chapter.id}
                className={`absolute ${posClasses} flex flex-col z-25 max-w-[88vw] sm:max-w-xl md:max-w-2xl select-none transition-all duration-300 ease-out will-change-[transform,opacity] ${
                  isActive
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  transform: isActive
                    ? 'translate3d(0, 0, 0)'
                    : isPast
                    ? 'translate3d(0, -12px, 0)'
                    : 'translate3d(0, 12px, 0)',
                }}
                aria-hidden={!isActive}
              >
                {/* Secondary Chapter Label */}
                <div
                  className={`flex items-center gap-2.5 mb-2 sm:mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A] ${
                    chapter.align === 'right' ? 'flex-row-reverse' : ''
                  }`}
                  style={{
                    textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                  <span>{chapter.label}</span>
                </div>

                {/* Primary Editorial Architectural Headline */}
                <h2
                  className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.06em] text-[#FAF9F6] leading-[1.06] uppercase"
                  style={{
                    textShadow: '0 2px 28px rgba(0,0,0,0.95), 0 1px 6px rgba(0,0,0,0.9)',
                  }}
                >
                  {chapter.primaryHeadline}
                  <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.05em] mt-0.5 sm:mt-1">
                    {chapter.secondaryHeadline}
                  </span>
                </h2>

                {/* Single Minimal Statement */}
                <p
                  className="font-mono text-[10px] sm:text-xs text-[#D8D3CA]/90 tracking-[0.22em] uppercase font-light mt-3 sm:mt-4 max-w-lg"
                  style={{
                    textShadow: '0 2px 18px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)',
                  }}
                >
                  {chapter.statement}
                </p>

                {/* Minimal Editorial Micro Action (Scene 01 / Scene 06) */}
                {chapter.cta?.type === 'scroll' && (
                  <div
                    className="mt-5 sm:mt-6 flex items-center gap-2.5 font-mono text-[9px] sm:text-[10px] text-[#FAF9F6]/80 tracking-[0.28em] uppercase"
                    style={{
                      textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                    }}
                  >
                    <span>{chapter.cta.label}</span>
                    <ArrowDown className="w-3 h-3 text-[#B59A6A] animate-bounce" />
                  </div>
                )}

                {chapter.cta?.type === 'enquire' && (
                  <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-4 pointer-events-auto">
                    <button
                      type="button"
                      onClick={onOpenEnquiry}
                      className="px-6 py-3 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] hover:text-[#111315] transition-colors duration-300 shadow-xl cursor-pointer"
                    >
                      {chapter.cta.label}
                    </button>
                    <a
                      href="#residences"
                      className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-[#F3F0E9] hover:text-[#B59A6A] transition-colors duration-300"
                      style={{
                        textShadow: '0 2px 14px rgba(0,0,0,0.95)',
                      }}
                    >
                      <span>Explore Residences</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B59A6A]" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {/* ========================================================= */}
          {/* EDITORIAL CHAPTER TRACKER (Unboxed Minimal Vertical Rail) */}
          {/* ========================================================= */}
          <nav
            className="hidden md:flex flex-col gap-3 absolute right-6 md:right-10 lg:right-12 top-1/2 -translate-y-1/2 z-30 pointer-events-auto select-none"
            aria-label="Story Chapters"
          >
            {CHAPTERS.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => scrollToChapter(idx)}
                  className="group flex items-center gap-3 text-right justify-end py-0.5 cursor-pointer"
                  title={`Jump to ${ch.num}: ${ch.navTitle}`}
                >
                  <span
                    className={`font-mono text-[9px] tracking-[0.25em] uppercase transition-all duration-300 hidden lg:inline ${
                      isActive ? 'text-[#FAF9F6] opacity-90' : 'text-[#8C8C87] opacity-0 group-hover:opacity-70'
                    }`}
                    style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                  >
                    {ch.navTitle}
                  </span>
                  <span
                    className={`h-[1px] transition-all duration-300 ${
                      isActive
                        ? 'w-6 bg-[#B59A6A]'
                        : 'w-2 bg-[#8C8C87]/40 group-hover:w-4 group-hover:bg-[#D8D3CA]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                      isActive ? 'text-[#B59A6A] font-semibold' : 'text-[#8C8C87]/50 group-hover:text-[#D8D3CA]'
                    }`}
                    style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                  >
                    {ch.num}
                  </span>
                </button>
              );
            })}

            {/* Thin vertical hairline timeline tracker (Direct GPU transform, 0 re-renders) */}
            <div className="w-[1px] h-12 bg-white/15 self-end mr-[5px] mt-1 relative overflow-hidden">
              <div
                ref={timelineBarRef}
                className="w-full bg-[#B59A6A] h-full origin-top"
                style={{ transform: 'scaleY(0)', willChange: 'transform' }}
              />
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
};



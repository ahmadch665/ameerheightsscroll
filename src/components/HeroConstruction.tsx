import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  label: string;
  primaryHeadline: string;
  secondaryHeadline: string;
  statement: string;
  range: [number, number]; // [start, end]
  position: 'bottom-left' | 'top-left' | 'bottom-right' | 'top-right';
  align: 'left' | 'right';
  cta?: {
    type: 'scroll' | 'explore' | 'enquire';
    label: string;
  };
}

const CHAPTERS: Chapter[] = [
  {
    id: 'vision',
    num: '01',
    navTitle: 'VISION',
    label: '01 / THE VISION',
    primaryHeadline: 'AMEER HEIGHTS',
    secondaryHeadline: 'TOWER 10',
    statement: 'LIVE ABOVE THE ORDINARY.',
    range: [0.00, 0.16],
    position: 'bottom-left',
    align: 'left',
    cta: {
      type: 'scroll',
      label: 'SCROLL TO EXPLORE',
    },
  },
  {
    id: 'architecture',
    num: '02',
    navTitle: 'ARCHITECTURE',
    label: '02 / THE ARCHITECTURE',
    primaryHeadline: 'ARRIVE SOMEWHERE',
    secondaryHeadline: 'EXCEPTIONAL.',
    statement: 'CONTEMPORARY MONOLITHIC FORM.',
    range: [0.16, 0.36],
    position: 'top-left',
    align: 'left',
  },
  {
    id: 'residences',
    num: '03',
    navTitle: 'RESIDENCES',
    label: '03 / THE RESIDENCES',
    primaryHeadline: 'DESIGNED WITH',
    secondaryHeadline: 'INTENTION.',
    statement: 'THIRTY PRIVATE TURNKEY SUITES.',
    range: [0.36, 0.56],
    position: 'bottom-right',
    align: 'right',
  },
  {
    id: 'lifestyle',
    num: '04',
    navTitle: 'LIFESTYLE',
    label: '04 / THE LIFESTYLE',
    primaryHeadline: 'MADE FOR',
    secondaryHeadline: 'EVERYDAY LIVING.',
    statement: 'AN EXCLUSIVE URBAN SANCTUARY.',
    range: [0.56, 0.76],
    position: 'bottom-left',
    align: 'left',
  },
  {
    id: 'details',
    num: '05',
    navTitle: 'DETAILS',
    label: '05 / THE DETAILS',
    primaryHeadline: 'ENDURING',
    secondaryHeadline: 'ELEGANCE.',
    statement: 'PRECISION ARCHITECTURAL FINISHES.',
    range: [0.76, 0.90],
    position: 'top-right',
    align: 'right',
  },
  {
    id: 'destination',
    num: '06',
    navTitle: 'DESTINATION',
    label: '06 / THE DESTINATION',
    primaryHeadline: 'AMEER HEIGHTS',
    secondaryHeadline: 'TOWER 10',
    statement: 'MAIN BZU CHOWK · BOSAN ROAD',
    range: [0.90, 1.00],
    position: 'bottom-left',
    align: 'left',
    cta: {
      type: 'enquire',
      label: 'ENQUIRE NOW',
    },
  },
];

interface CameraWaypoint {
  progress: number;
  scale: number;
  panX: number; // percentage offset of canvas width
  panY: number; // percentage offset of canvas height
  rotation: number; // degrees
  focalLabel: string;
  shotType: string;
}

const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  // 1. Extreme wide opening
  { progress: 0.00, scale: 0.83, panX: -0.016, panY: 0.024, rotation: -0.38, focalLabel: '24mm F/2.8', shotType: 'EXTREME WIDE ESTABLISHING' },
  // 2. Approaching tower & columns rising
  { progress: 0.16, scale: 1.00, panX: 0.000, panY: 0.000, rotation: 0.00, focalLabel: '35mm F/2.8', shotType: 'APPROACHING TOWER AXIS' },
  // 3. Monolithic concrete & slab ascension
  { progress: 0.36, scale: 1.18, panX: 0.034, panY: -0.026, rotation: 0.32, focalLabel: '50mm F/2.0', shotType: 'STRUCTURAL FORM REVEAL' },
  // 4. Balconies, timber louvers & suites detail
  { progress: 0.56, scale: 1.28, panX: -0.038, panY: -0.044, rotation: -0.28, focalLabel: '70mm F/1.8', shotType: 'BALCONY & RESIDENCE DETAIL' },
  // 5. Orbiting facade, canopy & street entrance
  { progress: 0.76, scale: 1.15, panX: 0.026, panY: 0.020, rotation: 0.22, focalLabel: '50mm F/2.0', shotType: 'FACADE & URBAN ENTRANCE' },
  // 6. Vertical ascent to crown
  { progress: 0.90, scale: 1.08, panX: 0.008, panY: -0.014, rotation: -0.10, focalLabel: '40mm F/2.8', shotType: 'VERTICAL CROWN ASCENT' },
  // 7. Settles into commanding hero shot
  { progress: 1.00, scale: 1.02, panX: 0.000, panY: 0.000, rotation: 0.00, focalLabel: '35mm F/2.8', shotType: 'GRAND HERO ARCHITECTURE' },
];

/**
 * Calculates continuous, mathematically smooth camera state across scroll progress.
 * Uses quintic smootherstep (C2 continuous) to eliminate any angular abruptness.
 */
function getCameraState(p: number): {
  scale: number;
  panX: number;
  panY: number;
  rotation: number;
  focalLabel: string;
  shotType: string;
} {
  const clamped = clamp(p, 0, 1);

  let i = 0;
  while (i < CAMERA_WAYPOINTS.length - 1 && clamped > CAMERA_WAYPOINTS[i + 1].progress) {
    i++;
  }

  const w0 = CAMERA_WAYPOINTS[i];
  const w1 = CAMERA_WAYPOINTS[Math.min(i + 1, CAMERA_WAYPOINTS.length - 1)];

  if (w0.progress === w1.progress) {
    return { ...w0 };
  }

  const linearT = clamp((clamped - w0.progress) / (w1.progress - w0.progress), 0, 1);
  // Quintic smootherstep: 6t^5 - 15t^4 + 10t^3
  const smoothT = linearT * linearT * linearT * (linearT * (linearT * 6 - 15) + 10);

  return {
    scale: lerp(w0.scale, w1.scale, smoothT),
    panX: lerp(w0.panX, w1.panX, smoothT),
    panY: lerp(w0.panY, w1.panY, smoothT),
    rotation: lerp(w0.rotation, w1.rotation, smoothT),
    focalLabel: linearT > 0.5 ? w1.focalLabel : w0.focalLabel,
    shotType: linearT > 0.5 ? w1.shotType : w0.shotType,
  };
}

export const HeroConstruction: React.FC<HeroConstructionProps> = ({ onOpenEnquiry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Preloaded image elements in memory
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedFlagsRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));

  // High-precision scroll & camera tracking
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnProgressRef = useRef(-1);
  const isReducedMotionRef = useRef(false);

  // UI state for synchronized text overlay transitions & HUD telemetry
  const [displayProgress, setDisplayProgress] = useState(0);
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

  // Ultra-smooth 60fps cinematic camera frame rendering on HTML5 canvas
  // Guarantees 100% sharp architectural details with zero double-vision or scale shearing
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
      const baseIndex = Math.floor(continuousFrame);
      const nextIndex = Math.min(baseIndex + 1, TOTAL_FRAMES - 1);
      const blendFactor = continuousFrame - baseIndex;

      const baseImg = getNearestLoadedImage(baseIndex);
      if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;

      // Compute virtual camera parameters
      const isReduced = isReducedMotionRef.current;
      const camera = isReduced
        ? { scale: 1.0, panX: 0, panY: 0, rotation: 0, focalLabel: '35mm F/2.8', shotType: 'STABILIZED' }
        : getCameraState(clampedProgress);

      // Natural contain-scaling preserving exact building proportions
      const imgW = baseImg.naturalWidth;
      const imgH = baseImg.naturalHeight;
      const fitScale = Math.min(cw / imgW, ch / imgH);
      const effectiveScale = fitScale * camera.scale;

      // Center point transformed by virtual camera pan
      const centerX = Math.round(cw / 2 + cw * camera.panX);
      const centerY = Math.round(ch / 2 + ch * camera.panY);

      // Unified architectural backdrop fill
      ctx.fillStyle = '#111315';
      ctx.fillRect(0, 0, cw, ch);

      // Apply camera transform matrix
      ctx.save();
      ctx.translate(centerX, centerY);
      if (camera.rotation !== 0) {
        ctx.rotate((camera.rotation * Math.PI) / 180);
      }

      // CRITICAL: Render images at identical geometry to guarantee razor-sharp edges
      const dw = Math.round(imgW * effectiveScale);
      const dh = Math.round(imgH * effectiveScale);
      const dx = Math.round(-dw / 2);
      const dy = Math.round(-dh / 2);

      const nextImg = baseIndex !== nextIndex ? getNearestLoadedImage(nextIndex) : null;

      if (!nextImg || blendFactor < 0.05) {
        // Pure single sharp frame
        ctx.globalAlpha = 1.0;
        ctx.drawImage(baseImg, dx, dy, dw, dh);
      } else if (blendFactor > 0.95) {
        // Pure next sharp frame
        ctx.globalAlpha = 1.0;
        ctx.drawImage(nextImg, dx, dy, dw, dh);
      } else {
        // Perfectly registered crossfade with smoothstep easing (zero scale disparity or blur)
        const t = (blendFactor - 0.05) / 0.90;
        const smoothT = t * t * (3 - 2 * t);

        ctx.globalAlpha = 1.0;
        ctx.drawImage(baseImg, dx, dy, dw, dh);

        ctx.globalAlpha = smoothT;
        ctx.drawImage(nextImg, dx, dy, dw, dh);
      }

      ctx.restore();
      ctx.globalAlpha = 1.0;
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
        // If user already scrolled to this section, render frame immediately
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

  // Silky 60fps requestAnimationFrame loop with responsive exponential smoothing
  useEffect(() => {
    let lastRenderedProgress = -1;
    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      if (isReducedMotionRef.current) {
        drawInterpolatedFrame(1);
        return;
      }

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Tight, responsive smoothing factor (0.12): eliminates micro-jank without delayed floatiness
      const delta = target - current;
      let nextProgress: number;

      if (Math.abs(delta) < 0.0001) {
        nextProgress = target;
      } else {
        nextProgress = current + delta * 0.12;
      }

      currentProgressRef.current = nextProgress;

      // Draw canvas at native 60fps when motion occurs
      if (Math.abs(nextProgress - lastDrawnProgressRef.current) > 0.0001) {
        drawInterpolatedFrame(nextProgress);
      }

      // Throttle React state updates to meaningful visual delta (0.002) to avoid unnecessary DOM reconciliation
      if (Math.abs(nextProgress - lastRenderedProgress) > 0.002) {
        lastRenderedProgress = nextProgress;
        setDisplayProgress(nextProgress);
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

  // Native scroll handler: recalculates normalized progress without hijacking scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const totalScrollable = containerHeight - windowHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = clamp(scrolled / totalScrollable, 0, 1);

      targetProgressRef.current = progress;
    };

    handleScroll();
    currentProgressRef.current = targetProgressRef.current;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncCanvasDimensions, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncCanvasDimensions);
    };
  }, [syncCanvasDimensions]);

  // Smooth click navigation to any chapter
  const scrollToChapter = useCallback((index: number) => {
    if (!containerRef.current) return;
    const targetChapter = CHAPTERS[index];
    const midpoint = (targetChapter.range[0] + targetChapter.range[1]) / 2;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = window.scrollY + containerRect.top;
    const containerHeight = containerRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const targetScroll = containerTop + midpoint * (containerHeight - windowHeight);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  // Determine active chapter index
  const activeChapterIndex = useMemo(() => {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const [start, end] = CHAPTERS[i].range;
      if (displayProgress >= start && displayProgress < end) {
        return i;
      }
    }
    return displayProgress >= 0.9 ? CHAPTERS.length - 1 : 0;
  }, [displayProgress]);

  // Active camera state for synchronized UI depth & parallax
  const currentCameraState = useMemo(() => {
    return getCameraState(displayProgress);
  }, [displayProgress]);

  // Compute smooth opacity, scale, and vertical translation for each chapter (zero CSS blur, lightweight)
  const getChapterStyle = useCallback(
    (index: number) => {
      const ch = CHAPTERS[index];
      const p = displayProgress;
      const [start, end] = ch.range;
      const isReduced = isReducedMotionRef.current;

      const fadeDelta = 0.035;

      let opacity = 0;
      let translateY = 12; // emerges softly from below
      let scale = 0.99;

      if (index === 0) {
        // Chapter 01: starts at full opacity, fades out near end
        const fadeOutStart = end - fadeDelta;
        if (p <= fadeOutStart) {
          opacity = 1;
          translateY = 0;
          scale = 1.0;
        } else if (p < end) {
          const t = (p - fadeOutStart) / fadeDelta;
          opacity = 1 - t;
          translateY = -t * 12; // moves slightly upward as it leaves
          scale = 1.0 + t * 0.01;
        } else {
          opacity = 0;
          translateY = -12;
          scale = 1.01;
        }
      } else if (index === CHAPTERS.length - 1) {
        // Chapter 06 (Destination): fades in near start, stays at full opacity until end
        const fadeInStart = start - 0.015;
        const fadeInEnd = start + fadeDelta;
        if (p < fadeInStart) {
          opacity = 0;
          translateY = 12;
          scale = 0.99;
        } else if (p < fadeInEnd) {
          const t = (p - fadeInStart) / (fadeInEnd - fadeInStart);
          opacity = t;
          translateY = (1 - t) * 12;
          scale = 0.99 + t * 0.01;
        } else {
          opacity = 1;
          translateY = 0;
          scale = 1.0;
        }
      } else {
        // Intermediate chapters: subtle entry, dwell, subtle exit
        const fadeInStart = start - 0.015;
        const fadeInEnd = start + fadeDelta;
        const fadeOutStart = end - fadeDelta;
        const fadeOutEnd = end + 0.015;

        if (p < fadeInStart) {
          opacity = 0;
          translateY = 12;
          scale = 0.99;
        } else if (p < fadeInEnd) {
          const t = (p - fadeInStart) / (fadeInEnd - fadeInStart);
          opacity = t;
          translateY = (1 - t) * 12;
          scale = 0.99 + t * 0.01;
        } else if (p <= fadeOutStart) {
          opacity = 1;
          translateY = 0;
          scale = 1.0;
        } else if (p < fadeOutEnd) {
          const t = (p - fadeOutStart) / (fadeOutEnd - fadeOutStart);
          opacity = 1 - t;
          translateY = -t * 12; // moves slightly upward as it leaves
          scale = 1.0 + t * 0.01;
        } else {
          opacity = 0;
          translateY = -12;
          scale = 1.01;
        }
      }

      if (isReduced) {
        translateY = 0;
        scale = 1.0;
      }

      return {
        opacity: clamp(opacity, 0, 1),
        translateY,
        scale,
        isVisible: opacity > 0.01,
        isInteractive: opacity > 0.6,
      };
    },
    [displayProgress]
  );

  const getPositionClasses = (position: Chapter['position'], align: Chapter['align']) => {
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

  const textParallaxX = currentCameraState.panX * 12;
  const textParallaxY = currentCameraState.panY * 12;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[420vh] bg-[#111315] select-none"
      aria-label="Ameer Heights Architectural Construction Timeline"
    >
      {/* 100vh Sticky Viewport Window */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Layer 1: Background Atmospheric Depth & Horizon Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111315] via-[#151719] to-[#1E2124] z-0" />

        {/* Blueprint Coordinate Matrix (Subtle background texture) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#B59A6A15_1px,transparent_1px),linear-gradient(to_bottom,#B59A6A15_1px,transparent_1px)] bg-[size:50px_50px]"
          style={{
            transform: `translate3d(${-currentCameraState.panX * 20}px, ${-currentCameraState.panY * 20}px, 0)`,
          }}
        />

        {/* Ambient radial atmospheric illumination (Zero blur filter for 60fps performance) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(181, 154, 106, 0.07) 0%, rgba(181, 154, 106, 0.02) 40%, transparent 70%)',
            transform: `translate3d(calc(-50% + ${-currentCameraState.panX * 30}px), calc(-50% + ${-currentCameraState.panY * 30}px), 0) scale(${
              1 + (currentCameraState.scale - 1) * 0.2
            })`,
          }}
        />

        {/* Layer 2: Pure Canvas Architectural Stage */}
        <div className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center z-10">
          {/* HTML5 Canvas: 60fps hardware accelerated virtual camera trajectory */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none z-10"
          />

          {/* Fallback Frame 01 (visible immediately on initial page load) */}
          {!isFrame01Loaded && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#111315]">
              <img
                src={FRAME_PATHS[0]}
                alt="Ameer Heights Tower 10 foundation ground"
                className="w-full h-full object-contain object-center opacity-90"
              />
            </div>
          )}

          {/* Layer 3: Foreground Cinematic Depth Layers (No expensive blend modes) */}
          {/* Subtle anamorphic light sheen that shifts gently with camera */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 opacity-25">
            <div
              className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#B59A6A]/30 to-transparent top-1/2 left-[-50%]"
              style={{
                transform: `rotate(${-14 + currentCameraState.rotation * 12}deg) translateY(${
                  currentCameraState.panY * 160
                }px)`,
              }}
            />
          </div>

          {/* Dynamic architectural vignette: subtle contrast adjustment behind the overall scene, never a visible container */}
          <div
            className="absolute inset-0 pointer-events-none z-15"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 45%, #111315 100%)',
              opacity: 0.35,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/60 via-transparent to-[#111315]/20 pointer-events-none z-15" />

          {/* Precision Architectural Crosshair Reticles (Unboxed) */}
          <div
            className="absolute top-28 left-6 md:left-12 hidden sm:flex items-center gap-3 font-mono text-[9px] text-[#8C8C87]/80 tracking-[0.25em] z-20 pointer-events-none"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            <div className="w-2.5 h-2.5 border-t border-l border-[#B59A6A]/50" />
            <span>30.2585° N, 71.5149° E</span>
          </div>

          {/* Live Cinematic Camera Telemetry HUD (Unboxed) */}
          <div
            className="absolute top-28 right-6 md:right-12 hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#B59A6A]/80 tracking-[0.25em] z-20 pointer-events-none"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A] animate-pulse" />
            <span className="text-[#8C8C87]">CAM:</span>
            <span>{currentCameraState.focalLabel}</span>
            <span className="text-[#8C8C87]/40">·</span>
            <span className="text-[#D8D3CA]/80 hidden md:inline">{currentCameraState.shotType}</span>
          </div>

          {/* ========================================================= */}
          {/* EDITORIAL FLOATING TYPOGRAPHY (Zero Containers / Cards)   */}
          {/* ========================================================= */}
          {CHAPTERS.map((chapter, idx) => {
            const { opacity, translateY, scale, isVisible, isInteractive } = getChapterStyle(idx);
            if (!isVisible) return null;

            const posClasses = getPositionClasses(chapter.position, chapter.align);

            return (
              <div
                key={chapter.id}
                className={`absolute ${posClasses} flex flex-col z-25 max-w-[88vw] sm:max-w-xl md:max-w-2xl select-none transition-all duration-75 ${
                  isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  opacity,
                  transform: `translate3d(${textParallaxX}px, ${translateY + textParallaxY}px, 0) scale(${scale})`,
                  willChange: isInteractive ? 'transform, opacity' : 'auto',
                }}
                aria-hidden={!isInteractive}
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
                  className="font-mono text-[10px] sm:text-xs text-[#D8D3CA]/90 tracking-[0.22em] uppercase font-light mt-3 sm:mt-4"
                  style={{
                    textShadow: '0 2px 18px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)',
                  }}
                >
                  {chapter.statement}
                </p>

                {/* Minimal Editorial Micro Action (Scene 01 / Scene 06) */}
                {chapter.cta?.type === 'scroll' && (
                  <div
                    className="mt-5 sm:mt-6 flex items-center gap-2.5 font-mono text-[9px] sm:text-[10px] text-[#8C8C87] tracking-[0.28em] uppercase"
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
                      className="px-5 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] hover:text-[#111315] transition-colors duration-300 shadow-xl cursor-pointer"
                    >
                      Enquire Now
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

            {/* Thin vertical hairline timeline tracker */}
            <div className="w-[1px] h-12 bg-white/15 self-end mr-[5px] mt-1 relative overflow-hidden">
              <div
                className="w-full bg-[#B59A6A] transition-all duration-100"
                style={{ height: `${displayProgress * 100}%` }}
              />
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
};


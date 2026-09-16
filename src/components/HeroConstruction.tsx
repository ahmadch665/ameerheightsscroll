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
    focalLabel: '24mm F/2.8',
    shotType: 'EXTREME WIDE ESTABLISHING',
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
    focalLabel: '35mm F/2.8',
    shotType: 'APPROACHING TOWER AXIS',
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
    focalLabel: '50mm F/2.0',
    shotType: 'STRUCTURAL FORM REVEAL',
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
    focalLabel: '70mm F/1.8',
    shotType: 'BALCONY & RESIDENCE DETAIL',
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
    focalLabel: '50mm F/2.0',
    shotType: 'PRECISION ARCHITECTURAL FINISH',
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
    focalLabel: '35mm F/2.8',
    shotType: 'GRAND HERO ARCHITECTURE',
    cta: {
      type: 'enquire',
      label: 'ENQUIRE NOW',
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

export const HeroConstruction: React.FC<HeroConstructionProps> = ({ onOpenEnquiry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // 60fps cinematic camera frame rendering on HTML5 canvas
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

      // Natural contain-scaling preserving exact building proportions
      const imgW = baseImg.naturalWidth;
      const imgH = baseImg.naturalHeight;
      const fitScale = Math.min(cw / imgW, ch / imgH);
      const effectiveScale = fitScale * camera.scale;

      // Sub-pixel floating point positioning (prevents 1px integer rounding stutter)
      const centerX = cw / 2 + cw * camera.panX;
      const centerY = ch / 2 + ch * camera.panY;

      // Unified architectural backdrop fill
      ctx.fillStyle = '#111315';
      ctx.fillRect(0, 0, cw, ch);

      // Apply camera transform matrix
      ctx.save();
      ctx.translate(centerX, centerY);

      // CRITICAL: Floating-point dimensions render smoothly without integer snapping
      const dw = imgW * effectiveScale;
      const dh = imgH * effectiveScale;
      const dx = -dw / 2;
      const dy = -dh / 2;

      const nextImg = baseIndex !== nextIndex ? getNearestLoadedImage(nextIndex) : null;

      if (!nextImg || blendFactor < 0.06) {
        // Pure single sharp frame
        ctx.globalAlpha = 1.0;
        ctx.drawImage(baseImg, dx, dy, dw, dh);
      } else if (blendFactor > 0.94) {
        // Pure next sharp frame
        ctx.globalAlpha = 1.0;
        ctx.drawImage(nextImg, dx, dy, dw, dh);
      } else {
        // Crossfade with smoothstep easing at identical geometric coordinates (zero blur, zero ghosting)
        const t = (blendFactor - 0.06) / 0.88;
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
      targetW = Math.round(targetH * (1280 / targetH));
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
      if (nextProgress >= 0.9) {
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
      className="relative w-full h-[420vh] bg-[#111315] select-none"
      aria-label="Ameer Heights Architectural Construction Timeline"
    >
      {/* 100vh Sticky Viewport Window */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Layer 1: Background Atmospheric Depth (Static, zero compositing churn) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111315] via-[#151719] to-[#1E2124] z-0" />

        {/* Blueprint Coordinate Matrix (Static architectural background) */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#B59A6A15_1px,transparent_1px),linear-gradient(to_bottom,#B59A6A15_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Ambient radial atmospheric illumination (Static background) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(181, 154, 106, 0.07) 0%, rgba(181, 154, 106, 0.02) 40%, transparent 70%)',
          }}
        />

        {/* Layer 2: Pure Canvas Architectural Stage */}
        <div className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center z-10">
          {/* HTML5 Canvas: 60fps hardware accelerated virtual camera trajectory */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none z-10"
            aria-label="Ameer Heights Tower 10 3D Construction Animation"
          />

          {/* Fallback & Initial Loading State */}
          {!isFrame01Loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111315] z-30">
              <div className="w-8 h-8 rounded-full border border-[#B59A6A]/30 border-t-[#B59A6A] animate-spin" />
            </div>
          )}

          {/* Layer 3: Foreground Cinematic Depth Layers (Static, no expensive blend modes) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 opacity-25">
            <div className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#B59A6A]/30 to-transparent top-1/2 left-[-50%] -rotate-12" />
          </div>

          {/* Dynamic architectural vignette: subtle contrast adjustment */}
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

          {/* Live Cinematic Camera Telemetry HUD (Updates cleanly on chapter transitions) */}
          <div
            className="absolute top-28 right-6 md:right-12 hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#B59A6A]/80 tracking-[0.25em] z-20 pointer-events-none transition-opacity duration-300"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A] animate-pulse" />
            <span className="text-[#8C8C87]">CAM:</span>
            <span>{currentChapter.focalLabel}</span>
            <span className="text-[#8C8C87]/40">·</span>
            <span className="text-[#D8D3CA]/80 hidden md:inline">{currentChapter.shotType}</span>
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

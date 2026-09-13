import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { projectData } from '../data/projectData';
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
  headline: string;
  headlineAccent: string;
  subline: string;
  body: string;
  range: [number, number]; // [start, end]
  badge: string;
  tags: string[];
  ctaType: 'scroll' | 'enquire' | 'explore' | 'none';
  ctaLabel?: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'vision',
    num: '01',
    navTitle: 'VISION',
    label: '01 — THE VISION',
    headline: 'A PRIVATE RESIDENCE',
    headlineAccent: 'IN MULTAN',
    subline: 'Live Above The Ordinary',
    body: '30 architect-crafted private residences at Main BZU Chowk, conceived as an exclusive sanctuary of understated elegance and quiet distinction.',
    range: [0.00, 0.16],
    badge: 'Main BZU Chowk · Bosan Road',
    tags: ['Private Sanctuary', '30 Residences', 'Boutique Scale'],
    ctaType: 'scroll',
    ctaLabel: 'Scroll To Construct Architecture',
  },
  {
    id: 'architecture',
    num: '02',
    navTitle: 'ARCHITECTURE',
    label: '02 — THE ARCHITECTURE',
    headline: 'MONOLITHIC CONTEMPORARY',
    headlineAccent: 'FACADE',
    subline: 'Modernist Form & Natural Warmth',
    body: 'A G+3 architectural landmark sculpted with graphite composite panels, warm vertical timber louvers, and tinted floor-to-ceiling thermal glazing.',
    range: [0.16, 0.36],
    badge: 'G+3 Boutique Scale · Monolithic Envelope',
    tags: ['Graphite Facade', 'Timber Louvers', 'Smoked Balustrades'],
    ctaType: 'none',
  },
  {
    id: 'residences',
    num: '03',
    navTitle: 'RESIDENCES',
    label: '03 — THE RESIDENCES',
    headline: 'STUDIO, 1 & 2 BEDROOM',
    headlineAccent: 'SUITES',
    subline: '100% Fully Furnished Interiors',
    body: 'Calibrated living spaces from 337 to 1,040 sq ft, each delivered turnkey with bespoke furniture, designer kitchenettes, and private balconies.',
    range: [0.36, 0.56],
    badge: '337 – 1,040 Sq Ft · Turnkey Finished',
    tags: ['13 Studio Suites', '16 One-Bedrooms', '1 Crown Penthouse'],
    ctaType: 'explore',
    ctaLabel: 'Explore 30 Floorplans',
  },
  {
    id: 'lifestyle',
    num: '04',
    navTitle: 'LIFESTYLE',
    label: '04 — THE LIFESTYLE',
    headline: 'UNCOMPROMISED URBAN',
    headlineAccent: 'TRANQUILITY',
    subline: 'Acoustic Privacy & Low-Density Living',
    body: 'An intimate boutique community of only 30 residences ensures quietude, low foot-traffic density, dedicated high-speed elevator access, and prime Bosan Road transit ease.',
    range: [0.56, 0.76],
    badge: 'Dedicated High-Speed Lift · Foyer',
    tags: ['Acoustic Privacy', 'Speed Lift', 'Bosan Road Axis'],
    ctaType: 'none',
  },
  {
    id: 'details',
    num: '05',
    navTitle: 'DETAILS',
    label: '05 — THE DETAILS',
    headline: 'VERIFIED ARCHITECTURAL',
    headlineAccent: 'CALIBRATION',
    subline: 'Enduring Craft at PKR 15,000 / Sq Ft',
    body: 'Bespoke joinery, acoustic perimeter walls, architectural illumination, and official registry documentation—delivering lasting investment value.',
    range: [0.76, 0.90],
    badge: 'PKR 15,000 / Sq Ft · Official Documentation',
    tags: ['PKR 15,000 / sq ft', 'Full Furnishing', 'Immediate Registry'],
    ctaType: 'none',
  },
  {
    id: 'destination',
    num: '06',
    navTitle: 'DESTINATION',
    label: '06 — THE DESTINATION',
    headline: 'DISCOVER AMEER HEIGHTS',
    headlineAccent: 'TOWER 10',
    subline: 'Architecture Completed · Available Now',
    body: 'Your private residence at Main BZU Chowk, Multan is ready. Reserve your private appointment or inspect available residences.',
    range: [0.90, 1.00],
    badge: 'Completed Landmark · Ready For Booking',
    tags: ['Main BZU Chowk', '30 Residences', 'Immediate Acquisition'],
    ctaType: 'enquire',
  },
];

export const HeroConstruction: React.FC<HeroConstructionProps> = ({ onOpenEnquiry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Preloaded image elements in memory
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedFlagsRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));

  // High-precision scroll & animation tracking
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnProgressRef = useRef(-1);
  const isReducedMotionRef = useRef(false);

  // UI state for synchronized text overlay transitions
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFrame01Loaded, setIsFrame01Loaded] = useState(false);

  // Find nearest loaded frame if a specific frame is not ready
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

  // Ultra-smooth cross-faded frame rendering on HTML5 canvas
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

      // Intelligent contain-scaling: preserve exact architectural proportions
      const imgW = baseImg.naturalWidth;
      const imgH = baseImg.naturalHeight;
      const scale = Math.min(cw / imgW, ch / imgH);

      const dw = Math.round(imgW * scale);
      const dh = Math.round(imgH * scale);
      const dx = Math.round((cw - dw) / 2);
      const dy = Math.round((ch - dh) / 2);

      // Architectural backdrop fill
      ctx.fillStyle = '#111315';
      ctx.fillRect(0, 0, cw, ch);

      // 1. Draw base frame
      ctx.globalAlpha = 1.0;
      ctx.drawImage(baseImg, dx, dy, dw, dh);

      // 2. Continuous sub-frame cross-fade dissolve for butter-smooth scrolling
      if (blendFactor > 0.008 && baseIndex !== nextIndex) {
        const nextImg = getNearestLoadedImage(nextIndex);
        if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
          ctx.globalAlpha = blendFactor;
          ctx.drawImage(nextImg, dx, dy, dw, dh);
        }
      }

      ctx.globalAlpha = 1.0;
      lastDrawnProgressRef.current = progress;
    },
    [getNearestLoadedImage]
  );

  // Sync canvas resolution with display device pixel ratio
  const syncCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      if (lastDrawnProgressRef.current >= 0) {
        drawInterpolatedFrame(lastDrawnProgressRef.current);
      }
    }
  }, [drawInterpolatedFrame]);

  // Preload all 30 frames: Frame 01 immediately, remaining 29 in background
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    let isMounted = true;

    // Load Frame 01 first
    const img1 = new Image();
    img1.src = FRAME_PATHS[0];
    img1.onload = () => {
      if (!isMounted) return;
      imagesRef.current[0] = img1;
      loadedFlagsRef.current[0] = true;
      setIsFrame01Loaded(true);

      syncCanvasDimensions();
      drawInterpolatedFrame(0);

      // Preload remaining frames
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = FRAME_PATHS[i];
        img.onload = () => {
          if (!isMounted) return;
          imagesRef.current[i] = img;
          loadedFlagsRef.current[i] = true;

          // If current scroll position requires this frame, re-draw
          const currentPos = currentProgressRef.current;
          const targetFrame = currentPos * (TOTAL_FRAMES - 1);
          if (Math.abs(targetFrame - i) < 1.0) {
            drawInterpolatedFrame(currentPos);
          }
        };
      }
    };

    return () => {
      isMounted = false;
    };
  }, [syncCanvasDimensions, drawInterpolatedFrame]);

  // Ultra-fluid requestAnimationFrame render loop with exponential smoothing
  useEffect(() => {
    let lastRenderedProgress = -1;

    const renderLoop = () => {
      if (isReducedMotionRef.current) {
        drawInterpolatedFrame(1);
        return;
      }

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Silky responsive smoothing factor: 0.14
      const smoothingFactor = 0.14;
      let nextProgress = lerp(current, target, smoothingFactor);

      // Snap when close to prevent perpetual micro-ticks
      if (Math.abs(target - nextProgress) < 0.0003) {
        nextProgress = target;
      }

      currentProgressRef.current = nextProgress;

      // Redraw canvas whenever progress updates perceptibly
      if (Math.abs(nextProgress - lastDrawnProgressRef.current) > 0.0003) {
        drawInterpolatedFrame(nextProgress);
      }

      // Update React state for smooth text transitions
      if (Math.abs(nextProgress - lastRenderedProgress) > 0.003) {
        lastRenderedProgress = nextProgress;
        setDisplayProgress(nextProgress);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
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

  // Compute smooth opacity and transform for each chapter
  const getChapterStyle = useCallback(
    (index: number) => {
      const ch = CHAPTERS[index];
      const p = displayProgress;
      const [start, end] = ch.range;
      const isReduced = isReducedMotionRef.current;

      const fadeDelta = 0.038;

      let opacity = 0;
      let translateY = 18; // default entering from below

      if (index === 0) {
        // Chapter 01: starts at full opacity, fades out near end
        const fadeOutStart = end - fadeDelta;
        if (p <= fadeOutStart) {
          opacity = 1;
          translateY = 0;
        } else if (p < end) {
          const t = (p - fadeOutStart) / fadeDelta;
          opacity = 1 - t;
          translateY = -t * 18; // moves upward as it leaves
        } else {
          opacity = 0;
          translateY = -18;
        }
      } else if (index === CHAPTERS.length - 1) {
        // Chapter 06 (Destination): fades in near start, stays at full opacity until end
        const fadeInStart = start - 0.02;
        const fadeInEnd = start + fadeDelta;
        if (p < fadeInStart) {
          opacity = 0;
          translateY = 18;
        } else if (p < fadeInEnd) {
          const t = (p - fadeInStart) / (fadeInEnd - fadeInStart);
          opacity = t;
          translateY = (1 - t) * 18;
        } else {
          opacity = 1;
          translateY = 0;
        }
      } else {
        // Intermediate chapters: smooth entry, dwell, smooth exit
        const fadeInStart = start - 0.02;
        const fadeInEnd = start + fadeDelta;
        const fadeOutStart = end - fadeDelta;
        const fadeOutEnd = end + 0.02;

        if (p < fadeInStart) {
          opacity = 0;
          translateY = 18;
        } else if (p < fadeInEnd) {
          const t = (p - fadeInStart) / (fadeInEnd - fadeInStart);
          opacity = t;
          translateY = (1 - t) * 18;
        } else if (p <= fadeOutStart) {
          opacity = 1;
          translateY = 0;
        } else if (p < fadeOutEnd) {
          const t = (p - fadeOutStart) / (fadeOutEnd - fadeOutStart);
          opacity = 1 - t;
          translateY = -t * 18;
        } else {
          opacity = 0;
          translateY = -18;
        }
      }

      if (isReduced) {
        translateY = 0;
      }

      return {
        opacity: clamp(opacity, 0, 1),
        translateY,
        isVisible: opacity > 0.01,
        isInteractive: opacity > 0.6,
      };
    },
    [displayProgress]
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#111315] select-none"
      aria-label="Ameer Heights Architectural Construction Timeline"
    >
      {/* 100vh Sticky Viewport Window */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Subtle architectural backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111315] via-[#151719] to-[#1E2124] z-0" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#B59A6A]/5 filter blur-[100px] pointer-events-none" />

        {/* Pure Canvas Stage */}
        <div className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center z-10">
          {/* HTML5 Canvas: 60/120fps hardware-accelerated cross-faded frames */}
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

          {/* Subtle architectural vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-[#111315]/60 pointer-events-none z-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111315]/40 via-transparent to-[#111315]/40 pointer-events-none z-15" />

          {/* Architectural Coordinate Badges (Top) */}
          <div className="absolute top-24 left-6 md:left-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span className="w-2 h-2 border border-[#B59A6A]" />
            <span>30.2585° N, 71.5149° E</span>
          </div>

          <div className="absolute top-24 right-6 md:right-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span>MULTAN · PUNJAB</span>
            <span className="w-2 h-2 border border-[#B59A6A]" />
          </div>

          {/* ========================================================= */}
          {/* STABLE CONTENT AREA: SYNCHRONIZED CHAPTERS (Left Anchor)  */}
          {/* ========================================================= */}
          <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 bottom-6 sm:bottom-10 md:bottom-12 lg:bottom-14 z-25 w-[calc(100%-2rem)] sm:w-[500px] md:w-[520px] lg:w-[560px] pointer-events-none">
            {/* Stable container prevents layout jumps between chapters */}
            <div className="relative w-full min-h-[360px] sm:min-h-[380px] md:min-h-[400px] bg-[#111315]/85 backdrop-blur-xl border border-[#B59A6A]/25 p-6 sm:p-8 md:p-9 shadow-2xl overflow-hidden pointer-events-auto">
              {/* Subtle architectural corner accents */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#B59A6A]" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#B59A6A]" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#B59A6A]" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#B59A6A]" />

              {/* Background ambient gold gradient */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#B59A6A]/10 rounded-full filter blur-2xl pointer-events-none" />

              {/* Render all 6 synchronized chapters in stacked absolute planes */}
              {CHAPTERS.map((chapter, idx) => {
                const { opacity, translateY, isVisible, isInteractive } = getChapterStyle(idx);
                if (!isVisible) return null;

                return (
                  <div
                    key={chapter.id}
                    className={`absolute inset-0 p-6 sm:p-8 md:p-9 flex flex-col justify-between transition-all duration-75 ${
                      isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                    style={{
                      opacity,
                      transform: `translateY(${translateY}px)`,
                    }}
                    aria-hidden={!isInteractive}
                  >
                    {/* Header: Small Label + Badge */}
                    <div>
                      <div
                        className="flex items-center justify-between gap-2 mb-3 sm:mb-4"
                        style={{
                          transform: `translateY(${translateY * 0.5}px)`,
                        }}
                      >
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#181B1D]/90 border border-[#B59A6A]/30 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-[#B59A6A] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                          <span>{chapter.label}</span>
                        </div>

                        <span className="font-mono text-[9px] sm:text-[10px] text-[#8C8C87] tracking-[0.2em] uppercase">
                          {idx + 1} / {CHAPTERS.length}
                        </span>
                      </div>

                      {/* Large Headline with Stagger */}
                      <h2
                        className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-[0.04em] text-[#FAF9F6] leading-[1.12] uppercase mb-1 sm:mb-2"
                        style={{
                          transform: `translateY(${translateY * 0.8}px)`,
                        }}
                      >
                        {chapter.headline} <br />
                        <span className="italic font-serif text-[#B59A6A]">{chapter.headlineAccent}</span>
                      </h2>

                      {/* Subline */}
                      <p
                        className="font-mono text-[10px] sm:text-xs text-[#8C8C87] uppercase tracking-[0.18em] mb-3 sm:mb-4"
                        style={{
                          transform: `translateY(${translateY * 1.0}px)`,
                        }}
                      >
                        {chapter.subline}
                      </p>

                      {/* 1–2 Short Sentences */}
                      <p
                        className="text-xs sm:text-sm md:text-base text-[#D8D3CA] font-light leading-relaxed mb-4 max-w-lg"
                        style={{
                          transform: `translateY(${translateY * 1.2}px)`,
                        }}
                      >
                        {chapter.body}
                      </p>
                    </div>

                    {/* Footer: Tags & Contextual Action */}
                    <div
                      className="pt-2 border-t border-[#242526]"
                      style={{
                        transform: `translateY(${translateY * 1.4}px)`,
                      }}
                    >
                      {/* Architectural spec pills */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {chapter.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-[#181B1D]/80 border border-[#242526] text-[9px] sm:text-[10px] font-mono text-[#8C8C87] tracking-wider uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Chapter-specific Micro CTA */}
                      {chapter.ctaType === 'scroll' && (
                        <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs text-[#B59A6A] tracking-[0.2em] uppercase">
                          <span>{chapter.ctaLabel}</span>
                          <div className="w-6 h-6 rounded-full border border-[#B59A6A]/40 flex items-center justify-center animate-bounce">
                            <ArrowDown className="w-3 h-3 text-[#B59A6A]" />
                          </div>
                        </div>
                      )}

                      {chapter.ctaType === 'explore' && (
                        <a
                          href="#residences"
                          className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-[#FAF9F6] hover:text-[#B59A6A] transition-colors"
                        >
                          <span>{chapter.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#B59A6A]" />
                        </a>
                      )}

                      {chapter.ctaType === 'enquire' && (
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={onOpenEnquiry}
                            className="px-5 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors duration-300 shadow-xl"
                          >
                            Enquire Now
                          </button>
                          <a
                            href="#residences"
                            className="px-4 py-2.5 sm:px-5 sm:py-3 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-[#F3F0E9] bg-[#181B1D]/90 border border-[#B59A6A]/50 hover:border-[#B59A6A] hover:bg-[#242526] transition-colors"
                          >
                            Explore Apartments
                          </a>
                        </div>
                      )}

                      {chapter.ctaType === 'none' && (
                        <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-[#8C8C87] tracking-[0.18em] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]/60" />
                          <span>{chapter.badge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SUBTLE CHAPTER RAIL INDICATOR (Right Vertical Rail)       */}
          {/* ========================================================= */}
          <div className="hidden md:flex flex-col gap-2 absolute right-6 md:right-10 lg:right-14 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <div className="bg-[#111315]/85 backdrop-blur-md border border-[#242526] p-3 sm:p-4 shadow-xl">
              <div className="px-2 py-1 font-mono text-[9px] text-[#8C8C87] tracking-[0.25em] uppercase border-b border-[#242526] mb-2">
                CHAPTERS
              </div>
              <nav className="flex flex-col gap-1.5" aria-label="Story Chapters">
                {CHAPTERS.map((ch, idx) => {
                  const isActive = activeChapterIndex === idx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => scrollToChapter(idx)}
                      className="group flex items-center gap-3 text-left py-1 px-1.5 rounded-sm transition-all duration-300 hover:bg-[#181B1D]"
                      title={`Jump to Chapter ${ch.num}: ${ch.navTitle}`}
                    >
                      <span
                        className={`font-mono text-[11px] transition-colors duration-300 ${
                          isActive
                            ? 'text-[#B59A6A] font-semibold'
                            : 'text-[#8C8C87]/60 group-hover:text-[#D8D3CA]'
                        }`}
                      >
                        {ch.num}
                      </span>
                      <span
                        className={`h-[1px] transition-all duration-300 ${
                          isActive
                            ? 'w-6 bg-[#B59A6A]'
                            : 'w-2 bg-[#8C8C87]/30 group-hover:w-4 group-hover:bg-[#8C8C87]'
                        }`}
                      />
                      <span
                        className={`font-mono text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${
                          isActive
                            ? 'text-[#FAF9F6] font-medium'
                            : 'text-[#8C8C87]/60 group-hover:text-[#D8D3CA]'
                        }`}
                      >
                        {ch.navTitle}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Minimal progress tracker */}
              <div className="w-full h-0.5 bg-[#242526] mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B59A6A] to-[#CBB488] transition-all duration-100"
                  style={{ width: `${displayProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

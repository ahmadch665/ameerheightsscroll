import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
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

  // UI state for text overlay transitions
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

      // Silky responsive smoothing: 0.14 provides effortless fluid response
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

      // Update React state for clean text fade transitions
      if (Math.abs(nextProgress - lastRenderedProgress) > 0.005) {
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

  // Phase 1 Intro text: visible at top, gently fades out as user begins scrolling (0% to 15%)
  const introOpacity = clamp(1 - displayProgress / 0.14, 0, 1);
  const introTranslateY = displayProgress * -30;

  // Phase 3 Completed Reveal text: fades in smoothly as the building finishes (80% to 100%)
  const revealOpacity = clamp((displayProgress - 0.78) / 0.18, 0, 1);
  const revealTranslateY = (1 - revealOpacity) * 20;

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
          <div className="absolute inset-0 bg-gradient-to-r from-[#111315]/30 via-transparent to-[#111315]/30 pointer-events-none z-15" />

          {/* Architectural Coordinate Badges */}
          <div className="absolute top-24 left-6 md:left-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span className="w-2 h-2 border border-[#B59A6A]" />
            <span>30.2585° N, 71.5149° E</span>
          </div>

          <div className="absolute top-24 right-6 md:right-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span>MULTAN · PUNJAB</span>
            <span className="w-2 h-2 border border-[#B59A6A]" />
          </div>

          {/* ========================================================= */}
          {/* INITIAL HERO INTRO TEXT (Scroll 0% - 15%)                 */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-6 md:p-16 z-20 pointer-events-none transition-all duration-300"
            style={{
              opacity: introOpacity,
              transform: `translateY(${introTranslateY}px)`,
              visibility: introOpacity > 0.02 ? 'visible' : 'hidden'
            }}
          >
            <div className="pt-20 md:pt-16 max-w-xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 mb-4 bg-[#181B1D]/80 border border-[#B59A6A]/30 text-[11px] font-mono tracking-[0.22em] text-[#B59A6A] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>Private Residences · Multan</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal tracking-[0.06em] text-[#FAF9F6] leading-[1.08] uppercase">
                Live Above <br />
                <span className="italic font-serif text-[#B59A6A]">The Ordinary.</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
              <div className="max-w-md">
                <p className="font-serif text-xl md:text-2xl text-[#FAF9F6] tracking-wider mb-2">
                  {projectData.name} <span className="text-[#B59A6A]">{projectData.subName}</span>
                </p>
                <p className="text-sm md:text-base text-[#D8D3CA] font-light leading-relaxed">
                  30 fully furnished residences, crafted for contemporary living at Main BZU Chowk.
                </p>
              </div>

              {/* Scroll prompt pulse indicator */}
              <div className="flex items-center gap-3 font-mono text-xs text-[#B59A6A] tracking-[0.2em] uppercase">
                <span className="hidden sm:inline">Scroll To Construct</span>
                <div className="w-8 h-8 rounded-full border border-[#B59A6A]/40 flex items-center justify-center animate-bounce">
                  <ArrowDown className="w-3.5 h-3.5 text-[#B59A6A]" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COMPLETED ARCHITECTURAL REVEAL (Scroll 80% - 100%)       */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-6 md:p-16 z-20 pointer-events-none transition-all duration-500"
            style={{
              opacity: revealOpacity,
              transform: `translateY(${revealTranslateY}px)`,
              visibility: revealOpacity > 0.05 ? 'visible' : 'hidden'
            }}
          >
            <div className="pt-20 md:pt-16 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 mb-4 bg-[#181B1D]/90 border border-[#B59A6A]/40 text-[11px] font-mono tracking-[0.22em] text-[#B59A6A] uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B59A6A]" />
                <span>Architecture Completed</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal tracking-[0.06em] text-[#FAF9F6] leading-[1.06] uppercase">
                Built For <br />
                <span className="italic font-serif text-[#B59A6A]">Modern Living.</span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
              <div className="space-y-4 max-w-xl">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] tracking-wider">
                    {projectData.name} <span className="text-[#B59A6A]">{projectData.subName}</span>
                  </h3>
                  <p className="font-mono text-xs text-[#B59A6A] uppercase tracking-[0.2em] mt-1">
                    {projectData.location.address} · {projectData.location.city}
                  </p>
                </div>

                {/* Key Metrics Badges */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 bg-[#181B1D]/80 border border-[#242526] text-left">
                    <p className="font-serif text-xl font-medium text-[#FAF9F6]">30</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C87]">Residences</p>
                  </div>
                  <div className="p-3 bg-[#181B1D]/80 border border-[#242526] text-left">
                    <p className="font-serif text-xl font-medium text-[#FAF9F6]">G+3</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C87]">Floors</p>
                  </div>
                  <div className="p-3 bg-[#181B1D]/80 border border-[#242526] text-left">
                    <p className="font-serif text-xl font-medium text-[#FAF9F6]">1</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C87]">Speed Lift</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pointer-events-auto flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenEnquiry()}
                  className="px-7 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors duration-300 shadow-xl"
                >
                  Enquire Now
                </button>
                <a
                  href="#residences"
                  className="px-6 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-[#F3F0E9] bg-[#181B1D]/90 border border-[#B59A6A]/50 hover:border-[#B59A6A] hover:bg-[#242526] transition-colors"
                >
                  View Residences
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

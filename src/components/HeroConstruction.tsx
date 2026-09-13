import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, Play, Pause, RotateCcw, Building2, Layers, CheckCircle2 } from 'lucide-react';
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

const STAGES = [
  {
    phase: '01',
    title: 'Excavation & Foundation',
    detail: 'Reinforced concrete footings, structural sub-grade and vertical rebar',
    range: [0, 0.25],
    frames: '01 – 08'
  },
  {
    phase: '02',
    title: 'Structural Framework',
    detail: 'Ground + 3 reinforced concrete column and slab ascension',
    range: [0.25, 0.50],
    frames: '08 – 15'
  },
  {
    phase: '03',
    title: 'Masonry & Envelope',
    detail: 'Precision clay brick envelope, window apertures and perimeter walls',
    range: [0.50, 0.75],
    frames: '15 – 23'
  },
  {
    phase: '04',
    title: 'Architectural Completion',
    detail: 'Graphite composite facade, warm timber vertical louvers & smoked glazing',
    range: [0.75, 1.0],
    frames: '23 – 30'
  }
];

export const HeroConstruction: React.FC<HeroConstructionProps> = ({ onOpenEnquiry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Preloaded images in memory
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedFlagsRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));

  // Frame and progress tracking refs (mutated inside rAF loop for max performance)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const currentDrawnIndexRef = useRef(-1);
  const isPlayingAutoRef = useRef(false);
  const isReducedMotionRef = useRef(false);

  // React states for UI HUD & overlays
  const [displayProgress, setDisplayProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [isFrame01Loaded, setIsFrame01Loaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  // Helper to find the nearest loaded frame if a specific frame isn't ready
  const getNearestLoadedImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const loaded = loadedFlagsRef.current;

    if (loaded[targetIndex] && images[targetIndex]) {
      return images[targetIndex];
    }

    // Search backwards first (previous completed stage)
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (loaded[i] && images[i]) return images[i];
    }

    // Search forwards if no previous frame is loaded
    for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
      if (loaded[i] && images[i]) return images[i];
    }

    return null;
  }, []);

  // Draw a frame image onto the canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = getNearestLoadedImage(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    // Intelligent contain-scaling: preserve exact aspect ratio without cropping architectural elements
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const scale = Math.min(cw / imgW, ch / imgH);

    const dw = Math.round(imgW * scale);
    const dh = Math.round(imgH * scale);
    const dx = Math.round((cw - dw) / 2);
    const dy = Math.round((ch - dh) / 2);

    // Render deep dark background behind building
    ctx.fillStyle = '#111315';
    ctx.fillRect(0, 0, cw, ch);

    // Draw frame centered and sharp
    ctx.drawImage(img, dx, dy, dw, dh);
    currentDrawnIndexRef.current = frameIndex;
  }, [getNearestLoadedImage]);

  // Sync canvas size with device pixel ratio
  const syncCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory & performance

    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      // Redraw current frame at new size
      if (currentDrawnIndexRef.current >= 0) {
        drawFrame(currentDrawnIndexRef.current);
      }
    }
  }, [drawFrame]);

  // Preload all 30 frames with Frame 01 as highest priority
  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined') {
      isReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    let isMounted = true;
    let loadedCounter = 0;

    // 1. Load Frame 01 immediately
    const img1 = new Image();
    img1.src = FRAME_PATHS[0];
    img1.onload = () => {
      if (!isMounted) return;
      imagesRef.current[0] = img1;
      loadedFlagsRef.current[0] = true;
      setIsFrame01Loaded(true);
      loadedCounter++;

      // Sync canvas dimensions and draw Frame 01 immediately
      syncCanvasDimensions();
      drawFrame(0);

      // 2. Preload remaining 29 frames in background
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = FRAME_PATHS[i];
        img.onload = () => {
          if (!isMounted) return;
          imagesRef.current[i] = img;
          loadedFlagsRef.current[i] = true;
          loadedCounter++;

          if (loadedCounter === TOTAL_FRAMES) {
            setAllLoaded(true);
          }

          // If the current target progress needs this frame and it wasn't rendered yet
          const currentIndex = Math.round(currentProgressRef.current * (TOTAL_FRAMES - 1));
          if (currentIndex === i && currentDrawnIndexRef.current !== i) {
            drawFrame(i);
          }
        };
        img.onerror = () => {
          // Graceful fallback: marked as unready, nearest frame will be used
          console.warn(`[Ameer Heights] Frame ${i + 1} preload retry notice`);
        };
      }
    };

    return () => {
      isMounted = false;
    };
  }, [syncCanvasDimensions, drawFrame]);

  // Animation render loop using requestAnimationFrame
  useEffect(() => {
    let lastRenderedProgress = -1;

    const renderLoop = () => {
      if (isReducedMotionRef.current) {
        // Reduced motion: snap directly to completion or static
        drawFrame(TOTAL_FRAMES - 1);
        return;
      }

      // Handle autoplay mode progression
      if (isPlayingAutoRef.current) {
        targetProgressRef.current += 0.0035;
        if (targetProgressRef.current >= 1) {
          targetProgressRef.current = 0; // Loop or hold
        }
      }

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Responsive lerp smoothing factor:
      // 0.20 delivers buttery smoothness without feeling laggy or delayed
      const smoothingFactor = isPlayingAutoRef.current ? 0.08 : 0.20;
      let nextProgress = lerp(current, target, smoothingFactor);

      // Snap when close to target to prevent perpetual sub-pixel computation
      if (Math.abs(target - nextProgress) < 0.0006) {
        nextProgress = target;
      }

      currentProgressRef.current = nextProgress;

      // Map smoothed progress to integer frame index [0 .. 29]
      const targetFrameIndex = clamp(
        Math.round(nextProgress * (TOTAL_FRAMES - 1)),
        0,
        TOTAL_FRAMES - 1
      );

      // Only re-draw to canvas when the frame index changes
      if (targetFrameIndex !== currentDrawnIndexRef.current) {
        drawFrame(targetFrameIndex);
      }

      // Update React HUD states only when progress changed meaningfully
      if (Math.abs(nextProgress - lastRenderedProgress) > 0.004) {
        lastRenderedProgress = nextProgress;
        setDisplayProgress(nextProgress);
        setActiveFrameDisplay(targetFrameIndex + 1);

        // Update active stage
        if (nextProgress < 0.25) setActiveStageIndex(0);
        else if (nextProgress < 0.50) setActiveStageIndex(1);
        else if (nextProgress < 0.75) setActiveStageIndex(2);
        else setActiveStageIndex(3);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [drawFrame]);

  // Native scroll listener: updates targetProgressRef without hijacking scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const totalScrollable = containerHeight - windowHeight;
      if (totalScrollable <= 0) return;

      // Scrolled distance within the 400vh pinned hero section
      const scrolled = -rect.top;
      const progress = clamp(scrolled / totalScrollable, 0, 1);

      targetProgressRef.current = progress;
    };

    // Calculate initial scroll position immediately (handles page refresh halfway down)
    handleScroll();
    currentProgressRef.current = targetProgressRef.current;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncCanvasDimensions, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncCanvasDimensions);
    };
  }, [syncCanvasDimensions]);

  // Autoplay demo controls
  const togglePlayMode = () => {
    const next = !isPlayingAuto;
    setIsPlayingAuto(next);
    isPlayingAutoRef.current = next;
  };

  const jumpToBeginning = () => {
    setIsPlayingAuto(false);
    isPlayingAutoRef.current = false;
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    drawFrame(0);
  };

  const jumpToCompletion = () => {
    setIsPlayingAuto(false);
    isPlayingAutoRef.current = false;
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    window.scrollTo({
      top: containerTop + (containerHeight - windowHeight),
      behavior: 'smooth'
    });
    targetProgressRef.current = 1;
  };

  // Text layer opacities tied to normalized scroll progress
  // Phase 1 Intro text: visible from 0 to 0.16, fully faded by 0.22
  const introOpacity = clamp(1 - displayProgress / 0.16, 0, 1);
  const introTranslateY = displayProgress * -35;

  // Phase 2 Timeline HUD: visible during active construction (0.12 to 0.82)
  const timelineOpacity =
    displayProgress > 0.10 && displayProgress < 0.82
      ? clamp((displayProgress - 0.10) / 0.05, 0, 1) * clamp((0.82 - displayProgress) / 0.05, 0, 1)
      : 0;

  // Phase 3 Completed Reveal text: fades in smoothly from 0.75 to 1.00
  const revealOpacity = clamp((displayProgress - 0.75) / 0.18, 0, 1);
  const revealTranslateY = (1 - revealOpacity) * 25;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#111315] select-none"
      aria-label="Ameer Heights Architectural Construction Timeline"
    >
      {/* 100vh Sticky Viewport Presentation Window */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Architectural backdrop with warm subtle ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111315] via-[#151719] to-[#1E2124] z-0" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#B59A6A]/5 filter blur-[100px] living-ambient pointer-events-none" />

        {/* Construction Sequence Canvas Stage */}
        <div className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center z-10">
          {/* HTML5 Canvas: 60/120fps hardware-accelerated frame sequence */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none z-10 transition-opacity duration-300"
          />

          {/* Immediate Fallback Frame 01 (visible immediately on page load before canvas first draw) */}
          {!isFrame01Loaded && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#111315]">
              <img
                src={FRAME_PATHS[0]}
                alt="Ameer Heights Tower 10 foundation ground frame"
                className="w-full h-full object-contain object-center opacity-90"
              />
              <div className="absolute bottom-12 flex items-center gap-3 px-5 py-2.5 bg-[#181B1D]/90 border border-[#B59A6A]/30 text-xs font-mono tracking-widest text-[#B59A6A]">
                <span className="w-2 h-2 rounded-full bg-[#B59A6A] animate-ping" />
                <span>ARCHITECTURAL TIMELINE INITIALIZING</span>
              </div>
            </div>
          )}

          {/* Subtle architectural vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-[#111315]/60 pointer-events-none z-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111315]/30 via-transparent to-[#111315]/30 pointer-events-none z-15" />

          {/* Top Architectural Coordinate Badges */}
          <div className="absolute top-24 left-6 md:left-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span className="w-2 h-2 border border-[#B59A6A]" />
            <span>30.2585° N, 71.5149° E</span>
          </div>

          <div className="absolute top-24 right-6 md:right-12 hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#8C8C87] tracking-[0.25em] z-20">
            <span>MULTAN · PUNJAB</span>
            <span className="w-2 h-2 border border-[#B59A6A]" />
          </div>

          {/* ========================================================= */}
          {/* PHASE 1: INITIAL HERO INTRO TEXT (Scroll 0% - 18%)        */}
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
          {/* PHASE 2: ACTIVE CONSTRUCTION TIMELINE HUD (Scroll 12-82%) */}
          {/* ========================================================= */}
          <div
            className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 z-20 pointer-events-none transition-all duration-300"
            style={{
              opacity: timelineOpacity,
              visibility: timelineOpacity > 0.05 ? 'visible' : 'hidden'
            }}
          >
            <div className="max-w-xl bg-[#111315]/90 backdrop-blur-md border border-[#B59A6A]/30 p-4 md:p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#242526] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B59A6A] animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#B59A6A]">
                    Construction Sequence
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-[#B59A6A] font-medium">
                    FRAME {String(activeFrameDisplay).padStart(2, '0')} / {TOTAL_FRAMES}
                  </span>
                  <span className="text-[#8C8C87]">({Math.round(displayProgress * 100)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-lg md:text-xl text-[#FAF9F6] tracking-wide">
                    {STAGES[activeStageIndex].title}
                  </p>
                  <p className="text-xs text-[#8C8C87] mt-0.5">
                    {STAGES[activeStageIndex].detail}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-2xl font-light text-[#B59A6A]">
                    {STAGES[activeStageIndex].phase}
                  </span>
                  <span className="font-mono text-[10px] text-[#8C8C87] block">/ 04</span>
                </div>
              </div>

              {/* Progress bar scrub indicator */}
              <div className="w-full h-1 bg-[#242526] mt-3.5 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B59A6A] to-[#CBB488] transition-all duration-75"
                  style={{ width: `${displayProgress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PHASE 3: COMPLETED ARCHITECTURAL REVEAL (Scroll 75-100%)  */}
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

                {/* Confirmed Key Metrics Badges */}
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

          {/* Quick Scrub Controls (Floating discreetly on bottom-right for manual review) */}
          <div className="absolute bottom-6 right-6 md:right-12 z-30 flex items-center gap-2 bg-[#181B1D]/80 backdrop-blur-md border border-[#242526] p-1.5 rounded-sm">
            <button
              type="button"
              onClick={jumpToBeginning}
              title="Reset to Ground Foundation (Frame 01)"
              aria-label="Reset to Ground Foundation"
              className="p-1.5 text-[#8C8C87] hover:text-[#FAF9F6] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={togglePlayMode}
              title={isPlayingAuto ? "Pause Autoplay" : "Play Construction Demo"}
              aria-label={isPlayingAuto ? "Pause Autoplay" : "Play Construction Demo"}
              className="p-1.5 text-[#8C8C87] hover:text-[#B59A6A] transition-colors"
            >
              {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={jumpToCompletion}
              title="Jump to Completed Tower (Frame 30)"
              aria-label="Jump to Completed Tower"
              className="px-2 py-1 text-[10px] font-mono tracking-wider text-[#B59A6A] hover:text-[#FAF9F6] transition-colors"
            >
              REVEAL
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const AmenitiesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const fgLayerRef = useRef<HTMLDivElement>(null);
  const curvedArcRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'amenities-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (bgLayerRef.current) bgLayerRef.current.style.transform = 'none';
          if (midLayerRef.current) midLayerRef.current.style.transform = 'none';
          if (fgLayerRef.current) fgLayerRef.current.style.transform = 'none';
          return;
        }

        // 1. BACKGROUND Layer: moves at 2x rate (slowest, deep space)
        if (bgLayerRef.current) {
          const bgY = (centerOffset * -18).toFixed(2);
          const bgOpacity = (0.55 + Math.sin(progress * Math.PI) * 0.3).toFixed(3);
          bgLayerRef.current.style.transform = `translate3d(0, ${bgY}px, 0)`;
          bgLayerRef.current.style.opacity = bgOpacity;
        }

        // Curved architectural arc in background
        if (curvedArcRef.current) {
          const arcY = (centerOffset * -12).toFixed(2);
          curvedArcRef.current.style.transform = `translate3d(0, ${arcY}px, 0)`;
        }

        // 2. MIDGROUND Layer: moves at 5x rate (medium depth, gentle 1.2-1.5 deg rotation)
        if (midLayerRef.current) {
          const midY = (centerOffset * -42).toFixed(2);
          const midX = (centerOffset * 22).toFixed(2);
          const midRot = (centerOffset * 1.4).toFixed(2); // Max 1.4 deg rotation
          midLayerRef.current.style.transform = `translate3d(${midX}px, ${midY}px, 0) rotate(${midRot}deg)`;
        }

        // 3. FOREGROUND Layer: moves at 8x rate (pronounced architectural depth parallax)
        if (fgLayerRef.current) {
          const fgY = (centerOffset * -68).toFixed(2);
          const fgX = (centerOffset * -28).toFixed(2);
          const fgRot = (centerOffset * -0.8).toFixed(2);
          fgLayerRef.current.style.transform = `translate3d(${fgX}px, ${fgY}px, 0) rotate(${fgRot}deg)`;
        }
      }
    );

    return () => unregister();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* BASE: Charcoal Velvet Canvas */}
      <div className="absolute inset-0 bg-[#111315]" />

      {/* 1. BACKGROUND LAYER (2x Parallax) */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 will-change-transform"
      >
        {/* Deep ambient golden glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(181,154,106,0.12)_0%,rgba(24,27,29,0.3)_45%,transparent_70%)] blur-3xl" />
      </div>

      {/* Curved Architectural Spatial Arc (Background Vault Contour) */}
      <svg
        ref={curvedArcRef}
        className="absolute inset-0 w-full h-full will-change-transform opacity-35"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sweeping Architectural Vault Curves */}
        <path
          d="M -100 150 Q 500 -50 1200 200 T 2200 150"
          fill="none"
          stroke="#B59A6A"
          strokeWidth="0.75"
          strokeDasharray="6 8"
          strokeOpacity="0.4"
        />
        <path
          d="M -50 450 Q 600 250 1400 550 T 2400 400"
          fill="none"
          stroke="#FAF9F6"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          strokeOpacity="0.2"
        />
      </svg>

      {/* 2. MIDGROUND LAYER (5x Parallax): Floating Architectural Cantilever Plane */}
      <div
        ref={midLayerRef}
        className="absolute top-16 -left-12 w-[45vw] max-w-[580px] h-[460px] bg-gradient-to-br from-[#1A1D20]/70 via-[#141618]/40 to-transparent border border-[#B59A6A]/20 shadow-2xl backdrop-blur-[1px] will-change-transform origin-center"
      >
        <div className="absolute top-4 left-4 font-mono text-[9px] text-[#B59A6A]/60 tracking-[0.2em] uppercase">
          SEC / AMENITY-ZONE A
        </div>
        <div className="absolute bottom-4 right-4 w-12 h-[1px] bg-[#B59A6A]/30" />
      </div>

      {/* 3. FOREGROUND LAYER (8x Parallax): Structural Frame Geometry */}
      <div
        ref={fgLayerRef}
        className="absolute bottom-16 -right-16 w-[40vw] max-w-[520px] h-[380px] bg-gradient-to-tl from-[#181B1D]/60 via-[#111315]/40 to-transparent border border-[#FAF9F6]/[0.05] will-change-transform origin-center"
      >
        {/* Corner architectural crosshair ticks */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#B59A6A]/50" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#B59A6A]/50" />
        <div className="absolute bottom-6 left-6 font-mono text-[9px] text-[#8C8C87] tracking-[0.2em] uppercase">
          STRUCTURAL ELEVATION +18.00M
        </div>
      </div>

      {/* Soft Vignette Overlay to maintain 100% text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,#111315_90%)] pointer-events-none" />

      {/* Seamless Edge Transitions */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#181B1D]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#111315] pointer-events-none" />
    </div>
  );
};

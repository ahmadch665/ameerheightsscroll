import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const OverviewBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plane1Ref = useRef<HTMLDivElement>(null);
  const plane2Ref = useRef<HTMLDivElement>(null);
  const lightSweepRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<SVGSVGElement>(null);
  const gridLinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'overview-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (plane1Ref.current) plane1Ref.current.style.transform = 'none';
          if (plane2Ref.current) plane2Ref.current.style.transform = 'none';
          if (lightSweepRef.current) lightSweepRef.current.style.transform = 'none';
          if (geometryRef.current) geometryRef.current.style.opacity = '0.35';
          return;
        }

        // Layer 2: Architectural plane shifts with scroll
        // Moves from +40px to -30px as user scrolls through
        const plane1Y = (centerOffset * -36).toFixed(2);
        const plane1X = (centerOffset * 18).toFixed(2);
        if (plane1Ref.current) {
          plane1Ref.current.style.transform = `translate3d(${plane1X}px, ${plane1Y}px, 0)`;
        }

        const plane2Y = (centerOffset * 48).toFixed(2);
        const plane2X = (centerOffset * -24).toFixed(2);
        if (plane2Ref.current) {
          plane2Ref.current.style.transform = `translate3d(${plane2X}px, ${plane2Y}px, 0)`;
        }

        // Layer 3: Directional light sweep across the surface
        // Ambient time breath + diagonal scroll path
        const ambientBreath = Math.sin(time * 0.7) * 4;
        const lightX = (centerOffset * 65 + ambientBreath).toFixed(2);
        const lightY = (centerOffset * 45).toFixed(2);
        const lightScale = (1 + Math.sin(progress * Math.PI) * 0.12).toFixed(3);
        const lightOpacity = (0.55 + Math.sin(progress * Math.PI) * 0.35).toFixed(3);
        if (lightSweepRef.current) {
          lightSweepRef.current.style.transform = `translate3d(${lightX}px, ${lightY}px, 0) scale(${lightScale})`;
          lightSweepRef.current.style.opacity = lightOpacity;
        }

        // Layer 4: Secondary architectural linework revelation
        // Progressively reveals as progress approaches center, then settles
        const geomOpacity = Math.max(0.12, Math.min(0.5, Math.sin(progress * Math.PI) * 0.6)).toFixed(3);
        const geomShift = (centerOffset * -15).toFixed(2);
        if (geometryRef.current) {
          geometryRef.current.style.opacity = geomOpacity;
          geometryRef.current.style.transform = `translate3d(0, ${geomShift}px, 0)`;
        }

        // Grid lines subtle breathing parallax
        if (gridLinesRef.current) {
          const gridY = (centerOffset * -12).toFixed(2);
          gridLinesRef.current.style.transform = `translate3d(0, ${gridY}px, 0)`;
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
      {/* LAYER 1: Deep Architectural Base with Tonal Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/80 via-[#F3F0E9] to-[#EAE6DD]" />

      {/* Atmospheric directional wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(181,154,106,0.12)_0%,rgba(243,240,233,0)_65%)]" />

      {/* LAYER 2: Large Abstract Architectural Planes & Shadow Forms */}
      {/* Primary Angled Monolithic Shadow Plane */}
      <div
        ref={plane1Ref}
        className="absolute -top-16 -right-24 w-[55vw] max-w-[800px] h-[650px] bg-gradient-to-bl from-[#E5E0D5]/70 via-[#DDD7CA]/40 to-transparent border-l border-b border-[#B59A6A]/15 transform -rotate-[7deg] origin-top-right will-change-transform"
      />

      {/* Secondary Counter-Plane (Lower Left Structural Shadow) */}
      <div
        ref={plane2Ref}
        className="absolute -bottom-28 -left-28 w-[48vw] max-w-[680px] h-[520px] bg-gradient-to-tr from-[#DDD7CA]/50 via-[#E8E3D8]/30 to-transparent border-t border-r border-[#111315]/[0.04] transform rotate-[5deg] origin-bottom-left will-change-transform"
      />

      {/* LAYER 3: Soft Directional Sunlight / Champagne Sweep */}
      <div
        ref={lightSweepRef}
        className="absolute -top-1/4 -right-1/4 w-[130%] h-[140%] bg-[radial-gradient(ellipse_at_center,_rgba(255,253,248,0.95)_0%,rgba(181,154,106,0.18)_35%,rgba(243,240,233,0)_70%)] will-change-transform"
      />

      {/* LAYER 4: Secondary Building Geometry & Precision Linework */}
      <svg
        ref={geometryRef}
        className="absolute inset-0 w-full h-full will-change-transform opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Perspective Rays from Horizon Center */}
        <line x1="50%" y1="20%" x2="0%" y2="85%" stroke="#111315" strokeWidth="0.75" strokeOpacity="0.08" strokeDasharray="4 8" />
        <line x1="50%" y1="20%" x2="100%" y2="85%" stroke="#111315" strokeWidth="0.75" strokeOpacity="0.08" strokeDasharray="4 8" />
        
        {/* Architectural Elevation Horizon & Datum Crossings */}
        <line x1="10%" y1="65%" x2="90%" y2="65%" stroke="#B59A6A" strokeWidth="0.75" strokeOpacity="0.2" />
        <line x1="15%" y1="35%" x2="85%" y2="35%" stroke="#B59A6A" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="2 6" />

        {/* Framing Corner Markers */}
        <path d="M 60 80 L 60 60 L 80 60" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M calc(100% - 60px) 80 L calc(100% - 60px) 60 L calc(100% - 80px) 60" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.3" />
      </svg>

      {/* LAYER 5: Architectural Column Slits & Drafting Grid */}
      <div
        ref={gridLinesRef}
        className="w-full h-full border-x border-[#111315]/[0.04] max-w-7xl mx-auto grid grid-cols-6 md:grid-cols-12 opacity-85 will-change-transform"
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="border-r border-[#111315]/[0.03] h-full relative">
            {i === 2 || i === 8 ? (
              <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-[#B59A6A]/20" />
            ) : null}
          </div>
        ))}
      </div>

      {/* Seamless Transitions to Adjacent Sections */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#111315]/15 via-[#111315]/[0.04] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#111315]/[0.04] to-[#111315]/[0.12] pointer-events-none" />
    </div>
  );
};

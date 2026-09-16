import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const ResidencesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightSourceRef = useRef<HTMLDivElement>(null);
  const verticalFormsRef = useRef<HTMLDivElement>(null);
  const shadowLayerRef = useRef<HTMLDivElement>(null);
  const transomLinesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'residences-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (lightSourceRef.current) lightSourceRef.current.style.transform = 'none';
          if (verticalFormsRef.current) verticalFormsRef.current.style.transform = 'none';
          if (shadowLayerRef.current) shadowLayerRef.current.style.transform = 'none';
          return;
        }

        // 1. Moving soft light source behind the architectural forms
        // Sweeps diagonally across from top-left (offset < 0) to center-right (offset > 0)
        const lightX = (centerOffset * -80 + Math.sin(time * 0.5) * 6).toFixed(2);
        const lightY = (centerOffset * 60).toFixed(2);
        const lightScale = (1 + Math.sin(progress * Math.PI) * 0.15).toFixed(3);
        const lightOpacity = (0.7 + Math.sin(progress * Math.PI) * 0.3).toFixed(3);
        if (lightSourceRef.current) {
          lightSourceRef.current.style.transform = `translate3d(${lightX}px, ${lightY}px, 0) scale(${lightScale})`;
          lightSourceRef.current.style.opacity = lightOpacity;
        }

        // 2. Vertical architectural forms shift slightly with scroll
        // Differential horizontal movement: creates shifting perspective columns
        if (verticalFormsRef.current) {
          const formX = (centerOffset * 32).toFixed(2);
          const formY = (centerOffset * -16).toFixed(2);
          verticalFormsRef.current.style.transform = `translate3d(${formX}px, ${formY}px, 0)`;
        }

        // 3. Changing shadow structures: Skew and translate counter to the light source
        if (shadowLayerRef.current) {
          const shadowSkew = (centerOffset * -8).toFixed(2);
          const shadowX = (centerOffset * 48).toFixed(2);
          shadowLayerRef.current.style.transform = `translate3d(${shadowX}px, 0, 0) skewX(${shadowSkew}deg)`;
        }

        // 4. Subtle horizontal transom lines glide
        if (transomLinesRef.current) {
          const transomY = (centerOffset * -20).toFixed(2);
          transomLinesRef.current.style.transform = `translate3d(0, ${transomY}px, 0)`;
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
      {/* BASE: Deep Charcoal Architectural Canvas */}
      <div className="absolute inset-0 bg-[#181B1D]" />

      {/* LAYER 1: Deep Interior Light Source (Behind Vertical Forms) */}
      <div
        ref={lightSourceRef}
        className="absolute top-1/4 left-1/4 w-[75vw] max-w-[900px] h-[75vh] max-h-[850px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(181,154,106,0.18)_0%,rgba(216,211,202,0.06)_40%,rgba(24,27,29,0)_75%)] will-change-transform blur-2xl"
      />

      {/* LAYER 2: Large Vertical Architectural Forms (Mullions & Slat Structures) */}
      <div
        ref={verticalFormsRef}
        className="absolute inset-0 max-w-7xl mx-auto flex justify-between px-8 md:px-16 opacity-40 will-change-transform"
      >
        {/* Abstract Vertical Structural Piers with subtle inner highlights */}
        <div className="w-16 md:w-24 h-full bg-gradient-to-b from-[#FAF9F6]/[0.04] via-[#181B1D] to-[#FAF9F6]/[0.02] border-r border-[#B59A6A]/15" />
        <div className="w-8 md:w-16 h-full bg-gradient-to-b from-transparent via-[#FAF9F6]/[0.03] to-transparent border-x border-[#FAF9F6]/[0.03]" />
        <div className="w-20 md:w-32 h-full bg-gradient-to-b from-[#B59A6A]/[0.04] via-transparent to-[#B59A6A]/[0.03] border-l border-[#B59A6A]/20 hidden sm:block" />
        <div className="w-12 md:w-20 h-full bg-gradient-to-b from-transparent via-[#FAF9F6]/[0.025] to-transparent border-r border-[#FAF9F6]/[0.04]" />
        <div className="w-24 md:w-36 h-full bg-gradient-to-b from-[#FAF9F6]/[0.035] via-[#181B1D] to-[#FAF9F6]/[0.02] border-l border-[#B59A6A]/15" />
      </div>

      {/* LAYER 3: Cast Shadows Sweeping Behind/Between Forms */}
      <div
        ref={shadowLayerRef}
        className="absolute inset-0 max-w-7xl mx-auto flex justify-around px-4 opacity-60 will-change-transform origin-top"
      >
        <div className="w-32 md:w-48 h-full bg-gradient-to-r from-[#111315]/80 via-[#111315]/40 to-transparent" />
        <div className="w-40 md:w-64 h-full bg-gradient-to-r from-transparent via-[#111315]/90 to-transparent hidden md:block" />
        <div className="w-36 md:w-56 h-full bg-gradient-to-l from-[#111315]/80 via-[#111315]/40 to-transparent" />
      </div>

      {/* LAYER 4: Faint Architectural Transoms & Framing Geometry */}
      <svg
        ref={transomLinesRef}
        className="absolute inset-0 w-full h-full will-change-transform opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal floor / transom structural references */}
        <line x1="5%" y1="28%" x2="95%" y2="28%" stroke="#B59A6A" strokeWidth="0.75" strokeDasharray="6 8" strokeOpacity="0.4" />
        <line x1="5%" y1="72%" x2="95%" y2="72%" stroke="#FAF9F6" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.25" />
        
        {/* Subtle coordinate intersection ticks */}
        <circle cx="20%" cy="28%" r="2" fill="#B59A6A" fillOpacity="0.6" />
        <circle cx="80%" cy="28%" r="2" fill="#B59A6A" fillOpacity="0.6" />
        <circle cx="50%" cy="72%" r="2" fill="#B59A6A" fillOpacity="0.6" />
      </svg>

      {/* Seamless Edge Transitions */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#111315]/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#F3F0E9]/[0.06] pointer-events-none" />
    </div>
  );
};

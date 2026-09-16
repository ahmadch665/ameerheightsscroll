import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const FurnishedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightApertureRef = useRef<HTMLDivElement>(null);
  const translucentPlane1Ref = useRef<HTMLDivElement>(null);
  const translucentPlane2Ref = useRef<HTMLDivElement>(null);
  const windowShadowsRef = useRef<HTMLDivElement>(null);
  const datumLinesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'furnished-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (lightApertureRef.current) lightApertureRef.current.style.transform = 'none';
          if (translucentPlane1Ref.current) translucentPlane1Ref.current.style.transform = 'none';
          if (translucentPlane2Ref.current) translucentPlane2Ref.current.style.transform = 'none';
          if (windowShadowsRef.current) windowShadowsRef.current.style.transform = 'none';
          return;
        }

        // 1. Large soft light areas travel diagonally across the background
        const lightX = (centerOffset * -70 + Math.sin(time * 0.45) * 8).toFixed(2);
        const lightY = (centerOffset * 50).toFixed(2);
        const lightScale = (1.0 + Math.sin(progress * Math.PI) * 0.14).toFixed(3);
        const lightOpacity = (0.75 + Math.sin(progress * Math.PI) * 0.25).toFixed(3);
        if (lightApertureRef.current) {
          lightApertureRef.current.style.transform = `translate3d(${lightX}px, ${lightY}px, 0) scale(${lightScale})`;
          lightApertureRef.current.style.opacity = lightOpacity;
        }

        // 2. Translucent architectural plane 1 moves slowly left and subtly scales
        if (translucentPlane1Ref.current) {
          const plane1X = (centerOffset * -42).toFixed(2);
          const plane1Y = (centerOffset * -18).toFixed(2);
          const plane1Scale = (1.0 + (1 - Math.abs(centerOffset)) * 0.03).toFixed(3);
          translucentPlane1Ref.current.style.transform = `translate3d(${plane1X}px, ${plane1Y}px, 0) scale(${plane1Scale})`;
        }

        // 3. Translucent architectural plane 2 moves right/down at differential speed
        if (translucentPlane2Ref.current) {
          const plane2X = (centerOffset * 36).toFixed(2);
          const plane2Y = (centerOffset * 28).toFixed(2);
          translucentPlane2Ref.current.style.transform = `translate3d(${plane2X}px, ${plane2Y}px, 0)`;
        }

        // 4. Window shadow structures move at a slower parallax speed
        if (windowShadowsRef.current) {
          const shadowX = (centerOffset * -20).toFixed(2);
          const shadowY = (centerOffset * -10).toFixed(2);
          windowShadowsRef.current.style.transform = `translate3d(${shadowX}px, ${shadowY}px, 0)`;
        }

        // 5. Interior datum lines
        if (datumLinesRef.current) {
          const datumY = (centerOffset * -14).toFixed(2);
          datumLinesRef.current.style.transform = `translate3d(0, ${datumY}px, 0)`;
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
      {/* BASE: Deep Charcoal Interior Ambiance */}
      <div className="absolute inset-0 bg-[#111315]" />

      {/* LAYER 1: Large Warm/Cool Sunlight Aperture Wash */}
      <div
        ref={lightApertureRef}
        className="absolute -top-1/4 -right-1/4 w-[130%] h-[140%] bg-[radial-gradient(ellipse_at_center,_rgba(181,154,106,0.16)_0%,rgba(36,37,38,0.4)_45%,rgba(17,19,21,0)_75%)] will-change-transform blur-3xl"
      />

      {/* Atmospheric secondary cool slate glow in lower-left corner */}
      <div className="absolute -bottom-32 -left-32 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(40,44,48,0.5)_0%,rgba(17,19,21,0)_70%)]" />

      {/* LAYER 2: Translucent Architectural Interior Planes */}
      {/* Upper-Right Architectural Partition Plane */}
      <div
        ref={translucentPlane1Ref}
        className="absolute top-8 -right-16 w-[48vw] max-w-[640px] h-[520px] bg-gradient-to-bl from-[#1E2225]/60 via-[#181B1D]/40 to-transparent border-l border-b border-[#B59A6A]/20 transform -rotate-[4deg] origin-top-right will-change-transform backdrop-blur-[1px]"
      />

      {/* Lower-Left Interior Spatial Plane */}
      <div
        ref={translucentPlane2Ref}
        className="absolute bottom-12 -left-20 w-[42vw] max-w-[580px] h-[440px] bg-gradient-to-tr from-[#1A1D20]/50 via-[#141618]/30 to-transparent border-t border-r border-[#FAF9F6]/[0.04] transform rotate-[3deg] origin-bottom-left will-change-transform"
      />

      {/* LAYER 3: Architectural Window Mullion & Louver Shadow Bars */}
      <div
        ref={windowShadowsRef}
        className="absolute inset-0 max-w-7xl mx-auto flex justify-around px-8 opacity-45 will-change-transform"
      >
        <div className="w-[1px] h-full bg-gradient-to-b from-[#FAF9F6]/[0.08] via-[#B59A6A]/[0.05] to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#FAF9F6]/[0.06] to-[#FAF9F6]/[0.02]" />
        <div className="w-[1px] h-full bg-gradient-to-b from-[#FAF9F6]/[0.08] via-transparent to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#B59A6A]/[0.05] to-[#FAF9F6]/[0.04] hidden md:block" />
      </div>

      {/* LAYER 4: Soft Architectural Interior Transoms */}
      <svg
        ref={datumLinesRef}
        className="absolute inset-0 w-full h-full will-change-transform opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="8%" y1="36%" x2="92%" y2="36%" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="4 8" strokeOpacity="0.3" />
        <line x1="12%" y1="78%" x2="88%" y2="78%" stroke="#FAF9F6" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.2" />
      </svg>

      {/* Seamless Edge Transitions */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#111315] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#181B1D]/50 pointer-events-none" />
    </div>
  );
};

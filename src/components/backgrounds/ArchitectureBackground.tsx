import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const ArchitectureBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreLightRef = useRef<HTMLDivElement>(null);
  const structuralColumnsRef = useRef<HTMLDivElement>(null);
  const floorLinesGroupRef = useRef<SVGGElement>(null);
  const perspectiveDiagonalsRef = useRef<SVGGElement>(null);
  const datumNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'architecture-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (coreLightRef.current) coreLightRef.current.style.transform = 'none';
          if (structuralColumnsRef.current) structuralColumnsRef.current.style.transform = 'none';
          if (perspectiveDiagonalsRef.current) perspectiveDiagonalsRef.current.style.transform = 'none';
          return;
        }

        // 1. Structural tower columns shift with vertical parallax
        if (structuralColumnsRef.current) {
          const colY = (centerOffset * -32).toFixed(2);
          const colScaleX = (0.98 + (1 - Math.abs(centerOffset)) * 0.04).toFixed(3);
          structuralColumnsRef.current.style.transform = `translate3d(0, ${colY}px, 0) scaleX(${colScaleX})`;
        }

        // 2. Progressive Floor Level Lines Extension (Real-time Elevation Drawing)
        // 10 floor lines progressively draw outward as progress advances
        if (floorLinesGroupRef.current) {
          const lines = floorLinesGroupRef.current.children;
          const totalLines = lines.length;
          for (let i = 0; i < totalLines; i++) {
            const line = lines[i] as SVGLineElement;
            // Floor line threshold from bottom (floor 1) to top (floor 10)
            const lineThreshold = 0.15 + (i / totalLines) * 0.7;
            const lineProgress = Math.max(0, Math.min(1, (progress - lineThreshold + 0.25) / 0.35));
            // Line length approx 1000px
            const offset = (1000 * (1 - lineProgress)).toFixed(1);
            line.style.strokeDashoffset = offset;
            line.style.opacity = Math.max(0.15, Math.min(0.65, lineProgress * 0.8)).toFixed(3);
          }
        }

        // 3. Floor datum level markers reveal
        if (datumNumbersRef.current) {
          const datumY = (centerOffset * -24).toFixed(2);
          datumNumbersRef.current.style.transform = `translate3d(0, ${datumY}px, 0)`;
        }

        // 4. Perspective elevation lines moving at differential speed
        if (perspectiveDiagonalsRef.current) {
          const diagX = (centerOffset * -40).toFixed(2);
          const diagScale = (0.95 + progress * 0.1).toFixed(3);
          perspectiveDiagonalsRef.current.style.transform = `translate3d(${diagX}px, 0, 0) scale(${diagScale})`;
          perspectiveDiagonalsRef.current.style.transformOrigin = '50% 30%';
        }

        // 5. Architectural Core Illumination Beam
        if (coreLightRef.current) {
          const lightX = (centerOffset * 45 + Math.sin(time * 0.5) * 6).toFixed(2);
          const lightY = (centerOffset * -20).toFixed(2);
          const lightOpacity = (0.6 + Math.sin(progress * Math.PI) * 0.4).toFixed(3);
          coreLightRef.current.style.transform = `translate3d(${lightX}px, ${lightY}px, 0)`;
          coreLightRef.current.style.opacity = lightOpacity;
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
      {/* BASE: Monolithic Dark Architectural Slate */}
      <div className="absolute inset-0 bg-[#181B1D]" />

      {/* LAYER 1: Central Tower Core Illumination */}
      <div
        ref={coreLightRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1000px] h-[75vh] max-h-[850px] bg-[radial-gradient(ellipse_at_center,_rgba(181,154,106,0.14)_0%,rgba(24,27,29,0.3)_50%,transparent_75%)] will-change-transform blur-3xl"
      />

      {/* LAYER 2: Structural Vertical Column Grid (Building Proportion Rhythm) */}
      <div
        ref={structuralColumnsRef}
        className="absolute inset-0 max-w-7xl mx-auto border-x border-[#FAF9F6]/[0.04] grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 opacity-85 will-change-transform"
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className={`border-r h-full relative ${
              i === 3 || i === 7 ? 'border-[#B59A6A]/15 bg-[#FAF9F6]/[0.01]' : 'border-[#FAF9F6]/[0.025]'
            }`}
          />
        ))}
      </div>

      {/* LAYER 3: Progressive 10-Floor Elevation Datum Lines (Drawn in real-time) */}
      <svg
        className="absolute inset-0 w-full h-full will-change-transform"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor Lines: 10 structural levels + Roof parapet */}
        <g ref={floorLinesGroupRef}>
          {Array.from({ length: 10 }).map((_, idx) => {
            // Y position from bottom (floor 10 at 18%, floor 1 at 82%)
            const yPercent = 18 + idx * 7;
            return (
              <line
                key={idx}
                x1="4%"
                y1={`${yPercent}%`}
                x2="96%"
                y2={`${yPercent}%`}
                stroke={idx === 0 || idx === 4 || idx === 9 ? '#B59A6A' : '#FAF9F6'}
                strokeWidth={idx === 0 || idx === 9 ? 1 : 0.6}
                strokeDasharray="1000"
                strokeDashoffset="1000"
                strokeOpacity={idx === 0 || idx === 9 ? '0.45' : '0.25'}
                className="will-change-transform"
              />
            );
          })}
        </g>

        {/* LAYER 4: Perspective Facade Convergence Rays */}
        <g ref={perspectiveDiagonalsRef} className="will-change-transform opacity-30">
          <line x1="20%" y1="0%" x2="80%" y2="100%" stroke="#B59A6A" strokeWidth="0.75" strokeDasharray="4 8" strokeOpacity="0.4" />
          <line x1="80%" y1="0%" x2="20%" y2="100%" stroke="#B59A6A" strokeWidth="0.75" strokeDasharray="4 8" strokeOpacity="0.4" />
          <line x1="50%" y1="0%" x2="5%" y2="100%" stroke="#FAF9F6" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.2" />
          <line x1="50%" y1="0%" x2="95%" y2="100%" stroke="#FAF9F6" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.2" />
        </g>
      </svg>

      {/* LAYER 5: Architectural Floor Level Markers (Left Margin) */}
      <div
        ref={datumNumbersRef}
        className="absolute left-6 md:left-12 top-0 bottom-0 flex flex-col justify-between py-24 font-mono text-[9px] text-[#B59A6A]/60 uppercase tracking-[0.2em] pointer-events-none select-none will-change-transform hidden sm:flex"
      >
        <span>LVL 10 · ROOF</span>
        <span>LVL 08 · PENTHOUSE</span>
        <span>LVL 05 · RESIDENCE</span>
        <span>LVL 02 · EXECUTIVE</span>
        <span>LVL 00 · GROUND</span>
      </div>

      {/* Seamless Transitions to Adjacent Sections */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#181B1D]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#111315] pointer-events-none" />
    </div>
  );
};

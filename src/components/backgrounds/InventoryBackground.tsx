import React, { useEffect, useRef } from 'react';
import { scrollReveal } from '../../utils/scrollReveal';

export const InventoryBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryAxisHRef = useRef<SVGLineElement>(null);
  const primaryAxisVRef = useRef<SVGLineElement>(null);
  const subLinesHRef = useRef<SVGGElement>(null);
  const subLinesVRef = useRef<SVGGElement>(null);
  const perspectiveRaysRef = useRef<SVGGElement>(null);
  const intersectionsRef = useRef<SVGGElement>(null);
  const atmosphericWashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest('section') || container;

    const unregister = scrollReveal.registerSectionBackground(
      'inventory-bg',
      section as HTMLElement,
      (progress, centerOffset, time, isReducedMotion) => {
        if (isReducedMotion) {
          if (primaryAxisHRef.current) primaryAxisHRef.current.style.strokeDashoffset = '0';
          if (primaryAxisVRef.current) primaryAxisVRef.current.style.strokeDashoffset = '0';
          if (subLinesHRef.current) subLinesHRef.current.style.opacity = '0.35';
          if (subLinesVRef.current) subLinesVRef.current.style.opacity = '0.35';
          if (perspectiveRaysRef.current) perspectiveRaysRef.current.style.opacity = '0.25';
          if (intersectionsRef.current) intersectionsRef.current.style.opacity = '0.5';
          return;
        }

        // 1. Major construction axes progressively draw out
        // Line length approx 1400px: mapped smoothly across scroll progress
        const drawFactor = Math.max(0, Math.min(1, progress * 1.5));
        const dashOffsetH = (1400 * (1 - drawFactor)).toFixed(1);
        const dashOffsetV = (1200 * (1 - drawFactor)).toFixed(1);

        if (primaryAxisHRef.current) {
          primaryAxisHRef.current.style.strokeDashoffset = dashOffsetH;
        }
        if (primaryAxisVRef.current) {
          primaryAxisVRef.current.style.strokeDashoffset = dashOffsetV;
        }

        // 2. Horizontal construction lines travel and extend
        if (subLinesHRef.current) {
          const subShiftX = (centerOffset * 28).toFixed(2);
          const subOpacity = Math.max(0.1, Math.min(0.45, Math.sin(progress * Math.PI) * 0.55)).toFixed(3);
          subLinesHRef.current.style.transform = `translate3d(${subShiftX}px, 0, 0)`;
          subLinesHRef.current.style.opacity = subOpacity;
        }

        // 3. Vertical construction lines glide vertically with scroll
        if (subLinesVRef.current) {
          const subShiftY = (centerOffset * -24).toFixed(2);
          const subVOpacity = Math.max(0.12, Math.min(0.5, Math.sin(progress * Math.PI) * 0.6)).toFixed(3);
          subLinesVRef.current.style.transform = `translate3d(0, ${subShiftY}px, 0)`;
          subLinesVRef.current.style.opacity = subVOpacity;
        }

        // 4. Perspective vanishing lines fan outward
        if (perspectiveRaysRef.current) {
          const rayScale = (0.94 + progress * 0.12).toFixed(3);
          const rayOpacity = Math.max(0.08, Math.min(0.35, Math.sin(progress * Math.PI) * 0.4)).toFixed(3);
          perspectiveRaysRef.current.style.transform = `scale(${rayScale})`;
          perspectiveRaysRef.current.style.transformOrigin = '50% 15%';
          perspectiveRaysRef.current.style.opacity = rayOpacity;
        }

        // 5. Crosshair intersections fade in with subtle scale
        if (intersectionsRef.current) {
          const crossScale = (0.85 + Math.min(1, progress * 1.3) * 0.15).toFixed(3);
          const crossOpacity = Math.max(0.2, Math.min(0.7, progress * 1.2)).toFixed(3);
          intersectionsRef.current.style.transform = `scale(${crossScale})`;
          intersectionsRef.current.style.transformOrigin = 'center center';
          intersectionsRef.current.style.opacity = crossOpacity;
        }

        // 6. Subtle atmospheric drafting wash
        if (atmosphericWashRef.current) {
          const washX = (centerOffset * -35 + Math.sin(time * 0.6) * 5).toFixed(2);
          atmosphericWashRef.current.style.transform = `translate3d(${washX}px, 0, 0)`;
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
      {/* BASE: Warm Drafting Paper Texture */}
      <div className="absolute inset-0 bg-[#F3F0E9]" />

      {/* Atmospheric Drafting Wash (Subtle gradient movement) */}
      <div
        ref={atmosphericWashRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(181,154,106,0.08)_0%,transparent_60%)] will-change-transform"
      />

      {/* SVG REAL-TIME ARCHITECTURAL GRID CONSTRUCTION */}
      <svg
        className="absolute inset-0 w-full h-full will-change-transform"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PERSPECTIVE VANISHING RAYS */}
        <g ref={perspectiveRaysRef} className="transition-opacity duration-300">
          <line x1="50%" y1="12%" x2="5%" y2="95%" stroke="#B59A6A" strokeWidth="0.75" strokeDasharray="4 8" />
          <line x1="50%" y1="12%" x2="25%" y2="95%" stroke="#111315" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 6" />
          <line x1="50%" y1="12%" x2="75%" y2="95%" stroke="#111315" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 6" />
          <line x1="50%" y1="12%" x2="95%" y2="95%" stroke="#B59A6A" strokeWidth="0.75" strokeDasharray="4 8" />
        </g>

        {/* PRIMARY DRAWING AXES (Stroke Dash Drawing Animation) */}
        {/* Horizontal Primary Datum Axis */}
        <line
          ref={primaryAxisHRef}
          x1="2%"
          y1="42%"
          x2="98%"
          y2="42%"
          stroke="#B59A6A"
          strokeWidth="1"
          strokeDasharray="1400"
          strokeDashoffset="1400"
          strokeOpacity="0.45"
          className="will-change-transform"
        />

        {/* Vertical Primary Structural Axis */}
        <line
          ref={primaryAxisVRef}
          x1="50%"
          y1="5%"
          x2="50%"
          y2="95%"
          stroke="#B59A6A"
          strokeWidth="1"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          strokeOpacity="0.45"
          className="will-change-transform"
        />

        {/* SUB-LINES: Horizontal Construction Reference Tracks */}
        <g ref={subLinesHRef} className="will-change-transform">
          <line x1="8%" y1="20%" x2="92%" y2="20%" stroke="#111315" strokeWidth="0.75" strokeDasharray="6 8" strokeOpacity="0.15" />
          <line x1="5%" y1="68%" x2="95%" y2="68%" stroke="#111315" strokeWidth="0.75" strokeDasharray="6 8" strokeOpacity="0.15" />
          <line x1="12%" y1="88%" x2="88%" y2="88%" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="2 6" strokeOpacity="0.25" />
        </g>

        {/* SUB-LINES: Vertical Column Markers */}
        <g ref={subLinesVRef} className="will-change-transform">
          <line x1="22%" y1="8%" x2="22%" y2="92%" stroke="#111315" strokeWidth="0.75" strokeDasharray="4 8" strokeOpacity="0.12" />
          <line x1="78%" y1="8%" x2="78%" y2="92%" stroke="#111315" strokeWidth="0.75" strokeDasharray="4 8" strokeOpacity="0.12" />
          <line x1="36%" y1="15%" x2="36%" y2="85%" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.2" />
          <line x1="64%" y1="15%" x2="64%" y2="85%" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.2" />
        </g>

        {/* STRUCTURAL INTERSECTIONS & DRAFTING TICK MARKS */}
        <g ref={intersectionsRef} className="will-change-transform">
          {/* Main Central Intersection Crosshair */}
          <path d="M 50% 40% L 50% 44% M 48% 42% L 52% 42%" stroke="#B59A6A" strokeWidth="1.25" strokeOpacity="0.8" />
          
          {/* Outer Grid Crosshairs */}
          <g transform="translate(0, 0)">
            {/* Left Intersection */}
            <line x1="21.5%" y1="42%" x2="22.5%" y2="42%" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="22%" y1="41%" x2="22%" y2="43%" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.6" />
            
            {/* Right Intersection */}
            <line x1="77.5%" y1="42%" x2="78.5%" y2="42%" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="78%" y1="41%" x2="78%" y2="43%" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.6" />
          </g>

          {/* Precision Corner Framing Marks */}
          <path d="M 40 40 L 40 25 L 55 25" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M calc(100% - 40px) 40 L calc(100% - 40px) 25 L calc(100% - 55px) 25" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M 40 calc(100% - 40px) L 40 calc(100% - 25px) L 55 calc(100% - 25px)" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M calc(100% - 40px) calc(100% - 40px) L calc(100% - 40px) calc(100% - 25px) L calc(100% - 55px) calc(100% - 25px)" fill="none" stroke="#B59A6A" strokeWidth="1" strokeOpacity="0.5" />
        </g>
      </svg>

      {/* Seamless Edge Transitions */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#181B1D]/15 via-[#181B1D]/[0.03] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#111315]/20 pointer-events-none" />
    </div>
  );
};

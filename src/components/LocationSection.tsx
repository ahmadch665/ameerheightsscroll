import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Navigation, Compass, ExternalLink, Plus, Minus, RotateCcw, Copy, Check } from 'lucide-react';
import { clamp, lerp } from '../utils/formatters';

const PROJECT_COORDINATES = {
  lat: 30.2715185,
  lng: 71.4948905,
  formatted: '30.2715185° N, 71.4948905° E',
};

const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${PROJECT_COORDINATES.lat},${PROJECT_COORDINATES.lng}`;
const GOOGLE_MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${PROJECT_COORDINATES.lat},${PROJECT_COORDINATES.lng}`;

/**
 * Coordinate projection for architectural vector map of Multan
 * Center: Main BZU Chowk, Bosan Road (x: 500, y: 440 in a 1000x800 coordinate space)
 * North is up.
 * 
 * Approximate relative SVG coordinates:
 * - Ameer Heights (BZU Chowk): (500, 440)
 * - DHA Multan: (515, 230) [North along Bosan/Jinnah corridor, ~2.7 km]
 * - Multan International Airport: (330, 720) [Southwest near Cantt, ~11 km]
 * - Northern Bypass intersection: (495, 530)
 * - Chenab River curve: West side (x: 80 - 240, running north-to-south)
 */
const MAP_COORDS = {
  ameerHeights: { x: 500, y: 440 },
  dhaMultan: { x: 515, y: 230 },
  airport: { x: 330, y: 720 },
  northernBypass: { x: 495, y: 530 },
};

export const LocationSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // High-precision scroll tracking refs (avoids React re-renders during 60fps scroll)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const scrollMetricsRef = useRef({
    containerTop: 0,
    totalScrollable: 1,
  });

  // DOM direct-manipulation refs for 60fps transform & opacity updates
  const svgMapRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const stage1TextRef = useRef<HTMLDivElement>(null);
  const stage2MultanRef = useRef<HTMLDivElement>(null);
  const stage2BosanRef = useRef<HTMLDivElement>(null);
  const stage2ChowkRef = useRef<HTMLDivElement>(null);
  const markerPulseRef = useRef<SVGCircleElement>(null);
  const markerDotRef = useRef<SVGCircleElement>(null);
  const markerLabelRef = useRef<SVGTextElement>(null);
  const markerSubLabelRef = useRef<SVGTextElement>(null);
  const routeDhaRef = useRef<SVGPathElement>(null);
  const routeAirportRef = useRef<SVGPathElement>(null);
  const distanceDhaRef = useRef<HTMLDivElement>(null);
  const distanceAirportRef = useRef<HTMLDivElement>(null);
  const commercialStatementRef = useRef<HTMLDivElement>(null);
  const buildingRevealRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const telemetryHudRef = useRef<HTMLDivElement>(null);

  // Practical Map State
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [practicalZoom, setPracticalZoom] = useState(1);
  const [practicalPan, setPracticalPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle practical map drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - practicalPan.x, y: e.clientY - practicalPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPracticalPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - practicalPan.x,
        y: e.touches[0].clientY - practicalPan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPracticalPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${PROJECT_COORDINATES.lat}, ${PROJECT_COORDINATES.lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2400);
  };

  // 60 FPS Render loop with direct DOM updates
  useEffect(() => {
    let isRunning = true;

    // Cache total route path lengths once
    let dhaPathLength = 300;
    let airportPathLength = 400;
    if (routeDhaRef.current) {
      try {
        dhaPathLength = routeDhaRef.current.getTotalLength() || 300;
        routeDhaRef.current.style.strokeDasharray = `${dhaPathLength}`;
        routeDhaRef.current.style.strokeDashoffset = `${dhaPathLength}`;
      } catch {
        // Fallback if SVG measurement is not available
      }
    }
    if (routeAirportRef.current) {
      try {
        airportPathLength = routeAirportRef.current.getTotalLength() || 400;
        routeAirportRef.current.style.strokeDasharray = `${airportPathLength}`;
        routeAirportRef.current.style.strokeDashoffset = `${airportPathLength}`;
      } catch {
        // Fallback
      }
    }

    const render = () => {
      if (!isRunning) return;

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const delta = target - current;

      let p: number;
      if (Math.abs(delta) < 0.0001) {
        p = target;
      } else {
        p = current + delta * 0.18; // Smooth cinematic damping
      }
      currentProgressRef.current = p;

      // Update vertical progress hairline
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleY(${p})`;
      }

      // =======================================================================
      // CAMERA MOTION & ZOOM TRAJECTORY:
      // Phase 0.00 -> 0.24: Wide Multan City Context (Scale 1.0, Pan center)
      // Phase 0.24 -> 0.50: Approach Bosan Road & Main BZU Chowk (Scale 1.0 -> 2.6, Pan towards (500, 440))
      // Phase 0.50 -> 0.72: Close inspection of Proximity & Routes (Scale 2.6 -> 2.1, balanced framing)
      // Phase 0.72 -> 0.94: Architectural Tower Transition (Scale 2.1 -> 3.2, map fades out, building fades in)
      // Phase 0.94 -> 1.00: Fade towards practical map
      // =======================================================================
      let mapScale: number;
      let mapPanX: number;
      let mapPanY: number;
      let mapOpacity = 1.0;

      if (p < 0.24) {
        // Stage 1: Wide City View
        mapScale = 1.0;
        mapPanX = 0;
        mapPanY = 0;
      } else if (p < 0.50) {
        // Stage 2: Smooth Glide to Main BZU Chowk
        const t = (p - 0.24) / 0.26;
        const s = t * t * (3 - 2 * t); // Smoothstep
        mapScale = lerp(1.0, 2.7, s);
        // Translate center (500, 400) to viewport center
        mapPanX = lerp(0, -220, s);
        mapPanY = lerp(0, -90, s);
      } else if (p < 0.72) {
        // Stage 3: Proximity & Routes Reveal (Framing Ameer Heights + DHA + Airport)
        const t = (p - 0.50) / 0.22;
        const s = t * t * (3 - 2 * t);
        mapScale = lerp(2.7, 2.05, s);
        mapPanX = lerp(-220, -110, s);
        mapPanY = lerp(-90, -40, s);
      } else if (p < 0.94) {
        // Stage 4: Cinematic Transition from Map to Building
        const t = (p - 0.72) / 0.22;
        const s = t * t * (3 - 2 * t);
        mapScale = lerp(2.05, 2.9, s);
        mapPanX = lerp(-110, -200, s);
        mapPanY = lerp(-40, -100, s);
        mapOpacity = clamp(1 - t * 1.25, 0, 1);
      } else {
        // Stage 5: Final Glide
        mapScale = 2.9;
        mapPanX = -200;
        mapPanY = -100;
        mapOpacity = 0;
      }

      if (mapGroupRef.current) {
        mapGroupRef.current.setAttribute(
          'transform',
          `translate(${mapPanX}, ${mapPanY}) scale(${mapScale})`
        );
      }
      if (svgMapRef.current) {
        svgMapRef.current.style.opacity = `${mapOpacity}`;
      }

      // =======================================================================
      // TYPOGRAPHY & OVERLAY OPACITY / TRANSFORMS
      // =======================================================================

      // 1. Stage 1 Opening Statement: "CONNECTED TO THE CITY."
      // Visible between 0.00 and 0.23
      if (stage1TextRef.current) {
        let op = 0;
        let transY = 0;
        if (p < 0.18) {
          op = clamp(p / 0.06, 0, 1);
          transY = lerp(16, 0, op);
        } else if (p <= 0.25) {
          op = clamp(1 - (p - 0.18) / 0.06, 0, 1);
          transY = lerp(0, -16, 1 - op);
        }
        stage1TextRef.current.style.opacity = `${op}`;
        stage1TextRef.current.style.transform = `translate3d(0, ${transY}px, 0)`;
        stage1TextRef.current.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
      }

      // 2. Stage 2 Sequential Reveals: "MULTAN" -> "BOSAN ROAD" -> "MAIN BZU CHOWK"
      // Visible between 0.24 and 0.49
      const updateLocationPhrase = (
        el: HTMLDivElement | null,
        enterP: number,
        peakP: number,
        exitP: number
      ) => {
        if (!el) return;
        let op = 0;
        let transY = 12;
        let scale = 0.98;
        if (p >= enterP && p <= exitP) {
          if (p < peakP) {
            const t = (p - enterP) / (peakP - enterP);
            op = t;
            transY = lerp(14, 0, t);
            scale = lerp(0.98, 1, t);
          } else {
            const t = (p - peakP) / (exitP - peakP);
            op = clamp(1 - t * 1.5, 0, 1);
            transY = lerp(0, -10, t);
            scale = lerp(1, 1.02, t);
          }
        }
        el.style.opacity = `${op}`;
        el.style.transform = `translate3d(0, ${transY}px, 0) scale(${scale})`;
      };

      updateLocationPhrase(stage2MultanRef.current, 0.22, 0.30, 0.45);
      updateLocationPhrase(stage2BosanRef.current, 0.29, 0.37, 0.47);
      updateLocationPhrase(stage2ChowkRef.current, 0.36, 0.44, 0.52);

      // 3. Custom Architectural Marker Pulse & Label
      // Gradually emerges as camera approaches Bosan Road (p >= 0.28)
      if (markerDotRef.current && markerPulseRef.current) {
        const markerAlpha = clamp((p - 0.24) / 0.12, 0, 1) * mapOpacity;
        markerDotRef.current.setAttribute('opacity', `${markerAlpha}`);
        markerPulseRef.current.setAttribute('opacity', `${markerAlpha * 0.4}`);

        if (markerLabelRef.current && markerSubLabelRef.current) {
          const labelAlpha = clamp((p - 0.34) / 0.10, 0, 1) * mapOpacity;
          markerLabelRef.current.setAttribute('opacity', `${labelAlpha}`);
          markerSubLabelRef.current.setAttribute('opacity', `${labelAlpha * 0.85}`);
        }
      }

      // 4. Stage 3 Proximity & Routes: 2.7 KM DHA Multan & 11 KM Airport
      // Progress 0.48 -> 0.72
      const isRouteActive = p >= 0.48 && p <= 0.74;

      // Draw DHA Route
      if (routeDhaRef.current) {
        if (p < 0.48) {
          routeDhaRef.current.style.strokeDashoffset = `${dhaPathLength}`;
          routeDhaRef.current.setAttribute('opacity', '0');
        } else if (p <= 0.74) {
          const t = clamp((p - 0.48) / 0.10, 0, 1);
          routeDhaRef.current.style.strokeDashoffset = `${lerp(dhaPathLength, 0, t)}`;
          routeDhaRef.current.setAttribute('opacity', `${mapOpacity * 0.75}`);
        } else {
          routeDhaRef.current.setAttribute('opacity', `${clamp((0.78 - p) / 0.04, 0, 1) * 0.75}`);
        }
      }

      // Draw Airport Route
      if (routeAirportRef.current) {
        if (p < 0.52) {
          routeAirportRef.current.style.strokeDashoffset = `${airportPathLength}`;
          routeAirportRef.current.setAttribute('opacity', '0');
        } else if (p <= 0.74) {
          const t = clamp((p - 0.52) / 0.12, 0, 1);
          routeAirportRef.current.style.strokeDashoffset = `${lerp(airportPathLength, 0, t)}`;
          routeAirportRef.current.setAttribute('opacity', `${mapOpacity * 0.75}`);
        } else {
          routeAirportRef.current.setAttribute('opacity', `${clamp((0.78 - p) / 0.04, 0, 1) * 0.75}`);
        }
      }

      // Distance Typography: DHA Multan
      if (distanceDhaRef.current) {
        let op = 0;
        let transY = 16;
        if (isRouteActive) {
          if (p < 0.56) {
            const t = clamp((p - 0.49) / 0.06, 0, 1);
            op = t;
            transY = lerp(16, 0, t);
          } else if (p < 0.69) {
            op = 1;
            transY = 0;
          } else {
            const t = clamp((p - 0.69) / 0.04, 0, 1);
            op = 1 - t;
            transY = lerp(0, -12, t);
          }
        }
        distanceDhaRef.current.style.opacity = `${op}`;
        distanceDhaRef.current.style.transform = `translate3d(0, ${transY}px, 0)`;
      }

      // Distance Typography: Airport
      if (distanceAirportRef.current) {
        let op = 0;
        let transY = 16;
        if (isRouteActive) {
          if (p < 0.58) {
            const t = clamp((p - 0.53) / 0.06, 0, 1);
            op = t;
            transY = lerp(16, 0, t);
          } else if (p < 0.69) {
            op = 1;
            transY = 0;
          } else {
            const t = clamp((p - 0.69) / 0.04, 0, 1);
            op = 1 - t;
            transY = lerp(0, -12, t);
          }
        }
        distanceAirportRef.current.style.opacity = `${op}`;
        distanceAirportRef.current.style.transform = `translate3d(0, ${transY}px, 0)`;
      }

      // Commercial statement: "IN THE HEART OF A GROWING ADDRESS."
      if (commercialStatementRef.current) {
        let op = 0;
        let transY = 14;
        if (p >= 0.55 && p <= 0.74) {
          if (p < 0.62) {
            const t = clamp((p - 0.55) / 0.06, 0, 1);
            op = t;
            transY = lerp(14, 0, t);
          } else if (p < 0.70) {
            op = 1;
            transY = 0;
          } else {
            const t = clamp((p - 0.70) / 0.04, 0, 1);
            op = 1 - t;
            transY = lerp(0, -10, t);
          }
        }
        commercialStatementRef.current.style.opacity = `${op}`;
        commercialStatementRef.current.style.transform = `translate3d(0, ${transY}px, 0)`;
      }

      // 5. Stage 4: Cinematic Architectural Building Reveal
      // CITY -> LOCATION -> ADDRESS -> BUILDING
      // Progress 0.72 -> 0.95
      if (buildingRevealRef.current) {
        let op = 0;
        let scale = 1.08;
        let transY = 20;

        if (p >= 0.72 && p <= 0.98) {
          if (p < 0.82) {
            const t = (p - 0.72) / 0.10;
            const s = t * t * (3 - 2 * t);
            op = s;
            scale = lerp(1.08, 1.0, s);
            transY = lerp(20, 0, s);
          } else if (p <= 0.93) {
            op = 1.0;
            scale = 1.0;
            transY = 0;
          } else {
            const t = (p - 0.93) / 0.05;
            op = clamp(1 - t * 1.5, 0, 1);
            transY = lerp(0, -16, t);
          }
        }
        buildingRevealRef.current.style.opacity = `${op}`;
        buildingRevealRef.current.style.transform = `translate3d(0, ${transY}px, 0) scale(${scale})`;
        buildingRevealRef.current.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
      }

      // 6. Telemetry HUD label update
      if (telemetryHudRef.current) {
        let hudText = 'CITY METROPOLIS CONTEXT · WIDE';
        if (p >= 0.24 && p < 0.48) {
          hudText = 'APPROACHING BOSAN ROAD CORRIDOR';
        } else if (p >= 0.48 && p < 0.72) {
          hudText = 'STRATEGIC PROXIMITY · VERIFIED ARTERIALS';
        } else if (p >= 0.72 && p < 0.95) {
          hudText = 'DESTINATION · AMEER HEIGHTS TOWER 10';
        } else if (p >= 0.95) {
          hudText = 'GEOGRAPHIC SPECIFICATIONS · PRACTICAL MAP';
        }
        if (telemetryHudRef.current.innerText !== hudText) {
          telemetryHudRef.current.innerText = hudText;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Native scroll handler: Caches bounds to prevent layout thrashing
  useEffect(() => {
    const updateMetrics = () => {
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

    updateMetrics();

    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const { containerTop, totalScrollable } = scrollMetricsRef.current;
      const progress = clamp((scrollTop - containerTop) / totalScrollable, 0, 1);
      targetProgressRef.current = progress;
    };

    handleScroll();
    currentProgressRef.current = targetProgressRef.current;

    const handleResize = () => {
      updateMetrics();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      id="location"
      ref={containerRef}
      className="relative w-full bg-[#111315] text-[#FAF9F6] border-t border-[#242526] select-none"
      aria-label="Ameer Heights Tower 10 Geographic Location Experience"
    >
      {/* ======================================================================= */}
      {/* PART 1: CINEMATIC SCROLL-LINKED LOCATION VOYAGE                        */}
      {/* 360vh Scroll Track with 100vh Sticky Viewport Window                    */}
      {/* ======================================================================= */}
      <div className="relative w-full h-[360vh]">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#111315]">
          {/* Subtle Ambient Radial Illuminations */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(181, 154, 106, 0.12) 0%, rgba(181, 154, 106, 0.03) 45%, transparent 70%)',
              }}
            />
            {/* Fine architectural grid background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#B59A6A15_1px,transparent_1px),linear-gradient(to_bottom,#B59A6A15_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          {/* ======================================================================= */}
          {/* ARCHITECTURAL VECTOR MAP CANVAS                                         */}
          {/* Minimal dark cartographic visualization with smooth camera transform    */}
          {/* ======================================================================= */}
          <svg
            ref={svgMapRef}
            viewBox="0 0 1000 800"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-300"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              {/* Subtle road glow filter */}
              <radialGradient id="centerGlow" cx="50%" cy="44%" r="35%">
                <stop offset="0%" stopColor="#B59A6A" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#B59A6A" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#111315" stopOpacity="0" />
              </radialGradient>

              {/* Marker Pulse Animation Gradient */}
              <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#B59A6A" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#B59A6A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#B59A6A" stopOpacity="0" />
              </radialGradient>

              {/* River Chenab gradient */}
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1C2126" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#151A1E" stopOpacity="0.4" />
              </linearGradient>

              {/* Route Dash Pattern */}
              <linearGradient id="routeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B59A6A" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#CBB488" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Central Ambient Glow around BZU Chowk */}
            <rect width="1000" height="800" fill="url(#centerGlow)" />

            {/* Camera Scaled & Panned Group */}
            <g
              ref={mapGroupRef}
              style={{
                transformOrigin: '500px 440px',
                willChange: 'transform',
              }}
            >
              {/* =================================================== */}
              {/* 1. River Chenab Curve (Western boundary)            */}
              {/* =================================================== */}
              <path
                d="M 120 0 Q 180 200, 140 380 T 210 650 Q 240 730, 220 800 L 80 800 L 0 800 L 0 0 Z"
                fill="url(#riverGradient)"
                opacity="0.45"
              />
              <path
                d="M 120 0 Q 180 200, 140 380 T 210 650 Q 240 730, 220 800"
                fill="none"
                stroke="#242C33"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                opacity="0.4"
              />
              <text
                x="150"
                y="320"
                transform="rotate(68, 150, 320)"
                fill="#4D555E"
                fontSize="8"
                fontFamily="Space Grotesk, monospace"
                letterSpacing="0.35em"
                opacity="0.6"
              >
                CHENAB RIVER CORRIDOR
              </text>

              {/* =================================================== */}
              {/* 2. Secondary Urban Road Network & Grid Blocks       */}
              {/* =================================================== */}
              <g stroke="#1D2124" strokeWidth="0.8" opacity="0.65" fill="none">
                {/* East-West Cross streets */}
                <line x1="260" y1="200" x2="780" y2="210" />
                <line x1="280" y1="280" x2="820" y2="295" />
                <line x1="250" y1="360" x2="840" y2="370" />
                <line x1="240" y1="440" x2="860" y2="440" />
                <line x1="260" y1="520" x2="880" y2="515" />
                <line x1="280" y1="600" x2="860" y2="590" />
                <line x1="290" y1="680" x2="820" y2="670" />

                {/* Diagonal & Secondary connections */}
                <line x1="360" y1="120" x2="420" y2="760" />
                <line x1="620" y1="120" x2="680" y2="760" />
                <line x1="720" y1="180" x2="790" y2="680" />
                <line x1="240" y1="500" x2="760" y2="760" strokeDasharray="2 4" />
                <line x1="300" y1="260" x2="700" y2="580" strokeDasharray="3 5" />
              </g>

              {/* =================================================== */}
              {/* 3. Major Metropolitan Arterials                     */}
              {/* =================================================== */}
              {/* Northern Bypass (East-West ring connecting Bosan Rd) */}
              <path
                d="M 200 550 Q 360 540, 500 530 T 840 505"
                fill="none"
                stroke="#2F353B"
                strokeWidth="2.2"
                opacity="0.85"
              />
              <text
                x="660"
                y="515"
                fill="#6C727A"
                fontSize="7"
                fontFamily="Space Grotesk, monospace"
                letterSpacing="0.25em"
              >
                NORTHERN BYPASS
              </text>

              {/* Mattital Road / Jinnah Avenue extension to DHA */}
              <path
                d="M 500 440 L 515 230 L 530 100"
                fill="none"
                stroke="#2D3237"
                strokeWidth="1.8"
                opacity="0.75"
              />

              {/* Old Bahawalpur & Abdali Road toward Multan Cantt / Airport */}
              <path
                d="M 500 530 Q 420 620, 330 720"
                fill="none"
                stroke="#2F353B"
                strokeWidth="2.0"
                opacity="0.85"
              />

              {/* =================================================== */}
              {/* 4. THE PRIMARY SPINE: BOSAN ROAD                    */}
              {/* Elegant warm bronze spine passing through BZU Chowk */}
              {/* =================================================== */}
              <path
                d="M 480 800 L 490 640 L 495 530 L 500 440 L 510 320 L 520 180 L 525 80"
                fill="none"
                stroke="#B59A6A"
                strokeWidth="3.2"
                opacity="0.88"
                strokeLinecap="round"
              />
              <path
                d="M 480 800 L 490 640 L 495 530 L 500 440 L 510 320 L 520 180 L 525 80"
                fill="none"
                stroke="#F3F0E9"
                strokeWidth="0.8"
                opacity="0.45"
                strokeDasharray="4 4"
              />
              <text
                x="526"
                y="350"
                transform="rotate(-84, 526, 350)"
                fill="#B59A6A"
                fontSize="7.5"
                fontFamily="Space Grotesk, monospace"
                letterSpacing="0.3em"
                fontWeight="500"
              >
                BOSAN ROAD ARTERIAL
              </text>

              {/* =================================================== */}
              {/* 5. Destination Nodes: DHA Multan & Airport          */}
              {/* =================================================== */}
              {/* DHA Multan Node (North) */}
              <g transform={`translate(${MAP_COORDS.dhaMultan.x}, ${MAP_COORDS.dhaMultan.y})`}>
                <circle r="4" fill="#24292E" stroke="#8C8C87" strokeWidth="1" />
                <circle r="1.5" fill="#FAF9F6" />
                <text
                  x="12"
                  y="3"
                  fill="#D8D3CA"
                  fontSize="7.5"
                  fontFamily="Space Grotesk, monospace"
                  letterSpacing="0.2em"
                  fontWeight="500"
                >
                  DHA MULTAN
                </text>
              </g>

              {/* Multan International Airport Node (Southwest) */}
              <g transform={`translate(${MAP_COORDS.airport.x}, ${MAP_COORDS.airport.y})`}>
                <circle r="4" fill="#24292E" stroke="#8C8C87" strokeWidth="1" />
                <circle r="1.5" fill="#FAF9F6" />
                <text
                  x="-12"
                  y="3"
                  textAnchor="end"
                  fill="#D8D3CA"
                  fontSize="7.5"
                  fontFamily="Space Grotesk, monospace"
                  letterSpacing="0.2em"
                  fontWeight="500"
                >
                  MULTAN INT'L AIRPORT
                </text>
              </g>

              {/* BZU Campus Entrance Context (Immediate north of chowk) */}
              <g transform="translate(520, 420)">
                <text
                  x="8"
                  y="0"
                  fill="#6C727A"
                  fontSize="6.5"
                  fontFamily="Space Grotesk, monospace"
                  letterSpacing="0.2em"
                >
                  BZU MAIN CAMPUS GATE
                </text>
              </g>

              {/* =================================================== */}
              {/* 6. Animated Proximity Route Vectors (Subtle lines)  */}
              {/* =================================================== */}
              {/* Route: Ameer Heights -> DHA Multan (North) */}
              <path
                ref={routeDhaRef}
                d="M 500 440 L 507 330 L 515 230"
                fill="none"
                stroke="url(#routeGold)"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0"
              />

              {/* Route: Ameer Heights -> Airport (Southwest) */}
              <path
                ref={routeAirportRef}
                d="M 500 440 L 495 530 Q 425 615, 330 720"
                fill="none"
                stroke="url(#routeGold)"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0"
              />

              {/* =================================================== */}
              {/* 7. CUSTOM ARCHITECTURAL PROJECT LOCATION MARKER     */}
              {/* At exact coordinates: Main BZU Chowk                */}
              {/* =================================================== */}
              <g transform={`translate(${MAP_COORDS.ameerHeights.x}, ${MAP_COORDS.ameerHeights.y})`}>
                {/* Slow, restrained expanding radial pulse */}
                <circle
                  ref={markerPulseRef}
                  r="24"
                  fill="url(#pulseGlow)"
                  className="animate-ping"
                  style={{ animationDuration: '4s' }}
                  opacity="0"
                />

                {/* Concentric precision target circles */}
                <circle r="12" fill="none" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
                <circle r="7" fill="none" stroke="#B59A6A" strokeWidth="0.8" opacity="0.8" />

                {/* Primary Luminous Center Dot */}
                <circle
                  ref={markerDotRef}
                  r="3.2"
                  fill="#FAF9F6"
                  stroke="#B59A6A"
                  strokeWidth="1.2"
                  opacity="0"
                />

                {/* Refined Luxury Architectural Signature Label */}
                <g transform="translate(18, -4)">
                  <text
                    ref={markerLabelRef}
                    x="0"
                    y="0"
                    fill="#FAF9F6"
                    fontSize="9.5"
                    fontFamily="Cormorant Garamond, serif"
                    letterSpacing="0.14em"
                    fontWeight="500"
                    opacity="0"
                  >
                    AMEER HEIGHTS
                  </text>
                  <text
                    ref={markerSubLabelRef}
                    x="0"
                    y="10"
                    fill="#B59A6A"
                    fontSize="7"
                    fontFamily="Space Grotesk, monospace"
                    letterSpacing="0.28em"
                    fontWeight="500"
                    opacity="0"
                  >
                    TOWER 10 · MAIN BZU CHOWK
                  </text>
                </g>
              </g>
            </g>
          </svg>

          {/* ======================================================================= */}
          {/* CINEMATIC EDITORIAL FLOATING TYPOGRAPHY OVERLAYS                        */}
          {/* Zero boxed cards, zero glassmorphism, background remains dominant        */}
          {/* ======================================================================= */}

          {/* Precision Top Reticles & HUD */}
          <div
            className="absolute top-28 left-6 md:left-16 hidden sm:flex items-center gap-3 font-mono text-[9px] text-[#8C8C87] tracking-[0.25em] z-20 pointer-events-none"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            <div className="w-2.5 h-2.5 border-t border-l border-[#B59A6A]/60" />
            <span>08 / GEOGRAPHIC POSITIONING</span>
          </div>

          <div
            ref={telemetryHudRef}
            className="absolute top-28 right-6 md:right-16 hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#B59A6A] tracking-[0.25em] z-20 pointer-events-none"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
          >
            CITY METROPOLIS CONTEXT · WIDE
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 1: OPENING STATEMENT (Wide City Context)                       */}
          {/* ------------------------------------------------------------------- */}
          <div
            ref={stage1TextRef}
            className="absolute left-6 sm:left-12 md:left-20 lg:left-24 bottom-14 sm:bottom-20 md:bottom-24 max-w-xl md:max-w-2xl z-20 flex flex-col items-start select-none will-change-[transform,opacity]"
          >
            <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
              <span>THE LOCATION</span>
            </div>

            <h2
              className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
              style={{ textShadow: '0 2px 28px rgba(0,0,0,0.95), 0 1px 6px rgba(0,0,0,0.9)' }}
            >
              CONNECTED TO
              <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                THE CITY.
              </span>
            </h2>

            <p
              className="font-mono text-[11px] sm:text-xs md:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
              style={{ textShadow: '0 2px 18px rgba(0,0,0,0.95)' }}
            >
              Positioned on Bosan Road, at Main BZU Chowk, Multan.
            </p>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 2: SEQUENTIAL LOCATION PHRASES REVEAL                          */}
          {/* "MAIN BZU CHOWK" -> "BOSAN ROAD" -> "MULTAN"                         */}
          {/* ------------------------------------------------------------------- */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            {/* Phrase 1: MULTAN */}
            <div
              ref={stage2MultanRef}
              className="absolute top-1/3 left-8 sm:left-16 md:left-24 opacity-0 flex flex-col will-change-[transform,opacity]"
            >
              <span className="font-mono text-[9px] sm:text-[10px] text-[#8C8C87] tracking-[0.3em] uppercase mb-1">
                METROPOLITAN REGION
              </span>
              <span
                className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#FAF9F6] uppercase tracking-[0.1em]"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.95)' }}
              >
                MULTAN
              </span>
            </div>

            {/* Phrase 2: BOSAN ROAD */}
            <div
              ref={stage2BosanRef}
              className="absolute bottom-1/3 right-8 sm:right-16 md:right-28 text-right opacity-0 flex flex-col items-end will-change-[transform,opacity]"
            >
              <span className="font-mono text-[9px] sm:text-[10px] text-[#B59A6A] tracking-[0.3em] uppercase mb-1">
                PRIMARY ARTERIAL SPINE
              </span>
              <span
                className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#FAF9F6] uppercase tracking-[0.1em]"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.95)' }}
              >
                BOSAN ROAD
              </span>
            </div>

            {/* Phrase 3: MAIN BZU CHOWK */}
            <div
              ref={stage2ChowkRef}
              className="absolute bottom-16 sm:bottom-20 left-6 sm:left-16 md:left-24 opacity-0 flex flex-col will-change-[transform,opacity]"
            >
              <span className="font-mono text-[9px] sm:text-[10px] text-[#B59A6A] tracking-[0.3em] uppercase mb-1">
                EXACT JUNCTION & ADDRESS
              </span>
              <span
                className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#FAF9F6] uppercase tracking-[0.08em]"
                style={{ textShadow: '0 2px 24px rgba(0,0,0,0.95)' }}
              >
                MAIN BZU CHOWK
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[#8C8C87] tracking-[0.25em] uppercase mt-2">
                A STRATEGIC COMMERCIAL PRECINCT
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 3: DISTANCE PRESENTATION & PROXIMITY                           */}
          {/* Large numbers, asymmetrical placement, no cards                      */}
          {/* ------------------------------------------------------------------- */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Proximity 1: DHA Multan (Top Right / North) */}
            <div
              ref={distanceDhaRef}
              className="absolute top-28 sm:top-36 right-6 sm:right-12 md:right-20 lg:right-28 text-right opacity-0 flex flex-col items-end will-change-[transform,opacity]"
            >
              <div className="flex items-baseline gap-1">
                <span
                  className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#FAF9F6] tracking-tight leading-none"
                  style={{ textShadow: '0 2px 28px rgba(0,0,0,0.95)' }}
                >
                  2.7
                </span>
                <span className="font-mono text-sm sm:text-base md:text-lg text-[#B59A6A] font-light">
                  KM*
                </span>
              </div>
              <span
                className="font-serif text-base sm:text-xl md:text-2xl text-[#D8D3CA] uppercase tracking-[0.1em] mt-1"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
              >
                DHA Multan
              </span>
              <span className="font-mono text-[9px] text-[#8C8C87] tracking-[0.2em] uppercase mt-0.5">
                NORTHERN ACCESS VIA BOSAN CORRIDOR
              </span>
            </div>

            {/* Proximity 2: Multan International Airport (Bottom Left / Southwest) */}
            <div
              ref={distanceAirportRef}
              className="absolute bottom-16 sm:bottom-24 left-6 sm:left-12 md:left-20 lg:left-24 text-left opacity-0 flex flex-col items-start will-change-[transform,opacity]"
            >
              <div className="flex items-baseline gap-1">
                <span
                  className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#FAF9F6] tracking-tight leading-none"
                  style={{ textShadow: '0 2px 28px rgba(0,0,0,0.95)' }}
                >
                  11
                </span>
                <span className="font-mono text-sm sm:text-base md:text-lg text-[#B59A6A] font-light">
                  KM*
                </span>
              </div>
              <span
                className="font-serif text-base sm:text-xl md:text-2xl text-[#D8D3CA] uppercase tracking-[0.1em] mt-1"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
              >
                Multan International Airport
              </span>
              <span className="font-mono text-[9px] text-[#8C8C87] tracking-[0.2em] uppercase mt-0.5">
                DIRECT ARTERIAL TRANSIT LINK
              </span>
            </div>

            {/* Commercial Location Message (Bottom Center / Right) */}
            <div
              ref={commercialStatementRef}
              className="absolute bottom-12 right-6 sm:right-16 md:right-24 text-right opacity-0 flex flex-col items-end will-change-[transform,opacity]"
            >
              <span
                className="font-serif text-lg sm:text-2xl md:text-3xl text-[#FAF9F6] uppercase tracking-[0.08em]"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.95)' }}
              >
                IN THE HEART OF A GROWING ADDRESS.
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#B59A6A] tracking-[0.25em] uppercase mt-1">
                Main BZU Chowk • Bosan Road • Multan
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-[#8C8C87]/75 tracking-widest mt-2">
                *Approximate distance
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 4: CINEMATIC ARCHITECTURAL BUILDING REVEAL                    */}
          {/* "CITY -> LOCATION -> ADDRESS -> BUILDING"                           */}
          {/* ------------------------------------------------------------------- */}
          <div
            ref={buildingRevealRef}
            className="absolute inset-0 flex items-center justify-center z-25 opacity-0 pointer-events-none will-change-[transform,opacity]"
          >
            {/* Architectural Building Visual Imagery */}
            <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center p-6 md:p-12">
              <div className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] overflow-hidden border border-[#B59A6A]/30 shadow-2xl bg-[#111315]">
                <img
                  src="/assets/construction_frames/frame_30.webp"
                  alt="Ameer Heights Tower 10 Monolithic Architecture"
                  className="w-full h-full object-cover brightness-95 contrast-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-[#111315]/40 pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#111315]/20 to-[#111315]/70 pointer-events-none" />
              </div>

              {/* Minimal floating building text */}
              <div className="absolute bottom-12 sm:bottom-16 left-8 sm:left-16 md:left-24 text-left select-none">
                <span className="font-mono text-[10px] sm:text-[11px] text-[#B59A6A] tracking-[0.3em] uppercase block mb-1">
                  THE DESTINATION
                </span>
                <h3
                  className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#FAF9F6] uppercase tracking-[0.06em] leading-tight"
                  style={{ textShadow: '0 2px 28px rgba(0,0,0,0.95)' }}
                >
                  AMEER HEIGHTS
                  <span className="block font-serif italic text-[#CBB488] font-normal tracking-[0.04em]">
                    TOWER 10
                  </span>
                </h3>
                <p
                  className="font-mono text-[10px] sm:text-xs text-[#D8D3CA] tracking-[0.25em] uppercase font-light mt-3"
                  style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                >
                  MAIN BZU CHOWK · BOSAN ROAD · MULTAN
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Hairline Progress Tracker */}
          <div className="hidden md:flex flex-col items-center gap-2 absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <span className="font-mono text-[8px] text-[#8C8C87] tracking-[0.2em] -rotate-90">
              LOCATION
            </span>
            <div className="w-[1px] h-20 bg-white/10 relative overflow-hidden my-2">
              <div
                ref={progressBarRef}
                className="w-full bg-[#B59A6A] h-full origin-top"
                style={{ transform: 'scaleY(0)', willChange: 'transform' }}
              />
            </div>
            <span className="font-mono text-[9px] text-[#B59A6A] tracking-widest">
              08
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* PART 2: PRACTICAL MAP & GEOGRAPHIC PRECISION                            */}
      {/* Interactive, visually quiet, allowing visitors to inspect coordinates   */}
      {/* and get verified turn-by-turn directions                                */}
      {/* ======================================================================= */}
      <div className="relative z-30 bg-[#141719] py-24 md:py-32 px-6 md:px-16 border-t border-[#242526]">
        <div className="max-w-7xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#242526] pb-8 mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-[#B59A6A] font-medium tracking-[0.25em] uppercase">
                  PRACTICAL LOCATION GUIDE
                </span>
                <span className="w-8 h-[1px] bg-[#B59A6A]" />
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light uppercase tracking-wide text-[#FAF9F6]">
                Visit Ameer Heights Tower 10
              </h3>
              <p className="font-mono text-xs sm:text-sm text-[#8C8C87] tracking-[0.15em] uppercase mt-2">
                Main BZU Chowk, Bosan Road, Multan · Commercial Area
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCoordinates}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] sm:text-xs font-mono tracking-[0.18em] uppercase border border-[#2D3033] hover:border-[#B59A6A] text-[#D8D3CA] hover:text-[#FAF9F6] bg-[#111315] transition-colors cursor-pointer"
                title="Copy coordinates to clipboard"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B59A6A]" />
                    <span className="text-[#B59A6A]">COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C8C87]" />
                    <span>{PROJECT_COORDINATES.formatted}</span>
                  </>
                )}
              </button>

              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] sm:text-xs font-mono tracking-[0.20em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] hover:text-[#111315] transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Interactive Precision Map Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Architectural Cartography Viewport */}
            <div className="lg:col-span-8 bg-[#111315] border border-[#242526] relative overflow-hidden min-h-[460px] md:min-h-[520px] flex flex-col justify-between">
              {/* Interactive Vector Map Surface with Pan/Zoom */}
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <svg
                  viewBox="0 0 800 600"
                  className="w-full h-full object-cover transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate(${practicalPan.x}px, ${practicalPan.y}px) scale(${practicalZoom})`,
                    transformOrigin: '400px 300px',
                  }}
                >
                  {/* Blueprint Grid */}
                  <defs>
                    <pattern id="practicalGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#242526" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="800" height="600" fill="#111315" />
                  <rect width="800" height="600" fill="url(#practicalGrid)" opacity="0.6" />

                  {/* Bosan Road Corridor */}
                  <path
                    d="M 400 0 L 400 600"
                    stroke="#B59A6A"
                    strokeWidth="5"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M 400 0 L 400 600"
                    stroke="#F3F0E9"
                    strokeWidth="1"
                    strokeDasharray="6 6"
                    strokeOpacity="0.4"
                  />

                  {/* Main BZU Chowk Junction Crossroad */}
                  <path
                    d="M 150 300 L 650 300"
                    stroke="#2A3035"
                    strokeWidth="3.5"
                  />

                  {/* Surrounding Commercial Blocks */}
                  <rect x="260" y="160" width="110" height="100" fill="#181B1D" stroke="#24282B" strokeWidth="0.8" />
                  <rect x="430" y="160" width="130" height="100" fill="#181B1D" stroke="#24282B" strokeWidth="0.8" />
                  <rect x="240" y="330" width="130" height="110" fill="#181B1D" stroke="#24282B" strokeWidth="0.8" />
                  <rect x="430" y="330" width="120" height="110" fill="#181B1D" stroke="#24282B" strokeWidth="0.8" />

                  {/* Contextual Labels */}
                  <text x="415" y="100" fill="#B59A6A" fontSize="9" fontFamily="Space Grotesk, monospace" letterSpacing="0.25em">
                    BOSAN ROAD (TO DHA MULTAN · 2.7 KM*)
                  </text>
                  <text x="415" y="550" fill="#8C8C87" fontSize="9" fontFamily="Space Grotesk, monospace" letterSpacing="0.25em">
                    BOSAN ROAD (TO AIRPORT · 11 KM*)
                  </text>
                  <text x="180" y="290" fill="#6C727A" fontSize="8" fontFamily="Space Grotesk, monospace" letterSpacing="0.2em">
                    BZU CAMPUS ACCESS
                  </text>
                  <text x="480" y="290" fill="#6C727A" fontSize="8" fontFamily="Space Grotesk, monospace" letterSpacing="0.2em">
                    COMMERCIAL HUB
                  </text>

                  {/* Project Location Pin */}
                  <g transform="translate(400, 300)">
                    <circle r="22" fill="#B59A6A" fillOpacity="0.15" />
                    <circle r="12" fill="#B59A6A" fillOpacity="0.3" />
                    <circle r="5" fill="#FAF9F6" stroke="#B59A6A" strokeWidth="2" />

                    {/* Architectural Flag Marker */}
                    <path d="M 0 -5 L 0 -32" stroke="#B59A6A" strokeWidth="1.5" />
                    <rect x="2" y="-32" width="118" height="24" fill="#181B1D" stroke="#B59A6A" strokeWidth="0.8" />
                    <text x="8" y="-20" fill="#FAF9F6" fontSize="7.5" fontFamily="Cormorant Garamond, serif" letterSpacing="0.15em" fontWeight="bold">
                      AMEER HEIGHTS TOWER 10
                    </text>
                    <text x="8" y="-11" fill="#B59A6A" fontSize="5.5" fontFamily="Space Grotesk, monospace" letterSpacing="0.18em">
                      MAIN BZU CHOWK
                    </text>
                  </g>
                </svg>
              </div>

              {/* Viewport Overlay Controls */}
              <div className="relative z-10 flex items-center justify-between p-4 md:p-6 pointer-events-none">
                <div className="flex items-center gap-2 bg-[#111315]/90 border border-[#242526] px-3 py-1.5 font-mono text-[9px] text-[#8C8C87] tracking-widest pointer-events-auto">
                  <Compass className="w-3.5 h-3.5 text-[#B59A6A]" />
                  <span>30.2715185° N, 71.4948905° E</span>
                </div>

                {/* Zoom & Pan Controls */}
                <div className="flex items-center gap-1.5 bg-[#111315]/90 border border-[#242526] p-1 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setPracticalZoom((z) => Math.min(z + 0.3, 2.5))}
                    className="w-7 h-7 flex items-center justify-center text-[#D8D3CA] hover:text-[#FAF9F6] hover:bg-[#1E2124] transition-colors cursor-pointer"
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticalZoom((z) => Math.max(z - 0.3, 0.7))}
                    className="w-7 h-7 flex items-center justify-center text-[#D8D3CA] hover:text-[#FAF9F6] hover:bg-[#1E2124] transition-colors cursor-pointer"
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPracticalZoom(1);
                      setPracticalPan({ x: 0, y: 0 });
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#D8D3CA] hover:text-[#FAF9F6] hover:bg-[#1E2124] transition-colors cursor-pointer"
                    title="Reset map view"
                    aria-label="Reset map view"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bottom Interactive Help Bar */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 bg-[#111315]/95 border-t border-[#242526] text-xs font-mono text-[#8C8C87] gap-3">
                <span className="text-[10px] tracking-wider text-[#8C8C87]">
                  Drag to pan · Scroll or use +/- to adjust view
                </span>
                <a
                  href={GOOGLE_MAPS_SEARCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#B59A6A] hover:text-[#FAF9F6] flex items-center gap-1.5 transition-colors uppercase tracking-[0.2em]"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Strategic Location Specifications Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between p-8 md:p-10 bg-[#111315] border border-[#242526]">
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] text-[#B59A6A] uppercase tracking-[0.3em] block mb-2">
                    Verified Location Specifications
                  </span>
                  <h4 className="font-serif text-2xl text-[#FAF9F6] uppercase tracking-wide">
                    Main BZU Chowk
                  </h4>
                  <p className="font-mono text-xs text-[#8C8C87] uppercase tracking-widest mt-1">
                    Bosan Road, Multan, Punjab
                  </p>
                </div>

                <div className="w-10 h-[1px] bg-[#B59A6A]" />

                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-widest block">
                      ZONING & CHARACTER
                    </span>
                    <p className="text-sm text-[#D8D3CA] font-light mt-0.5">
                      Commercial Area · High-Visibility Mixed-Use Artery
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-widest block">
                      CONFIRMED PROJECT DISTANCES
                    </span>
                    <ul className="mt-2 space-y-2 font-mono text-xs text-[#D8D3CA]">
                      <li className="flex items-center justify-between py-1 border-b border-[#242526]">
                        <span>DHA Multan</span>
                        <span className="text-[#B59A6A] font-semibold">2.7 KM*</span>
                      </li>
                      <li className="flex items-center justify-between py-1 border-b border-[#242526]">
                        <span>Multan Int'l Airport</span>
                        <span className="text-[#B59A6A] font-semibold">11 KM*</span>
                      </li>
                    </ul>
                    <span className="font-mono text-[8px] text-[#8C8C87]/70 tracking-widest mt-1.5 block">
                      *Approximate distance provided by project documentation.
                    </span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-widest block">
                      PROJECT COORDINATES
                    </span>
                    <p className="font-mono text-xs text-[#FAF9F6] tracking-wider mt-0.5">
                      {PROJECT_COORDINATES.lat}, {PROJECT_COORDINATES.lng}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#242526] space-y-3">
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-mono uppercase tracking-[0.2em] text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Driving Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <p className="font-mono text-[9px] text-[#8C8C87]/60 leading-relaxed text-center">
                  Coordinates lock to the exact entrance portal of Ameer Heights Tower 10.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

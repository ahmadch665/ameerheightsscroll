import React, { useRef, useEffect, useState } from 'react';
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

/**
 * Smoothstep interpolation function for smooth acceleration and deceleration
 */
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Camera Waypoints across the 7 Controlled Cinematic States
 */
interface CameraWaypoint {
  progress: number;
  scale: number;
  panX: number;
  panY: number;
}

const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  { progress: 0.00, scale: 1.00, panX: 0, panY: 0 },       // State 1: Wide City View
  { progress: 0.15, scale: 1.00, panX: 0, panY: 0 },       // State 1 Hold
  { progress: 0.23, scale: 2.10, panX: -180, panY: -70 },  // State 2: Approach BZU Chowk
  { progress: 0.31, scale: 2.10, panX: -180, panY: -70 },  // State 2 Hold
  { progress: 0.39, scale: 2.35, panX: -190, panY: -60 },  // State 3: Bosan Road corridor
  { progress: 0.46, scale: 2.35, panX: -190, panY: -60 },  // State 3 Hold
  { progress: 0.53, scale: 2.00, panX: -140, panY: -50 },  // State 4: Multan Metropolis Node
  { progress: 0.60, scale: 2.00, panX: -140, panY: -50 },  // State 4 Hold
  { progress: 0.67, scale: 1.85, panX: -110, panY: 40 },   // State 5: North Corridor (DHA Multan)
  { progress: 0.74, scale: 1.85, panX: -110, panY: 40 },   // State 5 Hold
  { progress: 0.81, scale: 1.75, panX: 40, panY: -150 },   // State 6: Southwest Corridor (Airport)
  { progress: 0.87, scale: 1.75, panX: 40, panY: -150 },   // State 6 Hold
  { progress: 0.94, scale: 2.40, panX: -180, panY: -90 },  // State 7: Settle on Tower Facade
  { progress: 1.00, scale: 2.40, panX: -180, panY: -90 },  // State 7 Hold
];

/**
 * Interpolate camera state across waypoints using smoothstep easing
 */
function getCameraTransform(p: number) {
  if (p <= CAMERA_WAYPOINTS[0].progress) {
    const wp = CAMERA_WAYPOINTS[0];
    return { scale: wp.scale, panX: wp.panX, panY: wp.panY };
  }
  const lastIndex = CAMERA_WAYPOINTS.length - 1;
  if (p >= CAMERA_WAYPOINTS[lastIndex].progress) {
    const wp = CAMERA_WAYPOINTS[lastIndex];
    return { scale: wp.scale, panX: wp.panX, panY: wp.panY };
  }

  // Find surrounding waypoints
  for (let i = 0; i < lastIndex; i++) {
    const w1 = CAMERA_WAYPOINTS[i];
    const w2 = CAMERA_WAYPOINTS[i + 1];
    if (p >= w1.progress && p <= w2.progress) {
      const t = smoothstep(w1.progress, w2.progress, p);
      return {
        scale: lerp(w1.scale, w2.scale, t),
        panX: lerp(w1.panX, w2.panX, t),
        panY: lerp(w1.panY, w2.panY, t),
      };
    }
  }

  return { scale: 1.0, panX: 0, panY: 0 };
}

/**
 * Calculate deliberate, slow text state transition
 * Returns: { opacity, translateY, scale, isVisible }
 */
function getTextStateMetrics(
  p: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number
) {
  if (p < enterStart || p > exitEnd) {
    return { opacity: 0, translateY: 14, scale: 0.985, isVisible: false };
  }

  if (p >= enterStart && p < enterEnd) {
    // Deliberate entering transition
    const t = smoothstep(enterStart, enterEnd, p);
    return {
      opacity: t,
      translateY: lerp(14, 0, t),
      scale: lerp(0.985, 1.0, t),
      isVisible: true,
    };
  }

  if (p >= enterEnd && p <= exitStart) {
    // Settled, stable, fully readable state
    return {
      opacity: 1.0,
      translateY: 0,
      scale: 1.0,
      isVisible: true,
    };
  }

  if (p > exitStart && p <= exitEnd) {
    // Gentle exit with slight upward glide
    const t = smoothstep(exitStart, exitEnd, p);
    return {
      opacity: 1.0 - t,
      translateY: lerp(0, -10, t),
      scale: lerp(1.0, 1.01, t),
      isVisible: true,
    };
  }

  return { opacity: 0, translateY: 0, scale: 1, isVisible: false };
}

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

  // DOM direct-manipulation refs for GPU-composited 60fps updates
  const svgMapRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);

  // 7 Controlled Text State Containers
  const state1Ref = useRef<HTMLDivElement>(null);
  const state2Ref = useRef<HTMLDivElement>(null);
  const state3Ref = useRef<HTMLDivElement>(null);
  const state4Ref = useRef<HTMLDivElement>(null);
  const state5Ref = useRef<HTMLDivElement>(null);
  const state6Ref = useRef<HTMLDivElement>(null);
  const state7Ref = useRef<HTMLDivElement>(null);

  // Marker and Route vector refs
  const markerPulseRef = useRef<SVGCircleElement>(null);
  const markerDotRef = useRef<SVGCircleElement>(null);
  const markerLabelRef = useRef<SVGTextElement>(null);
  const markerSubLabelRef = useRef<SVGTextElement>(null);
  const routeDhaRef = useRef<SVGPathElement>(null);
  const routeAirportRef = useRef<SVGPathElement>(null);

  // Building Reveal & HUD
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

  // 60 FPS Render loop with smooth interpolation
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
        // Fallback
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

      // Smooth, responsive interpolation:
      // Snaps cleanly when within micro-tolerance to prevent perpetual calculations
      let p: number;
      if (Math.abs(delta) < 0.00008) {
        p = target;
      } else {
        // Damping factor of 0.16 provides immediate response to scroll input
        // while eliminating micro-stutters during slow 10-30% scrolls
        p = current + delta * 0.16;
      }
      currentProgressRef.current = p;

      // Update vertical progress indicator
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleY(${p})`;
      }

      // =======================================================================
      // CAMERA INTERPOLATION ACROSS WAYPOINTS
      // =======================================================================
      const camera = getCameraTransform(p);

      // Map fade out during State 7 (Building Transition: 0.88 -> 0.96)
      let mapOpacity = 1.0;
      if (p >= 0.88) {
        const t = smoothstep(0.88, 0.96, p);
        mapOpacity = 1.0 - t;
      }

      if (mapGroupRef.current) {
        mapGroupRef.current.setAttribute(
          'transform',
          `translate(${camera.panX.toFixed(2)}, ${camera.panY.toFixed(2)}) scale(${camera.scale.toFixed(3)})`
        );
      }
      if (svgMapRef.current) {
        svgMapRef.current.style.opacity = `${mapOpacity.toFixed(3)}`;
      }

      // =======================================================================
      // 7 CONTROLLED TEXT STATES (Deliberate Screen Time & Clean Crossfades)
      // =======================================================================
      const applyTextState = (
        el: HTMLDivElement | null,
        metrics: { opacity: number; translateY: number; scale: number; isVisible: boolean }
      ) => {
        if (!el) return;
        if (!metrics.isVisible) {
          if (el.style.opacity !== '0') {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
          return;
        }
        el.style.opacity = `${metrics.opacity.toFixed(3)}`;
        el.style.transform = `translate3d(0, ${metrics.translateY.toFixed(1)}px, 0) scale(${metrics.scale.toFixed(3)})`;
        el.style.pointerEvents = metrics.opacity > 0.6 ? 'auto' : 'none';
      };

      // State 1: "CONNECTED TO THE CITY." (Wide City Context)
      // Progress: 0.00 -> 0.16
      const s1 = getTextStateMetrics(p, 0.00, 0.03, 0.12, 0.16);
      applyTextState(state1Ref.current, s1);

      // State 2: "MAIN BZU CHOWK" (Camera Approaches Junction)
      // Progress: 0.17 -> 0.31
      const s2 = getTextStateMetrics(p, 0.17, 0.20, 0.28, 0.31);
      applyTextState(state2Ref.current, s2);

      // State 3: "BOSAN ROAD" (Primary Arterial Spine Focus)
      // Progress: 0.33 -> 0.46
      const s3 = getTextStateMetrics(p, 0.33, 0.36, 0.43, 0.46);
      applyTextState(state3Ref.current, s3);

      // State 4: "MULTAN" (Metropolitan Prominence & Marker Focus)
      // Progress: 0.48 -> 0.60
      const s4 = getTextStateMetrics(p, 0.48, 0.51, 0.57, 0.60);
      applyTextState(state4Ref.current, s4);

      // State 5: "2.7 KM* DHA MULTAN" (North Route Focus)
      // Progress: 0.62 -> 0.74
      const s5 = getTextStateMetrics(p, 0.62, 0.65, 0.71, 0.74);
      applyTextState(state5Ref.current, s5);

      // State 6: "11 KM* MULTAN INTERNATIONAL AIRPORT" (Southwest Route Focus)
      // Progress: 0.76 -> 0.87
      const s6 = getTextStateMetrics(p, 0.76, 0.79, 0.85, 0.87);
      applyTextState(state6Ref.current, s6);

      // State 7: "AMEER HEIGHTS TOWER 10" (Architectural Building Transition)
      // Progress: 0.89 -> 0.99
      const s7 = getTextStateMetrics(p, 0.89, 0.92, 0.98, 1.00);
      applyTextState(state7Ref.current, s7);

      // =======================================================================
      // ARCHITECTURAL MARKER & ROUTE ANIMATIONS
      // =======================================================================
      // Marker emerges as camera approaches Bosan Road (p >= 0.20)
      if (markerDotRef.current && markerPulseRef.current) {
        const markerAlpha = clamp((p - 0.20) / 0.10, 0, 1) * mapOpacity;
        markerDotRef.current.setAttribute('opacity', `${markerAlpha.toFixed(2)}`);
        markerPulseRef.current.setAttribute('opacity', `${(markerAlpha * 0.45).toFixed(2)}`);

        if (markerLabelRef.current && markerSubLabelRef.current) {
          const labelAlpha = clamp((p - 0.26) / 0.08, 0, 1) * mapOpacity;
          markerLabelRef.current.setAttribute('opacity', `${labelAlpha.toFixed(2)}`);
          markerSubLabelRef.current.setAttribute('opacity', `${(labelAlpha * 0.85).toFixed(2)}`);
        }
      }

      // Draw DHA Route (Synchronized with State 5: 0.62 -> 0.74)
      if (routeDhaRef.current) {
        if (p < 0.61) {
          routeDhaRef.current.style.strokeDashoffset = `${dhaPathLength}`;
          routeDhaRef.current.setAttribute('opacity', '0');
        } else if (p <= 0.74) {
          const t = clamp((p - 0.61) / 0.08, 0, 1);
          routeDhaRef.current.style.strokeDashoffset = `${lerp(dhaPathLength, 0, t).toFixed(1)}`;
          routeDhaRef.current.setAttribute('opacity', `${(mapOpacity * 0.85).toFixed(2)}`);
        } else {
          const fadeOut = clamp(1 - (p - 0.74) / 0.04, 0, 1);
          routeDhaRef.current.setAttribute('opacity', `${(fadeOut * 0.85).toFixed(2)}`);
        }
      }

      // Draw Airport Route (Synchronized with State 6: 0.76 -> 0.87)
      if (routeAirportRef.current) {
        if (p < 0.75) {
          routeAirportRef.current.style.strokeDashoffset = `${airportPathLength}`;
          routeAirportRef.current.setAttribute('opacity', '0');
        } else if (p <= 0.87) {
          const t = clamp((p - 0.75) / 0.08, 0, 1);
          routeAirportRef.current.style.strokeDashoffset = `${lerp(airportPathLength, 0, t).toFixed(1)}`;
          routeAirportRef.current.setAttribute('opacity', `${(mapOpacity * 0.85).toFixed(2)}`);
        } else {
          const fadeOut = clamp(1 - (p - 0.87) / 0.04, 0, 1);
          routeAirportRef.current.setAttribute('opacity', `${(fadeOut * 0.85).toFixed(2)}`);
        }
      }

      // Building Reveal Imagery Fade-in (State 7: 0.89 -> 0.99)
      if (buildingRevealRef.current) {
        if (p < 0.88) {
          buildingRevealRef.current.style.opacity = '0';
          buildingRevealRef.current.style.pointerEvents = 'none';
        } else if (p <= 0.98) {
          const t = smoothstep(0.88, 0.94, p);
          buildingRevealRef.current.style.opacity = `${t.toFixed(3)}`;
          buildingRevealRef.current.style.transform = `translate3d(0, ${lerp(16, 0, t).toFixed(1)}px, 0) scale(${lerp(1.05, 1.0, t).toFixed(3)})`;
          buildingRevealRef.current.style.pointerEvents = t > 0.6 ? 'auto' : 'none';
        } else {
          const exitT = smoothstep(0.98, 1.0, p);
          buildingRevealRef.current.style.opacity = `${(1.0 - exitT).toFixed(3)}`;
          buildingRevealRef.current.style.transform = `translate3d(0, ${lerp(0, -12, exitT).toFixed(1)}px, 0) scale(1.0)`;
        }
      }

      // Telemetry HUD Context Indicator
      if (telemetryHudRef.current) {
        let hudText = '01 / CITY METROPOLIS CONTEXT';
        if (p >= 0.17 && p < 0.32) {
          hudText = '02 / APPROACHING MAIN BZU CHOWK';
        } else if (p >= 0.32 && p < 0.47) {
          hudText = '03 / BOSAN ROAD ARTERIAL SPINE';
        } else if (p >= 0.47 && p < 0.61) {
          hudText = '04 / MULTAN CIVIC INTERSECTION';
        } else if (p >= 0.61 && p < 0.75) {
          hudText = '05 / NORTH CORRIDOR · DHA MULTAN 2.7 KM*';
        } else if (p >= 0.75 && p < 0.88) {
          hudText = '06 / SOUTHWEST CORRIDOR · AIRPORT 11 KM*';
        } else if (p >= 0.88) {
          hudText = '07 / DESTINATION · AMEER HEIGHTS TOWER 10';
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
      {/* 460vh Scroll Track provides generous, slow screen time for all states   */}
      {/* ======================================================================= */}
      <div className="relative w-full h-[460vh]">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#111315]">
          {/* Subtle Ambient Radial Illuminations */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(181, 154, 106, 0.12) 0%, rgba(181, 154, 106, 0.03) 45%, transparent 70%)',
              }}
            />
            {/* Fine architectural grid background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#B59A6A15_1px,transparent_1px),linear-gradient(to_bottom,#B59A6A15_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          {/* ======================================================================= */}
          {/* ARCHITECTURAL VECTOR MAP CANVAS                                         */}
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
                <stop offset="0%" stopColor="#B59A6A" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#CBB488" stopOpacity="0.85" />
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
                <line x1="260" y1="200" x2="780" y2="210" />
                <line x1="280" y1="280" x2="820" y2="295" />
                <line x1="250" y1="360" x2="840" y2="370" />
                <line x1="240" y1="440" x2="860" y2="440" />
                <line x1="260" y1="520" x2="880" y2="515" />
                <line x1="280" y1="600" x2="860" y2="590" />
                <line x1="290" y1="680" x2="820" y2="670" />

                <line x1="360" y1="120" x2="420" y2="760" />
                <line x1="620" y1="120" x2="680" y2="760" />
                <line x1="720" y1="180" x2="790" y2="680" />
                <line x1="240" y1="500" x2="760" y2="760" strokeDasharray="2 4" />
                <line x1="300" y1="260" x2="700" y2="580" strokeDasharray="3 5" />
              </g>

              {/* =================================================== */}
              {/* 3. Major Metropolitan Arterials                     */}
              {/* =================================================== */}
              {/* Northern Bypass */}
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

              {/* Old Bahawalpur & Abdali Road toward Airport */}
              <path
                d="M 500 530 Q 420 620, 330 720"
                fill="none"
                stroke="#2F353B"
                strokeWidth="2.0"
                opacity="0.85"
              />

              {/* =================================================== */}
              {/* 4. THE PRIMARY SPINE: BOSAN ROAD                    */}
              {/* =================================================== */}
              <path
                d="M 480 800 L 490 640 L 495 530 L 500 440 L 510 320 L 520 180 L 525 80"
                fill="none"
                stroke="#B59A6A"
                strokeWidth="3.2"
                opacity="0.9"
                strokeLinecap="round"
              />
              <path
                d="M 480 800 L 490 640 L 495 530 L 500 440 L 510 320 L 520 180 L 525 80"
                fill="none"
                stroke="#F3F0E9"
                strokeWidth="0.8"
                opacity="0.5"
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

              {/* BZU Campus Entrance Context */}
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
              {/* 6. Animated Proximity Route Vectors                 */}
              {/* =================================================== */}
              {/* Route: Ameer Heights -> DHA Multan (North) */}
              <path
                ref={routeDhaRef}
                d="M 500 440 L 507 330 L 515 230"
                fill="none"
                stroke="url(#routeGold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0"
              />

              {/* Route: Ameer Heights -> Airport (Southwest) */}
              <path
                ref={routeAirportRef}
                d="M 500 440 L 495 530 Q 425 615, 330 720"
                fill="none"
                stroke="url(#routeGold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0"
              />

              {/* =================================================== */}
              {/* 7. CUSTOM ARCHITECTURAL PROJECT LOCATION MARKER     */}
              {/* =================================================== */}
              <g transform={`translate(${MAP_COORDS.ameerHeights.x}, ${MAP_COORDS.ameerHeights.y})`}>
                <circle
                  ref={markerPulseRef}
                  r="24"
                  fill="url(#pulseGlow)"
                  className="animate-ping"
                  style={{ animationDuration: '4s' }}
                  opacity="0"
                />
                <circle r="12" fill="none" stroke="#B59A6A" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
                <circle r="7" fill="none" stroke="#B59A6A" strokeWidth="0.8" opacity="0.8" />
                <circle
                  ref={markerDotRef}
                  r="3.2"
                  fill="#FAF9F6"
                  stroke="#B59A6A"
                  strokeWidth="1.2"
                  opacity="0"
                />
                <g transform="translate(18, -4)">
                  <text
                    ref={markerLabelRef}
                    x="0"
                    y="0"
                    fill="#FAF9F6"
                    fontSize="9.5"
                    fontFamily="Cormorant Garamond, serif"
                    letterSpacing="0.14em"
                    fontWeight="600"
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
          {/* ORGANIC CONTRAST VEIL FOR HIGH-READABILITY TYPOGRAPHY                   */}
          {/* Feathered soft backdrop positioned strictly beneath the active text     */}
          {/* zone. No cards, no boxes, no borders, completely natural.                */}
          {/* ======================================================================= */}
          <div
            className="absolute inset-0 pointer-events-none z-15"
            style={{
              background: 'radial-gradient(ellipse 55% 50% at 24% 74%, rgba(17,19,21,0.82) 0%, rgba(17,19,21,0.45) 45%, transparent 75%)',
            }}
          />

          {/* Precision Top Reticles & Telemetry HUD */}
          <div className="absolute top-28 left-6 md:left-16 hidden sm:flex items-center gap-3 font-mono text-[9px] text-[#8C8C87] tracking-[0.25em] z-20 pointer-events-none">
            <div className="w-2.5 h-2.5 border-t border-l border-[#B59A6A]/70" />
            <span>08 / GEOGRAPHIC PRECISION</span>
          </div>

          <div
            ref={telemetryHudRef}
            className="absolute top-28 right-6 md:right-16 hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#B59A6A] tracking-[0.25em] z-20 pointer-events-none"
          >
            01 / CITY METROPOLIS CONTEXT
          </div>

          {/* ======================================================================= */}
          {/* 7 CONTROLLED CINEMATIC TEXT STATES                                      */}
          {/* Each state occupies a deliberate, generous scroll window with smooth    */}
          {/* crossfades. Zero overlapping, high contrast, positioned in calm space.   */}
          {/* ======================================================================= */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end p-6 sm:p-12 md:p-16 lg:p-20">
            {/* ----------------------------------------------------------------- */}
            {/* STATE 1: CONNECTED TO THE CITY. (Wide City Context)               */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state1Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>THE LOCATION</span>
              </div>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
                style={{
                  filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.95)) drop-shadow(0 1px 3px rgba(0,0,0,0.95))',
                }}
              >
                CONNECTED TO
                <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                  THE CITY.
                </span>
              </h2>
              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                Positioned on Bosan Road, at Main BZU Chowk, Multan.
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 2: MAIN BZU CHOWK (Camera Approaches Junction)              */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state2Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>EXACT JUNCTION & ADDRESS</span>
              </div>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
                style={{
                  filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.95)) drop-shadow(0 1px 3px rgba(0,0,0,0.95))',
                }}
              >
                MAIN BZU
                <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                  CHOWK.
                </span>
              </h2>
              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                Multan's High-Visibility Commercial Precinct · Direct University Portal Access
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 3: BOSAN ROAD (Primary Arterial Spine)                       */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state3Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>PRIMARY ARTERIAL SPINE</span>
              </div>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
                style={{
                  filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.95)) drop-shadow(0 1px 3px rgba(0,0,0,0.95))',
                }}
              >
                BOSAN
                <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                  ROAD.
                </span>
              </h2>
              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                The prestigious commercial and residential lifeline connecting the city to the northern growth corridor.
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 4: MULTAN (Metropolitan Prominence & Marker Focus)          */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state4Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>METROPOLITAN REGION</span>
              </div>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
                style={{
                  filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.95)) drop-shadow(0 1px 3px rgba(0,0,0,0.95))',
                }}
              >
                MULTAN,
                <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                  PUNJAB.
                </span>
              </h2>
              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                Coordinates: 30.2715185° N, 71.4948905° E · A Prime Commercial Address
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 5: 2.7 KM* DHA MULTAN (North Route Focus)                   */}
            {/* Large numerical anchor, generous spacing, dedicated visual moment */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state5Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>STRATEGIC PROXIMITY</span>
              </div>

              {/* Large Numerical Visual Anchor */}
              <div className="flex items-baseline gap-2">
                <span
                  className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-[#FAF9F6] tracking-tight leading-none"
                  style={{
                    filter: 'drop-shadow(0 2px 18px rgba(0,0,0,0.95))',
                  }}
                >
                  2.7
                </span>
                <span className="font-mono text-lg sm:text-2xl text-[#B59A6A] font-light">
                  KM*
                </span>
              </div>

              <span
                className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FAF9F6] uppercase tracking-[0.08em] mt-3"
                style={{
                  filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.95))',
                }}
              >
                DHA MULTAN
              </span>

              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.18em] uppercase font-light mt-2 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                Seamless northern access via the Bosan Road corridor.
              </p>
              <span className="font-mono text-[9px] text-[#8C8C87] tracking-widest mt-2 block">
                *Approximate distance
              </span>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 6: 11 KM* MULTAN INTERNATIONAL AIRPORT (Southwest Route)    */}
            {/* Large numerical anchor, generous spacing, dedicated visual moment */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state6Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>TRANSIT & CONNECTIVITY</span>
              </div>

              {/* Large Numerical Visual Anchor */}
              <div className="flex items-baseline gap-2">
                <span
                  className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-[#FAF9F6] tracking-tight leading-none"
                  style={{
                    filter: 'drop-shadow(0 2px 18px rgba(0,0,0,0.95))',
                  }}
                >
                  11
                </span>
                <span className="font-mono text-lg sm:text-2xl text-[#B59A6A] font-light">
                  KM*
                </span>
              </div>

              <span
                className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FAF9F6] uppercase tracking-[0.08em] mt-3"
                style={{
                  filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.95))',
                }}
              >
                MULTAN INTERNATIONAL AIRPORT
              </span>

              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.18em] uppercase font-light mt-2 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                Direct arterial transit corridor connecting to the regional flight hub.
              </p>
              <span className="font-mono text-[9px] text-[#8C8C87] tracking-widest mt-2 block">
                *Approximate distance
              </span>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* STATE 7: AMEER HEIGHTS TOWER 10 (Building Transition)             */}
            {/* Calm, confident, premium destination statement                     */}
            {/* ----------------------------------------------------------------- */}
            <div
              ref={state7Ref}
              className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-12 sm:bottom-16 md:bottom-20 max-w-xl md:max-w-2xl opacity-0 flex flex-col items-start select-none will-change-[transform,opacity]"
            >
              <div className="flex items-center gap-2.5 mb-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#B59A6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6A]" />
                <span>THE DESTINATION</span>
              </div>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-[#FAF9F6] leading-[1.04] uppercase"
                style={{
                  filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.95)) drop-shadow(0 1px 3px rgba(0,0,0,0.95))',
                }}
              >
                AMEER HEIGHTS
                <span className="block font-serif italic font-normal text-[#CBB488] tracking-[0.04em] mt-1">
                  TOWER 10.
                </span>
              </h2>
              <p
                className="font-mono text-xs sm:text-sm text-[#D8D3CA] tracking-[0.20em] uppercase font-light mt-4 max-w-lg leading-relaxed"
                style={{
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.95))',
                }}
              >
                MAIN BZU CHOWK · BOSAN ROAD · MULTAN
              </p>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* ARCHITECTURAL BUILDING IMAGE REVEAL (State 7 Transition)                */}
          {/* ======================================================================= */}
          <div
            ref={buildingRevealRef}
            className="absolute inset-0 flex items-center justify-center z-15 opacity-0 pointer-events-none will-change-[transform,opacity]"
          >
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

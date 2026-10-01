import React, { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { floorPlans, FloorPlanResidence } from '../data/floorPlans';
import { ScrollReveal } from './ScrollReveal';

const typeMark: Record<FloorPlanResidence['type'], string> = {
  Studio: 'ST',
  '1 BHK': '1B',
  '2 BHK': '2B',
};

export const FloorPlansResidences: React.FC = () => {
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [activeResidenceId, setActiveResidenceId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const selectedFloor = floorPlans[selectedFloorIndex];
  const selectedResidence = useMemo(
    () => selectedFloor.residences.find((residence) => residence.id === activeResidenceId) ?? null,
    [activeResidenceId, selectedFloor],
  );

  const chooseFloor = (index: number) => {
    setSelectedFloorIndex(index);
    setActiveResidenceId(null);
  };

  const shiftFloor = (direction: number) => {
    chooseFloor((selectedFloorIndex + direction + floorPlans.length) % floorPlans.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 48) shiftFloor(distance > 0 ? -1 : 1);
  };

  const rotation = selectedFloorIndex * -90;

  return (
    <section
      id="floor-plans"
      className="relative overflow-hidden bg-[#111315] px-6 py-28 text-[#FAF9F6] md:px-16 md:py-36"
      aria-label="Ameer Heights Floor Plans and Residences"
    >
      <style>{`
        @keyframes floorplans-drift { 0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); } 50% { transform: translate3d(2%, 2%, 0) scale(1.04); } }
        @keyframes floorplans-pulse { 0%, 100% { opacity: .28; transform: scale(.95); } 50% { opacity: .65; transform: scale(1.06); } }
        @keyframes floorplans-draw { from { stroke-dashoffset: 240; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        @keyframes floorplans-rise { from { opacity: 0; transform: translate3d(0, 12px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        .floorplans-ambient { animation: floorplans-drift 18s ease-in-out infinite; }
        .floorplans-particle { animation: floorplans-pulse 6s ease-in-out infinite; }
        .floorplans-outline { stroke-dasharray: 240; animation: floorplans-draw 1.1s cubic-bezier(.22,1,.36,1) both; }
        .floorplans-card { animation: floorplans-rise .55s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .floorplans-ambient, .floorplans-particle, .floorplans-outline, .floorplans-card { animation: none !important; } }
      `}</style>

      <div className="floorplans-ambient pointer-events-none absolute -inset-[15%] opacity-70" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,rgba(181,154,106,0.12),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(216,211,202,0.06),transparent_30%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(181,154,106,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(181,154,106,0.11)_1px,transparent_1px)] [background-size:54px_54px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[['18%','19%','0s'], ['78%','18%','1.2s'], ['87%','73%','2.4s'], ['12%','77%','3.6s']].map(([left, top, delay]) => (
          <span key={left} className="floorplans-particle absolute h-1 w-1 rounded-full bg-[#B59A6A] blur-[1px]" style={{ left, top, animationDelay: delay }} />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 border-b border-[#242526] pb-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <ScrollReveal as="div" direction="left">
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6A]">04 / FLOOR PLANS</span>
              <span className="h-px w-8 bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-4xl font-normal uppercase tracking-wide text-[#FAF9F6] sm:text-5xl md:text-6xl">Floor Plans <span className="italic text-[#B59A6A]">&amp; Residences</span></h2>
          </ScrollReveal>
          <ScrollReveal as="p" direction="up" delay={0.08} className="max-w-md text-sm leading-relaxed text-[#8C8C87]">
            Thoughtfully designed living spaces crafted for comfort, functionality, and modern urban living.
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,.8fr)] xl:items-center">
          <ScrollReveal as="div" direction="up" className="relative">
            <div className="relative overflow-hidden border border-[#242526] bg-[#181B1D]/80 p-4 shadow-[0_24px_90px_rgba(0,0,0,.22)] backdrop-blur-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between border-b border-[#242526] pb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8C8C87]">
                <span>Digital residence schematic</span>
                <span className="text-[#B59A6A]">{selectedFloor.level}</span>
              </div>
              <div
                className="relative touch-pan-y"
                onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
                onTouchEnd={handleTouchEnd}
              >
                <svg viewBox="0 0 100 110" className="block w-full overflow-visible" role="img" aria-label={`${selectedFloor.label} animated apartment plan`}>
                  <defs>
                    <pattern id="floor-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="#B59A6A" strokeOpacity=".11" strokeWidth=".18" /></pattern>
                    <filter id="floor-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <rect x="1.5" y="1.5" width="97" height="106" fill="url(#floor-grid)" stroke="#B59A6A" strokeOpacity=".45" strokeWidth=".35" />
                  <path className="floorplans-outline" d="M44 36V102 M55 36V102 M7 36H94 M7 60H42 M55 60H94 M7 83H42 M55 83H94" fill="none" stroke="#D8D3CA" strokeOpacity=".28" strokeWidth=".28" style={{ animationDelay: '120ms' }} />
                  <rect x="43" y="38" width="13" height="44" rx=".8" fill="#111315" fillOpacity=".9" stroke="#B59A6A" strokeOpacity=".65" strokeWidth=".35" />
                  <text x="49.5" y="58" fill="#B59A6A" fillOpacity=".8" textAnchor="middle" fontSize="2.2" fontFamily="monospace" letterSpacing=".7">LOBBY</text>
                  <text x="49.5" y="62" fill="#8C8C87" textAnchor="middle" fontSize="1.6" fontFamily="monospace">LIFT / STAIRS</text>
                  {selectedFloor.residences.map((residence, index) => {
                    const active = activeResidenceId === residence.id;
                    return (
                      <g
                        key={residence.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Apartment ${residence.number}, ${residence.type}, ${residence.size} square feet`}
                        onClick={() => setActiveResidenceId(residence.id)}
                        onMouseEnter={() => setActiveResidenceId(residence.id)}
                        onMouseLeave={() => setActiveResidenceId(null)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveResidenceId(residence.id); }}
                        className="cursor-pointer outline-none"
                      >
                        <rect x={residence.x} y={residence.y} width={residence.width} height={residence.height} rx=".8" fill={active ? '#B59A6A' : '#181B1D'} fillOpacity={active ? '.26' : '.58'} stroke={active ? '#F3F0E9' : '#B59A6A'} strokeOpacity={active ? '1' : '.68'} strokeWidth={active ? '.7' : '.38'} filter={active ? 'url(#floor-glow)' : undefined} style={{ animationDelay: `${220 + index * 90}ms` }} className="floorplans-outline transition-all duration-300" />
                        <text x={residence.x + residence.width / 2} y={residence.y + residence.height / 2 - 1} fill={active ? '#FAF9F6' : '#D8D3CA'} textAnchor="middle" fontSize="2.25" fontFamily="monospace" fontWeight="600" letterSpacing=".35">APT {residence.number}</text>
                        <text x={residence.x + residence.width / 2} y={residence.y + residence.height / 2 + 3.1} fill="#B59A6A" textAnchor="middle" fontSize="1.9" fontFamily="monospace">{residence.type} · {residence.size} SQ FT</text>
                      </g>
                    );
                  })}
                </svg>
                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#8C8C87]">Tap a residence or swipe to change floor</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal as="div" direction="right" delay={0.05} className="flex flex-col items-center">
            <div className="relative h-[280px] w-[280px] sm:h-[330px] sm:w-[330px]" role="tablist" aria-label="Floor selector">
              <div className="absolute inset-[25px] rounded-full border border-[#B59A6A]/20 bg-[#181B1D]/60 shadow-[inset_0_0_55px_rgba(181,154,106,.06)]" />
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `rotate(${rotation}deg)` }}>
                {floorPlans.map((floor, index) => {
                  const angle = index * 90;
                  const selected = index === selectedFloorIndex;
                  return (
                    <button
                      key={floor.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => chooseFloor(index)}
                      className={`absolute left-1/2 top-1/2 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-500 sm:h-[88px] sm:w-[88px] ${selected ? 'border-[#F3F0E9] bg-[#B59A6A] text-[#111315] shadow-[0_0_30px_rgba(181,154,106,.22)]' : 'border-[#B59A6A]/35 bg-[#111315] text-[#D8D3CA] hover:border-[#B59A6A] hover:text-[#FAF9F6]'}`}
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-112px) rotate(${-angle - rotation}deg)` }}
                    >
                      <span className="text-base tracking-normal sm:text-lg">{floor.shortLabel}</span>
                      <span className="mt-0.5 text-[8px] tracking-[0.1em]">{floor.id === 'ground' ? 'GROUND' : 'FLOOR'}</span>
                    </button>
                  );
                })}
              </div>
              <div className="absolute inset-[76px] z-10 flex flex-col items-center justify-center rounded-full border border-[#242526] bg-[#111315]/95 text-center shadow-2xl sm:inset-[92px]">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#B59A6A]">Selected</span>
                <span className="mt-2 font-serif text-lg uppercase tracking-wide text-[#FAF9F6] sm:text-xl">{selectedFloor.label}</span>
              </div>
            </div>
            <div className="mt-8 flex w-full max-w-sm items-center justify-between border-y border-[#242526] py-4">
              <button type="button" onClick={() => shiftFloor(-1)} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8C8C87] transition-colors hover:text-[#FAF9F6]"><ChevronLeft className="h-4 w-4 text-[#B59A6A]" /> Previous</button>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D8D3CA]">{selectedFloor.residences.length} residences</span>
              <button type="button" onClick={() => shiftFloor(1)} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8C8C87] transition-colors hover:text-[#FAF9F6]">Next <ChevronRight className="h-4 w-4 text-[#B59A6A]" /></button>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedFloor.residences.map((residence, index) => {
            const active = selectedResidence?.id === residence.id;
            return (
              <button
                key={residence.id}
                type="button"
                onClick={() => setActiveResidenceId(active ? null : residence.id)}
                onMouseEnter={() => setActiveResidenceId(residence.id)}
                onMouseLeave={() => setActiveResidenceId(null)}
                className={`floorplans-card group relative overflow-hidden border p-5 text-left transition-all duration-500 ${active ? 'border-[#B59A6A] bg-[#B59A6A]/10 shadow-[0_16px_45px_rgba(0,0,0,.22)]' : 'border-[#242526] bg-[#181B1D]/75 hover:border-[#B59A6A]/60 hover:bg-[#181B1D]'}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="absolute right-0 top-0 h-px w-14 bg-[#B59A6A] transition-all duration-500 group-hover:w-24" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B59A6A]">Apartment {residence.number}</span>
                    <h3 className="mt-2 font-serif text-2xl text-[#FAF9F6]">{residence.type}</h3>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center border border-[#B59A6A]/35 font-mono text-[10px] text-[#D8D3CA]">{typeMark[residence.type]}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-[#242526] pt-4">
                  <div><span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-[#8C8C87]">Residence size</span><span className="font-serif text-lg text-[#FAF9F6]">{residence.size} <span className="font-mono text-[10px] text-[#8C8C87]">SQ FT</span></span></div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#B59A6A]">{residence.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[#242526] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8C8C87]">Interactive schematic · indicative apartment configurations</p>
          <a href="#inventory" className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#D8D3CA] transition-colors hover:text-[#FAF9F6]">View apartment portfolio <ArrowUpRight className="h-4 w-4 text-[#B59A6A] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
        </div>
      </div>
    </section>
  );
};

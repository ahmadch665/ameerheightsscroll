import React, { useState } from 'react';
import { projectData } from '../data/projectData';
import { ApartmentUnit } from '../types';
import { formatPKR } from '../utils/formatters';
import { Filter, ArrowUpRight, Check } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { ParallaxBackground } from './ParallaxBackground';

interface ApartmentInventoryProps {
  selectedTypeFilter: string;
  onFilterChange: (type: string) => void;
  onSelectUnit: (unit: ApartmentUnit) => void;
}

export const ApartmentInventory: React.FC<ApartmentInventoryProps> = ({
  selectedTypeFilter,
  onFilterChange,
  onSelectUnit
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filterOptions = ['All', 'Studio', '1 Bedroom', '2 Bedroom'];

  const filteredApartments = selectedTypeFilter === 'All'
    ? projectData.apartments
    : projectData.apartments.filter((apt) => apt.type === selectedTypeFilter);

  const totalFilteredUnits = filteredApartments.reduce((acc, curr) => acc + curr.unitCount, 0);

  return (
    <section
      id="inventory"
      className="relative bg-[#F3F0E9] text-[#111315] py-28 md:py-36 px-6 md:px-16 overflow-hidden"
      aria-label="Ameer Heights Complete Apartment Inventory"
    >
      {/* Refined Architectural Linework & Technical Drafting Atmosphere */}
      <ParallaxBackground speed={0.035} maxOffset={16} className="absolute inset-0">
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Technical Drawing Grid: Thin Horizontal & Vertical Linework */}
          <div className="w-full h-full max-w-7xl mx-auto border-x border-[#111315]/[0.035] grid grid-cols-6 md:grid-cols-12 opacity-80">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="border-r border-[#111315]/[0.025] h-full relative">
                {/* Architectural Drafting Tick Marks */}
                <span className="absolute top-1/4 -right-1 w-2 h-[1px] bg-[#B59A6A]/20" />
                <span className="absolute top-3/4 -right-1 w-2 h-[1px] bg-[#B59A6A]/20" />
              </div>
            ))}
          </div>

          {/* Faint Horizontal Drafting Reference Lines */}
          <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-[0.03]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-[#111315]" />
            ))}
          </div>

          {/* Subtle Perspective Coordinate Line */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10%" x2="100%" y2="85%" stroke="#111315" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="100%" y1="15%" x2="0" y2="90%" stroke="#111315" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
        </div>
      </ParallaxBackground>

      {/* Seamless Architectural Top & Bottom Edge Gradient Transitions */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#181B1D]/[0.04] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#111315]/[0.06] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header: Heading LEFT -> CENTER, Controls BOTTOM -> CENTER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#D8D3CA] pb-8 mb-12 gap-6">
          <ScrollReveal as="div" direction="left" delay={0.00}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                04 / COMPLETE INVENTORY
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-[#111315]">
              Apartment Portfolio
            </h2>
            <p className="font-mono text-xs text-[#8C8C87] uppercase tracking-[0.2em] mt-2">
              Fixed Selling Rate: PKR 15,000 / SQ FT · 30 Fully Furnished Units Total
            </p>
          </ScrollReveal>

          {/* Controls: Filter & View Toggle - BOTTOM -> CENTER */}
          <ScrollReveal as="div" direction="up" delay={0.08} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-[#FAF9F6] border border-[#D8D3CA] p-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onFilterChange(opt)}
                  className={`btn-luxury-hover px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                    selectedTypeFilter === opt
                      ? 'bg-[#111315] text-[#FAF9F6]'
                      : 'text-[#8C8C87] hover:text-[#111315]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center border border-[#D8D3CA] bg-[#FAF9F6] p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`btn-luxury-hover px-3 py-1.5 uppercase tracking-wider transition-colors ${
                  viewMode === 'cards' ? 'bg-[#111315] text-[#FAF9F6]' : 'text-[#8C8C87] hover:text-[#111315]'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`btn-luxury-hover px-3 py-1.5 uppercase tracking-wider transition-colors ${
                  viewMode === 'table' ? 'bg-[#111315] text-[#FAF9F6]' : 'text-[#8C8C87] hover:text-[#111315]'
                }`}
              >
                Table
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Sub-label count: BOTTOM -> CENTER */}
        <ScrollReveal as="div" direction="up" delay={0.10} className="flex items-center justify-between text-xs font-mono text-[#8C8C87] mb-8 pb-3 border-b border-[#D8D3CA]/60">
          <span>SHOWING {filteredApartments.length} CONFIGURATIONS ({totalFilteredUnits} RESIDENCES)</span>
          <span className="hidden md:inline">* Indicative pricing calculated at PKR 15,000/sq ft subject to confirmation</span>
        </ScrollReveal>

        {/* CARDS VIEW */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map((apt, idx) => (
              <ScrollReveal
                as="div"
                key={apt.id}
                direction="up"
                delay={(idx % 6) * 0.05}
                className="group bg-[#FAF9F6] border border-[#D8D3CA] hover:border-[#B59A6A] transition-all duration-300 p-7 flex flex-col justify-between"
                data-cursor="view"
                data-cursor-text="DETAILS"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#D8D3CA]">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#F3F0E9] text-[#111315] border border-[#D8D3CA]">
                      {apt.type}
                    </span>
                    <span className="font-mono text-xs text-[#B59A6A] font-medium tracking-widest">
                      {apt.unitCount} {apt.unitCount === 1 ? 'UNIT' : 'UNITS'}
                    </span>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl text-[#111315] font-light">
                        {apt.sizeSqFt}
                      </span>
                      <span className="font-mono text-xs uppercase text-[#8C8C87] tracking-wider">
                        SQ FT
                      </span>
                    </div>

                    <p className="text-xs text-[#8C8C87] mt-3 leading-relaxed">
                      {apt.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#D8D3CA] space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-wider block">
                        Indicative Price
                      </span>
                      <span className="font-mono text-base font-semibold text-[#111315]">
                        {formatPKR(apt.indicativePricePkr)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#8C8C87]">
                      @ 15,000 / sq ft
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectUnit(apt)}
                    className="btn-luxury-hover w-full py-2.5 text-xs font-mono uppercase tracking-[0.16em] text-[#111315] bg-[#F3F0E9] group-hover:bg-[#111315] group-hover:text-[#FAF9F6] border border-[#D8D3CA] group-hover:border-[#111315] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Request Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <ScrollReveal as="div" direction="up" delay={0.06} className="overflow-x-auto bg-[#FAF9F6] border border-[#D8D3CA]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D8D3CA] bg-[#F3F0E9] font-mono text-[11px] text-[#8C8C87] uppercase tracking-[0.16em]">
                  <th className="py-4 px-6">Apartment Type</th>
                  <th className="py-4 px-6">Size (Sq Ft)</th>
                  <th className="py-4 px-6">Available Inventory</th>
                  <th className="py-4 px-6">Rate / Sq Ft</th>
                  <th className="py-4 px-6">Indicative Price</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D3CA] font-mono text-xs">
                {filteredApartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-[#111315]">
                      {apt.type}
                    </td>
                    <td className="py-4 px-6 font-serif text-base text-[#111315]">
                      {apt.sizeSqFt} sq ft
                    </td>
                    <td className="py-4 px-6 text-[#B59A6A] font-semibold">
                      {apt.unitCount} {apt.unitCount === 1 ? 'Apartment' : 'Apartments'}
                    </td>
                    <td className="py-4 px-6 text-[#8C8C87]">
                      PKR 15,000
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#111315]">
                      {formatPKR(apt.indicativePricePkr)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectUnit(apt)}
                        className="btn-luxury-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider bg-[#111315] text-[#FAF9F6] hover:bg-[#B59A6A] hover:text-[#111315] transition-colors"
                      >
                        <span>Enquire</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollReveal>
        )}

        {/* Footnote on pricing */}
        <ScrollReveal as="p" direction="up" delay={0.14} className="mt-8 text-xs font-mono text-[#8C8C87] text-center">
          Pricing represents indicative calculations based on PKR 15,000 per sq ft. All apartments are delivered fully furnished with complete interior elements.
        </ScrollReveal>
      </div>
    </section>
  );
};

import React from 'react';
import { ArrowRight, Bed, Home, Maximize2 } from 'lucide-react';
import { projectData } from '../data/projectData';
import { ScrollReveal } from './ScrollReveal';

interface ResidenceTypesProps {
  onSelectCategory: (type: string) => void;
  onOpenEnquiry: (prefill?: { type?: string; size?: string }) => void;
}

export const ResidenceTypes: React.FC<ResidenceTypesProps> = ({ onSelectCategory, onOpenEnquiry }) => {
  return (
    <section
      id="residences"
      className="relative bg-[#181B1D] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 overflow-hidden"
      aria-label="Ameer Heights Residence Typologies"
    >
      {/* Warmer Residential Architectural Facade Light & Shadow Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle vertical architectural timber slat/shadow structures */}
        <div className="absolute inset-0 flex justify-between max-w-7xl mx-auto px-6 opacity-[0.035]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-full bg-gradient-to-b from-transparent via-[#B59A6A] to-transparent" />
          ))}
        </div>

        {/* Diagonal Soft Sunlight Drift across building facade */}
        <div className="absolute -top-1/3 -left-1/4 w-[150%] h-[160%] bg-[linear-gradient(125deg,rgba(181,154,106,0.06)_0%,transparent_40%,rgba(181,154,106,0.03)_65%,transparent_100%)] animate-facade-sunlight" />

        {/* Soft bottom gradient transition into Inventory (ivory) */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#F3F0E9]/[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header: Main Heading RIGHT -> CENTER, Supporting text BOTTOM -> CENTER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-16 gap-6">
          <ScrollReveal as="div" direction="right" delay={0.00}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                03 / RESIDENCE TYPOLOGIES
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-[#FAF9F6]">
              The Residences
            </h2>
          </ScrollReveal>
          <ScrollReveal as="div" direction="up" delay={0.08} className="max-w-md">
            <p className="font-serif text-xl text-[#B59A6A] italic">
              Three ways to live. One elevated standard.
            </p>
            <p className="text-sm text-[#8C8C87] mt-1">
              Every layout is thoughtfully calibrated for maximum usable spatial efficiency and fully furnished completeness.
            </p>
          </ScrollReveal>
        </div>

        {/* 3 Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projectData.residenceCategories.map((category, idx) => (
            <ScrollReveal
              as="div"
              key={category.id}
              direction="up"
              delay={idx * 0.10}
              className="group relative bg-[#111315] border border-[#242526] hover:border-[#B59A6A] transition-all duration-500 flex flex-col justify-between p-8 md:p-10"
              data-cursor="view"
              data-cursor-text="EXPLORE"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#242526]">
                  <span className="font-mono text-xs text-[#B59A6A] tracking-[0.2em] uppercase">
                    {category.totalUnits} {category.totalUnits === 1 ? 'Unit Available' : 'Units Available'}
                  </span>
                  <div className="p-2 border border-[#242526] group-hover:border-[#B59A6A] transition-colors text-[#8C8C87] group-hover:text-[#B59A6A]">
                    {category.type === 'Studio' ? (
                      <Home className="w-4 h-4" />
                    ) : category.type === '1 Bedroom' ? (
                      <Bed className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Title & Size Range */}
                <div className="mt-8 mb-6">
                  <h3 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] group-hover:text-[#B59A6A] transition-colors uppercase tracking-wider">
                    {category.title}
                  </h3>
                  <p className="font-mono text-sm text-[#D8D3CA] mt-2 tracking-wider">
                    {category.sizeRange}
                  </p>
                </div>

                <p className="text-sm text-[#8C8C87] leading-relaxed mb-8">
                  {category.highlight}
                </p>

                {/* Key Architectural Inclusions */}
                <div className="space-y-2.5 pt-6 border-t border-[#242526]">
                  {category.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#D8D3CA]">
                      <span className="w-1.5 h-1.5 bg-[#B59A6A]" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-10 pt-6 border-t border-[#242526] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectCategory(category.type)}
                  className="text-xs font-mono uppercase tracking-[0.16em] text-[#D8D3CA] group-hover:text-[#FAF9F6] flex items-center gap-2 transition-colors"
                >
                  <span>Explore Floorplans</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform text-[#B59A6A]" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEnquiry({ type: category.type })}
                  className="btn-luxury-hover px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase text-[#B59A6A] hover:text-[#FAF9F6] hover:bg-[#B59A6A]/15 border border-[#B59A6A]/40 transition-colors"
                >
                  Enquire
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

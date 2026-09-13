import React from 'react';
import { projectData } from '../data/projectData';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

export const ProjectIntro: React.FC = () => {
  return (
    <section
      id="overview"
      className="relative bg-[#F3F0E9] text-[#111315] py-28 md:py-40 px-6 md:px-16 overflow-hidden transition-colors duration-700"
    >
      {/* Subtle Architectural Background Grid & Ruler lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div className="w-full h-full border-x border-[#111315] max-w-7xl mx-auto grid grid-cols-6 md:grid-cols-12" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Architectural Coordinate Marker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#D8D3CA] pb-6 mb-16 gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
              01 / THE RESIDENCE
            </span>
            <span className="w-8 h-[1px] bg-[#B59A6A]" />
          </div>
          <p className="font-mono text-[11px] text-[#8C8C87] tracking-[0.2em] uppercase">
            Multan · Punjab · Pakistan
          </p>
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Main Statement */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-[0.02em] uppercase text-[#111315]">
              Designed For <br />
              <span className="italic font-serif text-[#B59A6A]">The Way You Live.</span>
            </h2>
            <div className="w-20 h-[2px] bg-[#B59A6A]" />
          </div>

          {/* Narrative & Inclusions */}
          <div className="lg:col-span-5 space-y-8">
            <p className="font-sans text-lg md:text-xl font-light leading-relaxed text-[#242526]">
              A thoughtfully designed collection of 30 fully furnished residences at Main BZU Chowk, Multan — combining contemporary architecture, refined interiors and everyday convenience in one distinctive address.
            </p>

            <div className="pt-4 border-t border-[#D8D3CA] space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 border border-[#B59A6A]/40 text-[#B59A6A] mt-1 shrink-0 bg-[#FAF9F6]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-[#111315] uppercase tracking-wide">
                    Complete Turnkey Interior
                  </h4>
                  <p className="text-sm text-[#8C8C87] leading-relaxed mt-0.5">
                    Move into a home fitted with bespoke furniture, lighting, accessories, and designer fixtures.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 border border-[#B59A6A]/40 text-[#B59A6A] mt-1 shrink-0 bg-[#FAF9F6]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-[#111315] uppercase tracking-wide">
                    Pivotal Bosan Road Location
                  </h4>
                  <p className="text-sm text-[#8C8C87] leading-relaxed mt-0.5">
                    Commanding direct accessibility at Main BZU Chowk, connecting seamlessly across the city.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Quote Band */}
        <div className="mt-20 pt-12 border-t border-[#D8D3CA] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C8C87] mb-2">Philosophy</p>
            <p className="font-serif text-lg text-[#111315]">From Foundation to Residence</p>
            <p className="text-xs text-[#8C8C87] mt-1">Engineered with purposeful monolithic elegance and enduring materiality.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C8C87] mb-2">Exclusivity</p>
            <p className="font-serif text-lg text-[#111315]">30 Private Residences</p>
            <p className="text-xs text-[#8C8C87] mt-1">A boutique residential sanctuary free from dense crowds and high traffic.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C8C87] mb-2">Standard</p>
            <p className="font-serif text-lg text-[#111315]">PKR 15,000 / sq ft</p>
            <p className="text-xs text-[#8C8C87] mt-1">Transparent square footage valuation inclusive of full designer interior fitouts.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

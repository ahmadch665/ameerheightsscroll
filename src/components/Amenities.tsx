import React from 'react';
import { projectData } from '../data/projectData';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const Amenities: React.FC = () => {
  return (
    <section
      id="amenities"
      className="relative bg-[#111315] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 border-t border-[#242526] overflow-hidden"
      aria-label="Ameer Heights Confirmed Features and Amenities"
    >
      {/* Subtle Geometric Depth & Minimal Abstract Architectural Planes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Faint Abstract Architectural Plane 1 */}
        <div className="absolute top-12 left-10 w-96 h-96 border border-[#B59A6A]/[0.025] bg-[#181B1D]/20 animate-plane-float" />
        
        {/* Faint Abstract Architectural Plane 2 */}
        <div className="absolute bottom-16 right-16 w-[32rem] h-80 border border-[#FAF9F6]/[0.02] bg-[#141618]/30 animate-plane-float [animation-delay:-12s]" />

        {/* Soft Tonal Vignette & Shadow Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,#111315_90%)]" />

        {/* Seamless Transitions to and from Adjacent Sections */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#181B1D]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#111315]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header: Heading RIGHT -> CENTER, Supporting text BOTTOM -> CENTER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-16 gap-6">
          <ScrollReveal as="div" direction="right" delay={0.00}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                07 / VERIFIED PROJECT AMENITIES
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal uppercase tracking-wide text-[#FAF9F6]">
              Core Project Features
            </h2>
          </ScrollReveal>
          <ScrollReveal as="p" direction="up" delay={0.08} className="font-mono text-xs text-[#8C8C87] uppercase tracking-[0.2em] max-w-sm">
            Confirmed Structural & Residential Specifications
          </ScrollReveal>
        </div>

        {/* Confirmed Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectData.amenities.map((amenity, idx) => (
            <ScrollReveal
              as="div"
              key={amenity.id}
              direction="up"
              delay={(idx % 3) * 0.08}
              className="group p-8 bg-[#181B1D] border border-[#242526] hover:border-[#B59A6A]/50 transition-colors duration-300 flex flex-col justify-between cursor-default"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#242526]">
                  <span className="font-mono text-[10px] text-[#B59A6A] uppercase tracking-[0.2em]">
                    {amenity.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8C8C87]">
                      0{idx + 1}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8C8C87] group-hover:text-[#B59A6A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* Title with Subtle 4px Glide on Hover */}
                <h3 className="font-serif text-xl text-[#FAF9F6] uppercase tracking-wider mt-6 mb-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#B59A6A]">
                  {amenity.title}
                </h3>
                <p className="text-xs text-[#8C8C87] leading-relaxed">
                  {amenity.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#242526] flex items-center gap-2 text-xs font-mono text-[#B59A6A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider text-[10px]">Verified Amenity</span>
              </div>
            </ScrollReveal>
          ))}

          {/* Transparent Extensibility Card */}
          <ScrollReveal as="div" direction="up" delay={0.24} className="p-8 bg-[#111315] border border-dashed border-[#242526] flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-[0.2em] block mb-4">
                Transparent Advisory
              </span>
              <h3 className="font-serif text-xl text-[#D8D3CA] uppercase tracking-wider mb-3">
                Architectural Disclosure
              </h3>
              <p className="text-xs text-[#8C8C87] leading-relaxed">
                Ameer Heights adheres to strict factual transparency. All features displayed are verified in project planning. Any future municipal or service expansions will be announced through official project releases.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#242526] text-[10px] font-mono text-[#8C8C87] uppercase tracking-wider">
              No Fabricated Amenities Policy
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

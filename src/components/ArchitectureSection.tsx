import React from 'react';
import { projectData } from '../data/projectData';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const ArchitectureSection: React.FC = () => {
  return (
    <section
      id="architecture"
      className="relative bg-[#181B1D] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 overflow-hidden"
      aria-label="Ameer Heights Architecture With Intention"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-16 gap-6">
          <ScrollReveal as="div" direction="left" delay={0.00}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                06 / ARCHITECTURAL PHILOSOPHY
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal uppercase tracking-wide text-[#FAF9F6]">
              Architecture <br />
              <span className="italic text-[#B59A6A]">With Intention.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal as="p" direction="right" delay={0.08} className="font-mono text-xs text-[#8C8C87] uppercase tracking-[0.2em] max-w-sm">
            Monolithic Proportion · Refined Materiality · Urban Form
          </ScrollReveal>
        </div>

        {/* 2-Column Editorial Layout with Actual Facade Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual: Real Building Facade Rendered from Video Asset */}
          <ScrollReveal as="div" direction="fade" delay={0.04} className="lg:col-span-6 relative group">
            <div className="relative overflow-hidden border border-[#242526] group-hover:border-[#B59A6A]/50 transition-colors duration-500 bg-[#111315]">
              <img
                src="/assets/stage_4_facade.jpg"
                alt="Ameer Heights Tower 10 completed architecture with modern dark charcoal facade and wood-toned panels"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[640px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-[#FAF9F6] bg-[#111315]/90 backdrop-blur-sm p-3.5 border border-[#242526]">
                <span className="tracking-wider">AMEER HEIGHTS TOWER 10</span>
                <span className="text-[#B59A6A]">PRIMARY FACADE ELEVATION</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Text & Principles */}
          <div className="lg:col-span-6 space-y-8">
            <ScrollReveal as="div" direction="right" delay={0.06} className="space-y-4">
              <span className="font-mono text-xs text-[#B59A6A] tracking-[0.2em] uppercase">
                The Facade & Form
              </span>
              <p className="font-sans text-base md:text-lg font-light text-[#D8D3CA] leading-relaxed">
                The architecture of Ameer Heights Tower 10 is rooted in discipline, proportion, and quiet strength. The building pairs a deep matte graphite exterior envelope with warm timber-textured vertical slats, establishing a distinct presence on the Multan streetscape.
              </p>
            </ScrollReveal>

            {/* Confirmed Architectural Elements */}
            <ScrollReveal as="div" direction="right" delay={0.14} className="space-y-4 pt-4 border-t border-[#242526]">
              {projectData.architecturePhilosophy.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 group">
                  <span className="font-mono text-xs text-[#B59A6A] mt-1 shrink-0">
                    0{idx + 1}
                  </span>
                  <p className="text-xs md:text-sm text-[#8C8C87] group-hover:text-[#FAF9F6] transition-colors leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </ScrollReveal>

            {/* Scale summary */}
            <ScrollReveal as="div" direction="up" delay={0.22} className="pt-6 border-t border-[#242526] grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#111315] border border-[#242526]">
                <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-wider block">Scale</span>
                <span className="font-serif text-lg text-[#FAF9F6]">{projectData.floors}</span>
              </div>
              <div className="p-4 bg-[#111315] border border-[#242526]">
                <span className="font-mono text-[10px] text-[#8C8C87] uppercase tracking-wider block">Transit</span>
                <span className="font-serif text-lg text-[#FAF9F6]">{projectData.elevator}</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

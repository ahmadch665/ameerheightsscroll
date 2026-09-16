import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projectData } from '../data/projectData';
import { ScrollReveal } from './ScrollReveal';

interface EnquiryCTAProps {
  onOpenEnquiry: () => void;
}

export const EnquiryCTA: React.FC<EnquiryCTAProps> = ({ onOpenEnquiry }) => {
  return (
    <section
      id="cta"
      className="relative bg-[#111315] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 border-t border-[#242526] text-center overflow-hidden"
      aria-label="Enquire on Ameer Heights Tower 10"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B59A6A]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <ScrollReveal as="div" direction="up" delay={0.00} className="inline-flex items-center gap-2.5 px-4 py-1 bg-[#181B1D] border border-[#B59A6A]/30 text-[11px] font-mono tracking-[0.22em] text-[#B59A6A] uppercase">
          <span>Private Appointments & Inquiries</span>
        </ScrollReveal>

        <ScrollReveal as="h2" direction="up" delay={0.08} className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal tracking-[0.04em] uppercase text-[#FAF9F6] leading-[1.08]">
          Your Next Address <br />
          <span className="italic font-serif text-[#B59A6A]">Starts Here.</span>
        </ScrollReveal>

        <ScrollReveal as="p" direction="up" delay={0.16} className="font-sans text-base md:text-lg text-[#D8D3CA] font-light max-w-2xl mx-auto leading-relaxed">
          Discover a fully furnished residence designed around modern urban living in the heart of Multan. 30 architect-designed apartments at Main BZU Chowk.
        </ScrollReveal>

        <ScrollReveal as="div" direction="up" delay={0.24} className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            data-magnetic="true"
            onClick={onOpenEnquiry}
            className="btn-luxury-hover px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] border border-[#F3F0E9] hover:border-[#B59A6A] flex items-center gap-2.5 shadow-2xl"
          >
            <span>Enquire Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <a
            href="#inventory"
            className="btn-luxury-hover px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase text-[#FAF9F6] bg-[#181B1D] hover:bg-[#242526] border border-[#242526] hover:border-[#B59A6A]/50 transition-colors"
          >
            <span>View Residences</span>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
};

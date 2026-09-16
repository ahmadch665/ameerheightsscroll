import React from 'react';
import { Sofa, BedDouble, Utensils, Lamp, CheckCircle2, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const FurnishedExperience: React.FC = () => {
  const furnishingCategories = [
    {
      icon: Sofa,
      title: "Living & Salon Elements",
      description: "Ergonomic designer seating, curated coffee and occasional tables, bespoke media credenza, and coordinated textile accents."
    },
    {
      icon: BedDouble,
      title: "Sleeping & Wardrobe Suites",
      description: "Custom headboard installations, premium mattresses, integrated side consoles, and precision-fitted built-in wardrobe systems."
    },
    {
      icon: Utensils,
      title: "Kitchenette & Dining Consoles",
      description: "Architectural culinary cabinetry, coordinated quartz/stone surfaces, integrated sink fittings, and tailored breakfast/dining furniture."
    },
    {
      icon: Lamp,
      title: "Atmospheric Lighting & Accents",
      description: "Layered warm architectural illumination, designer sconces, tailored window dressings, and refined minimalist decorative accessories."
    }
  ];

  return (
    <section
      id="furnished"
      className="relative bg-[#111315] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 border-t border-[#242526] overflow-hidden"
      aria-label="Fully Furnished and Architect Designed Residences"
    >
      {/* Softer Lifestyle Atmospheric Background (Light Through Apartment Window) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Warm/Cool Tonal Shift & Window Light Aperture */}
        <div className="absolute -top-1/4 -right-1/4 w-[130%] h-[140%] bg-[radial-gradient(ellipse_at_center,_rgba(181,154,106,0.06)_0%,rgba(36,37,38,0.3)_45%,transparent_75%)] animate-lifestyle-wash" />
        
        {/* Faint Architectural Window Mullion Shadow Lines */}
        <div className="absolute inset-0 opacity-[0.025] flex justify-around">
          <div className="w-[1px] h-full bg-[#FAF9F6]" />
          <div className="w-[1px] h-full bg-[#FAF9F6]" />
          <div className="w-[1px] h-full bg-[#FAF9F6]" />
        </div>

        {/* Soft gradient transitions between sections */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#111315] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#181B1D]/40" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header: Main Heading RIGHT -> CENTER, Supporting text BOTTOM -> CENTER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-16 gap-6">
          <ScrollReveal as="div" direction="right" delay={0.00}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                05 / INTERIOR CURATION
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal uppercase tracking-wide text-[#FAF9F6] leading-[1.1]">
              Fully Furnished. <br />
              <span className="italic text-[#B59A6A]">Architect Designed.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal as="p" direction="up" delay={0.08} className="font-mono text-xs text-[#8C8C87] uppercase tracking-[0.2em] max-w-sm">
            Ready For Modern Living · Furniture, Accessories & Interior Elements Included
          </ScrollReveal>
        </div>

        {/* Editorial Layout: Statement + Architectural Grid Treatment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Focus - BOTTOM -> CENTER */}
          <div className="lg:col-span-6 space-y-8">
            <ScrollReveal as="div" direction="up" delay={0.06} className="p-8 md:p-10 bg-[#181B1D] border border-[#242526] relative">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B59A6A] block mb-3">
                Core Philosophy
              </span>
              <p className="font-serif text-2xl md:text-3xl font-light text-[#FAF9F6] leading-relaxed italic">
                “Move into a space that already feels complete.”
              </p>
              <p className="text-sm text-[#8C8C87] font-light leading-relaxed mt-4">
                Rather than navigating the complexities of post-possession contractor work, interior sourcing, and furniture procurement, each residence at Ameer Heights is handed over fully realized. Every piece has been selected for material longevity and visual calm.
              </p>

              <div className="mt-8 pt-6 border-t border-[#242526] flex items-center gap-3 text-xs font-mono text-[#D8D3CA]">
                <CheckCircle2 className="w-4 h-4 text-[#B59A6A]" />
                <span>Zero post-handover furniture expenditure required</span>
              </div>
            </ScrollReveal>

            {/* Architectural Material Specification */}
            <ScrollReveal as="div" direction="up" delay={0.12} className="p-8 border border-[#242526] bg-[#111315] space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8C8C87] border-b border-[#242526] pb-3">
                <span>INTERIOR MATERIAL SPECIFICATION</span>
                <span className="text-[#B59A6A]">AH-INT-STD</span>
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono text-xs text-[#D8D3CA]">
                <div className="p-3 bg-[#181B1D] border border-[#242526] text-center">
                  <span className="block text-[10px] text-[#8C8C87] mb-1">TONE</span>
                  <span>Warm Charcoal</span>
                </div>
                <div className="p-3 bg-[#181B1D] border border-[#242526] text-center">
                  <span className="block text-[10px] text-[#8C8C87] mb-1">ACCENTS</span>
                  <span>Architectural Timber</span>
                </div>
                <div className="p-3 bg-[#181B1D] border border-[#242526] text-center">
                  <span className="block text-[10px] text-[#8C8C87] mb-1">GLAZING</span>
                  <span>Smoked Bronze Glass</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Detailed Inclusions Grid - Staggered BOTTOM -> CENTER */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {furnishingCategories.map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal
                  as="div"
                  key={item.title}
                  direction="up"
                  delay={idx * 0.08}
                  className="p-8 bg-[#181B1D] border border-[#242526] hover:border-[#B59A6A]/60 transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 border border-[#242526] group-hover:border-[#B59A6A] flex items-center justify-center text-[#B59A6A] mb-6 transition-colors bg-[#111315]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg text-[#FAF9F6] uppercase tracking-wider mb-2.5 group-hover:text-[#B59A6A] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8C8C87] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#242526] flex items-center gap-2 font-mono text-[10px] text-[#B59A6A] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Included Turnkey</span>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

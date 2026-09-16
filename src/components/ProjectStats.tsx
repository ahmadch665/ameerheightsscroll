import React from 'react';
import { projectData } from '../data/projectData';
import { ScrollReveal } from './ScrollReveal';

export const ProjectStats: React.FC = () => {
  const stats = [
    {
      number: "30",
      label: "Fully Furnished Residences",
      caption: "Turnkey luxury apartments inclusive of furniture & accessories"
    },
    {
      number: "G+3",
      label: "Floors",
      caption: "Boutique residential low-rise scale offering privacy & serenity"
    },
    {
      number: "15,000",
      prefix: "PKR",
      suffix: "/ SQ FT",
      label: "Selling Rate",
      caption: "Competitive investment pricing with all interior furnishings included"
    },
    {
      number: "1",
      label: "High-Speed Elevator",
      caption: "Dedicated swift transit serving Ground through all 3 residential levels"
    },
    {
      number: "3",
      label: "Residence Types",
      caption: "Architect-designed Studio, 1 Bedroom & 2 Bedroom configurations"
    }
  ];

  return (
    <section
      id="stats"
      className="relative bg-[#111315] text-[#FAF9F6] py-24 md:py-32 px-6 md:px-16 border-y border-[#242526] overflow-hidden"
      aria-label="Ameer Heights Key Project Specifications"
    >
      {/* Subtle Architectural Atmosphere & Gradient Transitions */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft top gradient transition from Overview */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#111315] to-transparent" />
        {/* Soft low-contrast ambient tonal movement */}
        <div className="absolute -top-1/2 left-1/4 w-[80%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#181B1D] via-[#111315] to-transparent opacity-50 animate-ambient-light" />
        {/* Soft bottom gradient transition to Residences */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#181B1D]/40" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Subtle Section Tag */}
        <ScrollReveal as="div" direction="left" delay={0.00} className="flex items-center gap-3 mb-16">
          <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
            02 / PROJECT SPECIFICATIONS
          </span>
          <span className="w-8 h-[1px] bg-[#B59A6A]" />
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {stats.map((stat, idx) => (
            <ScrollReveal
              as="div"
              key={stat.label}
              direction="up"
              delay={idx * 0.07}
              className="relative p-6 md:p-8 bg-[#181B1D]/70 border border-[#242526] hover:border-[#B59A6A]/50 transition-colors duration-500 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="font-mono text-[10px] text-[#8C8C87] tracking-[0.2em] block">
                  0{idx + 1}
                </span>

                <div className="flex items-baseline gap-1.5 flex-wrap">
                  {stat.prefix && (
                    <span className="font-mono text-xs text-[#B59A6A] font-medium tracking-wider">
                      {stat.prefix}
                    </span>
                  )}
                  <span className="font-serif text-4xl sm:text-5xl lg:text-5xl font-light text-[#FAF9F6] tracking-tight group-hover:text-[#B59A6A] transition-colors">
                    {stat.number}
                  </span>
                  {stat.suffix && (
                    <span className="font-mono text-[11px] text-[#8C8C87] font-normal tracking-wide">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-[#D8D3CA] font-medium pt-1">
                  {stat.label}
                </h3>
              </div>

              <p className="text-xs text-[#8C8C87] font-light leading-relaxed mt-6 pt-4 border-t border-[#242526]">
                {stat.caption}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

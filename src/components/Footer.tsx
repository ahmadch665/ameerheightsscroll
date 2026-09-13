import React from 'react';
import { projectData } from '../data/projectData';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="site-footer"
      className="bg-[#111315] text-[#FAF9F6] border-t border-[#242526] pt-20 pb-12 px-6 md:px-16"
      aria-label="Ameer Heights Tower 10 Official Footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#242526]">
          {/* Brand Identity Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#B59A6A]/60 flex items-center justify-center bg-[#181B1D] text-[#B59A6A] font-serif font-medium text-base">
                <span>AH</span>
              </div>
              <span className="font-serif tracking-[0.2em] text-lg font-medium text-[#FAF9F6] uppercase">
                {projectData.name} <span className="text-[#B59A6A]">{projectData.subName}</span>
              </span>
            </div>
            <p className="text-xs text-[#8C8C87] font-light leading-relaxed max-w-sm">
              A boutique collection of 30 architect-designed, fully furnished residences situated prominently at Main BZU Chowk, Multan.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[#B59A6A]">
              <span>SELLING RATE: PKR 15,000 / SQ FT</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <p className="text-[#8C8C87] uppercase tracking-[0.2em] text-[10px] mb-4">Architecture</p>
            <ul className="space-y-2.5 text-[#D8D3CA]">
              <li><a href="#overview" className="hover:text-[#B59A6A] transition-colors">The Residence</a></li>
              <li><a href="#residences" className="hover:text-[#B59A6A] transition-colors">Residence Typologies</a></li>
              <li><a href="#inventory" className="hover:text-[#B59A6A] transition-colors">Apartment Inventory</a></li>
              <li><a href="#furnished" className="hover:text-[#B59A6A] transition-colors">Furnished Inclusions</a></li>
              <li><a href="#architecture" className="hover:text-[#B59A6A] transition-colors">Building Form & Facade</a></li>
              <li><a href="#location" className="hover:text-[#B59A6A] transition-colors">Geographic Position</a></li>
            </ul>
          </div>

          {/* Project Details Column */}
          <div className="lg:col-span-4 space-y-3 font-mono text-xs text-[#8C8C87]">
            <p className="uppercase tracking-[0.2em] text-[10px] mb-4 text-[#8C8C87]">Site Address</p>
            <p className="text-[#FAF9F6]">{projectData.location.address}</p>
            <p>{projectData.location.landmark}</p>
            <p>{projectData.location.city}, {projectData.location.province}, {projectData.location.country}</p>
            <p className="text-[#B59A6A] pt-2">{projectData.location.coordinatesText}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#8C8C87]">
          <p>© {new Date().getFullYear()} {projectData.name} {projectData.subName}. All architectural and project rights reserved.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-[#FAF9F6] transition-colors uppercase tracking-widest text-[10px]"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#B59A6A]" />
          </button>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { projectData } from '../data/projectData';
import { MapPin, Navigation, Compass, ExternalLink } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${projectData.location.address}, ${projectData.location.city}, ${projectData.location.country}`
  )}`;

  return (
    <section
      id="location"
      className="relative bg-[#181B1D] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 border-t border-[#242526]"
      aria-label="Ameer Heights Location at Main BZU Chowk Multan"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">
                08 / GEOGRAPHIC POSITIONING
              </span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal uppercase tracking-wide text-[#FAF9F6]">
              Connected To Multan.
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#8C8C87]">
            <Compass className="w-4 h-4 text-[#B59A6A]" />
            <span>{projectData.location.coordinatesText}</span>
          </div>
        </div>

        {/* Map & Context Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Location Summary */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-10 bg-[#111315] border border-[#242526]">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] text-[#B59A6A] uppercase tracking-[0.25em] block mb-2">
                  Official Project Address
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] uppercase tracking-wider">
                  {projectData.location.address}
                </h3>
                <p className="font-mono text-xs text-[#8C8C87] uppercase tracking-widest mt-1">
                  {projectData.location.city}, {projectData.location.province}, {projectData.location.country}
                </p>
              </div>

              <div className="w-12 h-[1px] bg-[#B59A6A]" />

              <p className="text-sm text-[#8C8C87] font-light leading-relaxed">
                Positioned at Main BZU Chowk on Bosan Road — one of Multan's most vital thoroughfares. The location provides direct, unhindered transit between the city's commercial hubs, premier university campuses, and residential sectors.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#242526] font-mono text-xs text-[#D8D3CA]">
                <div className="flex items-center justify-between py-1.5 border-b border-[#242526]/50">
                  <span className="text-[#8C8C87]">PRIMARY ARTERY</span>
                  <span>Bosan Road Corridor</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#242526]/50">
                  <span className="text-[#8C8C87]">JUNCTION</span>
                  <span>Main BZU Chowk</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#8C8C87]">MUNICIPALITY</span>
                  <span>Multan, Punjab</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[#242526]">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-mono uppercase tracking-[0.18em] text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions via Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Architectural Dark Map Representation */}
          <div className="lg:col-span-7 bg-[#111315] border border-[#242526] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
            {/* Architectural Grid & Coordinate Lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B59A6A" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#archGrid)" />
              </svg>
            </div>

            {/* Vector schematic of Bosan Road corridor */}
            <div className="relative z-10 my-auto py-12 px-4">
              <div className="relative max-w-md mx-auto h-48 border border-[#242526] bg-[#181B1D]/80 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#8C8C87]">
                  <span>NORTH BOSAN CORRIDOR</span>
                  <span>BZU METRO AXIS</span>
                </div>

                {/* Central Pin Marker */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#B59A6A] opacity-30" />
                    <div className="w-6 h-6 rounded-full bg-[#B59A6A] flex items-center justify-center text-[#111315]">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="font-serif text-lg text-[#FAF9F6] uppercase tracking-wider mt-2">
                    Ameer Heights Tower 10
                  </h4>
                  <p className="font-mono text-[10px] text-[#B59A6A] uppercase tracking-widest mt-0.5">
                    Main BZU Chowk, Multan
                  </p>
                </div>

                <div className="flex items-center justify-between font-mono text-[9px] text-[#8C8C87]">
                  <span>LAT: 30.2585° N</span>
                  <span>LONG: 71.5149° E</span>
                </div>
              </div>
            </div>

            {/* Interactive Directions Action */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#242526] gap-4">
              <span className="font-mono text-xs text-[#8C8C87]">
                Official Site Coordinates: Bosan Road Junction
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[#B59A6A] hover:text-[#FAF9F6] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <span>Open in Map Provider</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

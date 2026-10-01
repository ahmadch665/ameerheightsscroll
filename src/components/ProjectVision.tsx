import React, { useRef } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const visionSlides = [
  { image: '/assets/project-vision-01.png', eyebrow: 'THE SETTING', title: 'An address with perspective.', detail: 'Bosan Road · Multan' },
  { image: '/assets/project-vision-02.png', eyebrow: 'THE RESIDENCES', title: 'Made for modern rhythms.', detail: 'Studio · 1 Bedroom · 2 Bedroom' },
  { image: '/assets/project-vision-03.png', eyebrow: 'THE LIFESTYLE', title: 'A quieter kind of luxury.', detail: 'Fully furnished, carefully considered' },
  { image: '/assets/project-vision-04.png', eyebrow: 'THE ARCHITECTURE', title: 'Vertical living, precisely composed.', detail: '30 exclusive residences' },
  { image: '/assets/project-vision-05.png', eyebrow: 'THE OPPORTUNITY', title: 'A future-facing Multan address.', detail: 'Prime location near BZU Chowk' }
];

export const ProjectVision: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const gallery = galleryRef.current;
    if (!gallery) return;
    drag.current = { active: true, startX: event.clientX, startScroll: gallery.scrollLeft };
    gallery.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gallery = galleryRef.current;
    if (!gallery || !drag.current.active) return;
    gallery.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX);
  };

  const handlePointerEnd = () => { drag.current.active = false; };

  return (
    <section id="project-vision" className="relative bg-[#111315] text-[#FAF9F6] py-28 md:py-36 px-6 md:px-16 border-t border-[#242526] overflow-hidden" aria-label="Project Vision">
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(181,154,106,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(181,154,106,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -top-48 right-0 h-[28rem] w-[28rem] rounded-full bg-[#B59A6A]/[0.06] blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#242526] pb-8 mb-12 gap-6">
          <ScrollReveal as="div" direction="right" delay={0}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-[#B59A6A] font-semibold tracking-[0.25em] uppercase">08 / PROJECT VISION</span>
              <span className="w-8 h-[1px] bg-[#B59A6A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal uppercase tracking-wide text-[#FAF9F6] leading-[1.1]">
              A Future With <br /><span className="italic text-[#B59A6A]">A Clearer Perspective.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal as="p" direction="up" delay={0.08} className="max-w-sm font-mono text-xs text-[#AAA69E] uppercase tracking-[0.2em] [text-shadow:0_1px_12px_rgba(17,19,21,0.7)]">
            Ameer Heights brings fully furnished, modern vertical living to Bosan Road — a considered investment in Multan's next chapter.
          </ScrollReveal>
        </div>

        <ScrollReveal as="div" direction="up" delay={0.1}>
          <div
            ref={galleryRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-5 -mx-6 px-6 md:-mx-0 md:px-0 select-none [scrollbar-width:thin] [scrollbar-color:#B59A6A_transparent] md:cursor-grab md:active:cursor-grabbing"
            aria-label="Ameer Heights project vision gallery"
          >
            {visionSlides.map((slide, index) => (
              <article key={slide.image} className="group relative flex h-[min(62svh,560px)] w-[min(88vw,680px)] shrink-0 snap-center items-center justify-center overflow-hidden rounded-sm border border-[#242526] bg-[#181B1D] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                <img src={slide.image} alt={`${slide.eyebrow}: ${slide.title}`} draggable={false} className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111315]/95 via-[#111315]/35 to-transparent px-6 pb-6 pt-20 md:px-8 md:pb-8 pointer-events-none">
                  <p className="font-mono text-[10px] tracking-[0.24em] text-[#B59A6A] uppercase mb-2">0{index + 1} / {slide.eyebrow}</p>
                  <h3 className="font-serif text-xl md:text-2xl text-[#FAF9F6] italic">{slide.title}</h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D8D3CA]">{slide.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#242526] pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8C8C87]">
          <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#B59A6A]" /> Main BZU Chowk, Bosan Road</span>
          <span className="flex items-center gap-2 text-[#B59A6A]">Drag or swipe to explore <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </section>
  );
};
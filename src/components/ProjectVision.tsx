import React, { useRef, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const visionSlides = [
  { image: '/assets/project-vision-01.png', eyebrow: 'THE SETTING', title: 'An address with perspective.', detail: 'Bosan Road · Multan' },
  { image: '/assets/project-vision-02.png', eyebrow: 'THE RESIDENCES', title: 'Made for modern rhythms.', detail: 'Studio · 1 Bedroom · 2 Bedroom' },
  { image: '/assets/project-vision-03.png', eyebrow: 'THE LIFESTYLE', title: 'A quieter kind of luxury.', detail: 'Fully furnished, carefully considered' },
  { image: '/assets/project-vision-04.png', eyebrow: 'THE ARCHITECTURE', title: 'Vertical living, precisely composed.', detail: '30 exclusive residences' },
  { image: '/assets/project-vision-05.png', eyebrow: 'THE OPPORTUNITY', title: 'A future-facing Multan address.', detail: 'Prime location near BZU Chowk' }
];

const getOffset = (index: number, activeIndex: number) => {
  const length = visionSlides.length;
  let offset = (index - activeIndex + length) % length;
  if (offset > length / 2) offset -= length;
  return offset;
};

export const ProjectVision: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ active: false, startX: 0, lastX: 0 });

  const changeSlide = (direction: number) => {
    setActiveIndex((current) => (current + direction + visionSlides.length) % visionSlides.length);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: event.clientX, lastX: event.clientX };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const distance = event.clientX - drag.current.startX;
    drag.current.lastX = event.clientX;
    setDragX(Math.max(-140, Math.min(140, distance)));
  };

  const handlePointerEnd = () => {
    if (!drag.current.active) return;
    const distance = drag.current.lastX - drag.current.startX;
    if (Math.abs(distance) > 46) changeSlide(distance < 0 ? 1 : -1);
    drag.current.active = false;
    setDragX(0);
    setIsDragging(false);
  };

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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="relative h-[min(66svh,600px)] min-h-[410px] -mx-6 overflow-hidden select-none [perspective:1200px] touch-pan-y md:mx-0 md:min-h-[500px] md:cursor-grab md:active:cursor-grabbing"
            aria-label="Ameer Heights project vision gallery"
          >
            <div className="absolute inset-x-[5%] bottom-5 h-14 rounded-[50%] bg-black/35 blur-2xl" aria-hidden="true" />
            {visionSlides.map((slide, index) => {
              const offset = getOffset(index, activeIndex);
              const distance = Math.abs(offset);
              const dragShift = dragX * (offset === 0 ? 0.14 : 0.035);
              const transform = `translate3d(calc(-50% + ${offset * 58}% + ${dragShift}px), ${distance * 18}px, ${-distance * 150}px) rotateY(${offset * -11}deg) rotateZ(${offset * -1.2}deg) scale(${1 - distance * 0.105})`;
              const isActive = offset === 0;

              return (
                <article
                  key={slide.image}
                  onClick={() => !isDragging && setActiveIndex(index)}
                  className="group absolute left-1/2 top-0 flex h-[calc(100%-1.25rem)] w-[86vw] max-w-[740px] items-center justify-center overflow-hidden rounded-sm border border-[#242526] bg-[#181B1D] shadow-[0_24px_70px_rgba(0,0,0,0.28)] md:w-[68vw]"
                  style={{
                    transform,
                    opacity: distance > 2 ? 0 : 1 - distance * 0.27,
                    filter: distance > 1 ? 'blur(1.2px)' : 'none',
                    zIndex: 10 - distance,
                    transition: isDragging ? 'none' : 'transform 760ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease, filter 520ms ease, box-shadow 760ms cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform, opacity'
                  }}
                  aria-hidden={!isActive}
                >
                  <img src={slide.image} alt={`${slide.eyebrow}: ${slide.title}`} draggable={false} className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.012]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111315]/95 via-[#111315]/35 to-transparent px-6 pb-6 pt-20 md:px-8 md:pb-8 pointer-events-none">
                    <p className="font-mono text-[10px] tracking-[0.24em] text-[#B59A6A] uppercase mb-2">0{index + 1} / {slide.eyebrow}</p>
                    <h3 className="font-serif text-xl md:text-2xl text-[#FAF9F6] italic">{slide.title}</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D8D3CA]">{slide.detail}</p>
                  </div>
                </article>
              );
            })}
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
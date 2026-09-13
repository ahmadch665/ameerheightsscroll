import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Elegant fast entrance: starts fading out at 800ms, removes at 1300ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 700);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#111315] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border border-[#B59A6A] flex items-center justify-center mx-auto text-[#B59A6A] font-serif text-xl tracking-widest">
          <span>AH</span>
        </div>
        <div>
          <p className="font-serif text-xl tracking-[0.25em] text-[#FAF9F6] uppercase">
            AMEER HEIGHTS
          </p>
          <p className="font-mono text-[10px] text-[#B59A6A] tracking-[0.3em] uppercase mt-1">
            TOWER 10 · MULTAN
          </p>
        </div>
        <div className="w-32 h-[1px] bg-[#242526] mx-auto overflow-hidden relative">
          <div className="h-full bg-[#B59A6A] animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

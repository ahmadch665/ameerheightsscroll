import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'normal' | 'interactive' | 'button' | 'view';

export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('normal');
  const [cursorText, setCursorText] = useState<string>('');

  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const animFrameId = useRef<number | null>(null);
  const lastMagneticElem = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Enable only for desktop fine-pointer devices without reduced motion
    if (typeof window === 'undefined') return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!finePointer || reducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);
    document.documentElement.classList.add('custom-cursor-enabled');

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        dotPos.current.x = e.clientX;
        dotPos.current.y = e.clientY;
      }

      // Check hover targets
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Optional subtle magnetic response for major CTAs only (max 3-4px movement)
      const magneticElem = target.closest<HTMLElement>('[data-magnetic="true"]');
      if (magneticElem) {
        const rect = magneticElem.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        const moveX = Math.max(-4, Math.min(4, relX * 0.12));
        const moveY = Math.max(-4, Math.min(4, relY * 0.12));
        magneticElem.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
        magneticElem.style.transition = 'transform 0.12s ease-out';
        lastMagneticElem.current = magneticElem;
      } else if (lastMagneticElem.current) {
        lastMagneticElem.current.style.transform = 'none';
        lastMagneticElem.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        lastMagneticElem.current = null;
      }

      const viewElem = target.closest('[data-cursor="view"], [data-cursor="explore"]');
      if (viewElem) {
        const text = viewElem.getAttribute('data-cursor-text') || 'VIEW';
        setCursorMode('view');
        setCursorText(text);
        return;
      }

      const buttonElem = target.closest('button, [role="button"], .btn-luxury-hover');
      if (buttonElem) {
        setCursorMode('button');
        setCursorText('');
        return;
      }

      const interactiveElem = target.closest('a, input, select, textarea, label, [tabindex="0"]');
      if (interactiveElem) {
        setCursorMode('interactive');
        setCursorText('');
        return;
      }

      setCursorMode('normal');
      setCursorText('');
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      if (lastMagneticElem.current) {
        lastMagneticElem.current.style.transform = 'none';
        lastMagneticElem.current = null;
      }
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth physics lerp loop
    const tick = () => {
      const ring = ringRef.current;
      const dot = dotRef.current;

      if (ring && dot && isVisible.current) {
        // Damped interpolation for elegant physical smoothness
        ringPos.current.x += (targetPos.current.x - ringPos.current.x) * 0.18;
        ringPos.current.y += (targetPos.current.y - ringPos.current.y) * 0.18;

        dotPos.current.x += (targetPos.current.x - dotPos.current.x) * 0.38;
        dotPos.current.y += (targetPos.current.y - dotPos.current.y) * 0.38;

        ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
        dot.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;

        ring.style.opacity = '1';
        dot.style.opacity = '1';
      }

      animFrameId.current = requestAnimationFrame(tick);
    };

    animFrameId.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (lastMagneticElem.current) {
        lastMagneticElem.current.style.transform = 'none';
      }
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!isEnabled) return null;

  // Visual classes based on hover mode
  const getRingClasses = () => {
    switch (cursorMode) {
      case 'view':
        return 'w-16 h-16 bg-[#181B1D]/85 border border-[#B59A6A] backdrop-blur-[2px]';
      case 'button':
        return 'w-9 h-9 border border-[#B59A6A] bg-[#B59A6A]/15';
      case 'interactive':
        return 'w-9 h-9 border border-[#B59A6A]/60 bg-[#B59A6A]/5';
      case 'normal':
      default:
        return 'w-7 h-7 border border-[#B59A6A]/40';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer Smooth Interpolated Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out flex items-center justify-center opacity-0 ${getRingClasses()}`}
      >
        {cursorMode === 'view' && (
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#FAF9F6] uppercase select-none font-medium">
            {cursorText || 'VIEW'}
          </span>
        )}
        {cursorMode === 'button' && (
          <span className="font-mono text-xs text-[#B59A6A] select-none leading-none">
            →
          </span>
        )}
      </div>

      {/* Center Precise Dot (Hides when viewing or hovering button) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#B59A6A] opacity-0 transition-opacity duration-200 pointer-events-none ${
          cursorMode === 'view' || cursorMode === 'button' ? 'scale-0' : 'scale-100'
        }`}
      />
    </div>
  );
};

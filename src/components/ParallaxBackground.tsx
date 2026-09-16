import React, { useEffect, useRef } from 'react';
import { scrollReveal, ParallaxConfig } from '../utils/scrollReveal';

interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  maxOffset?: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  className = '',
  speed = 0.04,
  maxOffset = 18,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`parallax-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const unregister = scrollReveal.registerParallax(idRef.current, el, {
      speed,
      maxOffset,
    });

    return () => {
      unregister();
    };
  }, [speed, maxOffset]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none will-change-transform ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

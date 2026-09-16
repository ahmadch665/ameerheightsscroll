/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { scrollReveal, RevealDirection } from '../utils/scrollReveal';

export interface ScrollRevealProps extends Omit<React.HTMLAttributes<HTMLElement>, 'direction'> {
  as?: React.ElementType;
  direction?: RevealDirection;
  distance?: number;
  delay?: number;
  triggerBottomFactor?: number;
  triggerSettleFactor?: number;
  children?: React.ReactNode;
}

let nextId = 0;

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  as: Component = 'div',
  direction = 'up' as RevealDirection,
  distance,
  delay = 0,
  triggerBottomFactor,
  triggerSettleFactor,
  className,
  style,
  children,
  ...rest
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const idRef = useRef<string>(`sr-${++nextId}`);

  useEffect(() => {
    if (!elementRef.current) return;

    const unregister = scrollReveal.register(idRef.current, elementRef.current, {
      direction,
      distance,
      delay,
      triggerBottomFactor,
      triggerSettleFactor,
    });

    return () => {
      unregister();
    };
  }, [direction, distance, delay, triggerBottomFactor, triggerSettleFactor]);

  return (
    <Component
      ref={elementRef}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
};

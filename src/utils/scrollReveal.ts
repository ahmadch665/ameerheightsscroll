/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * High-Performance Unified Scroll-Linked Reveal Engine
 * 
 * Provides smooth, reversible, scroll-progress-driven reveal animations
 * across all non-hero, non-location sections.
 * 
 * Key Architecture Highlights:
 * - Single passive scroll listener and single requestAnimationFrame loop.
 * - Zero React re-renders on scroll.
 * - Direct GPU-composited transform and opacity application.
 * - Zero layout thrashing: scroll uses cached untransformed element positions.
 * - Smoothstep interpolation with responsive damping for quiet luxury motion.
 * - 100% reversible: scrolling back UP smoothly glides elements back into hidden offset.
 * - Automatic pause/idle when all active elements have settled (zero CPU overhead).
 * - Full prefers-reduced-motion compliance.
 */

export type RevealDirection = 'left' | 'right' | 'up' | 'down' | 'fade';

export interface ScrollRevealConfig {
  direction?: RevealDirection;
  distance?: number;
  delay?: number; // Stagger factor (0.0 to 0.4)
  triggerBottomFactor?: number; // Viewport fraction where entrance starts (default: 0.94)
  triggerSettleFactor?: number; // Viewport fraction where entrance settles (default: 0.68)
}

export interface ScrollRevealItem {
  id: string;
  element: HTMLElement;
  direction: RevealDirection;
  distance?: number;
  delay: number;
  triggerBottomFactor: number;
  triggerSettleFactor: number;
  cachedTop: number;
  cachedHeight: number;
  targetProgress: number;
  currentProgress: number;
  currentPanX: number;
  currentPanY: number;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

class ScrollRevealManager {
  private items = new Map<string, ScrollRevealItem>();
  private isRunning = false;
  private animFrameId: number | null = null;
  private lastScrollY = -1;
  private windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  private resizeTimer: number | null = null;
  private isReducedMotion = false;

  constructor() {
    if (typeof window === 'undefined') return;

    this.checkReducedMotion();
    this.updateWindowDimensions();

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Initial recalculations to account for asset loading
    if (typeof window !== 'undefined') {
      setTimeout(() => this.recalculatePositions(), 100);
      setTimeout(() => this.recalculatePositions(), 400);
      setTimeout(() => this.recalculatePositions(), 1200);
    }
  }

  private checkReducedMotion() {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = media.matches;
    media.addEventListener?.('change', (e) => {
      this.isReducedMotion = e.matches;
      this.recalculatePositions();
    });
  }

  private updateWindowDimensions() {
    if (typeof window === 'undefined') return;
    this.windowHeight = window.innerHeight;
  }

  private handleResize = () => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.updateWindowDimensions();
      this.recalculatePositions();
      this.startLoop();
    }, 120);
  };

  private handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(scrollY - this.lastScrollY) < 0.5) return;
    this.lastScrollY = scrollY;
    this.updateAllTargets(scrollY);
    this.startLoop();
  };

  public recalculatePositions() {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    this.items.forEach((item) => {
      if (!item.element || !item.element.isConnected) return;
      const rect = item.element.getBoundingClientRect();
      // Remove current transform translation to get pure untransformed page top
      item.cachedTop = rect.top + scrollY - item.currentPanY;
      item.cachedHeight = rect.height;
    });

    this.updateAllTargets(scrollY);
  }

  private updateAllTargets(scrollY: number) {
    const wh = this.windowHeight;

    this.items.forEach((item) => {
      const viewportY = item.cachedTop - scrollY;
      const triggerBottom = wh * item.triggerBottomFactor;
      const triggerSettle = wh * item.triggerSettleFactor;

      let target = 0;
      if (viewportY >= triggerBottom) {
        target = 0;
      } else if (viewportY <= triggerSettle) {
        target = 1;
      } else {
        const rawT = (triggerBottom - viewportY) / (triggerBottom - triggerSettle);
        const stagger = item.delay;
        const adjustedT = Math.max(0, Math.min(1, (rawT - stagger) / (1 - stagger * 0.65)));
        target = adjustedT;
      }

      item.targetProgress = target;
    });
  }

  public register(
    id: string,
    element: HTMLElement,
    config: ScrollRevealConfig = {}
  ): () => void {
    const scrollY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset || 0 : 0;
    const rect = element.getBoundingClientRect();

    const triggerBottomFactor = config.triggerBottomFactor ?? 0.94;
    const triggerSettleFactor = config.triggerSettleFactor ?? 0.68;
    const delay = Math.min(config.delay ?? 0, 0.45);
    const direction = config.direction ?? 'up';

    const item: ScrollRevealItem = {
      id,
      element,
      direction,
      distance: config.distance,
      delay,
      triggerBottomFactor,
      triggerSettleFactor,
      cachedTop: rect.top + scrollY,
      cachedHeight: rect.height,
      targetProgress: 0,
      currentProgress: 0,
      currentPanX: 0,
      currentPanY: 0,
    };

    // Calculate initial target
    const viewportY = item.cachedTop - scrollY;
    const triggerBottom = this.windowHeight * triggerBottomFactor;
    const triggerSettle = this.windowHeight * triggerSettleFactor;

    if (viewportY <= triggerSettle) {
      // Element is already in visible range on initial load
      item.targetProgress = 1;
      item.currentProgress = 1;
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.willChange = 'auto';
      element.style.pointerEvents = 'auto';
    } else {
      // Below viewport: initialize to hidden offset
      item.targetProgress = 0;
      item.currentProgress = 0;
      element.style.opacity = '0';
      element.style.pointerEvents = 'none';

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      let baseDist = item.distance;
      if (baseDist === undefined) {
        baseDist = direction === 'left' || direction === 'right' ? (isMobile ? 28 : 56) : (isMobile ? 20 : 36);
      } else if (isMobile) {
        baseDist = Math.round(baseDist * 0.55);
      }

      let initX = 0;
      let initY = 0;
      if (direction === 'left') initX = -baseDist;
      else if (direction === 'right') initX = baseDist;
      else if (direction === 'up') initY = baseDist;
      else if (direction === 'down') initY = -baseDist;

      item.currentPanX = initX;
      item.currentPanY = initY;
      element.style.transform = `translate3d(${initX.toFixed(2)}px, ${initY.toFixed(2)}px, 0)`;
    }

    this.items.set(id, item);

    // Trigger update and loop
    this.startLoop();

    return () => {
      this.items.delete(id);
    };
  }

  private startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  private tick = () => {
    let hasActiveMotion = false;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    this.items.forEach((item) => {
      const delta = item.targetProgress - item.currentProgress;

      if (Math.abs(delta) > 0.0006) {
        hasActiveMotion = true;
        // Damping factor: 0.16 delivers responsive, silk-smooth easing
        item.currentProgress += delta * 0.16;
      } else {
        item.currentProgress = item.targetProgress;
      }

      const p = smoothstep(0, 1, item.currentProgress);

      if (this.isReducedMotion) {
        item.element.style.opacity = p >= 0.5 ? '1' : '0';
        item.element.style.transform = 'none';
        item.element.style.willChange = 'auto';
        return;
      }

      let baseDist = item.distance;
      if (baseDist === undefined) {
        baseDist = item.direction === 'left' || item.direction === 'right' ? (isMobile ? 28 : 56) : (isMobile ? 20 : 36);
      } else if (isMobile) {
        baseDist = Math.round(baseDist * 0.55);
      }

      let panX = 0;
      let panY = 0;

      if (item.direction === 'left') {
        panX = -baseDist * (1 - p);
      } else if (item.direction === 'right') {
        panX = baseDist * (1 - p);
      } else if (item.direction === 'up') {
        panY = baseDist * (1 - p);
      } else if (item.direction === 'down') {
        panY = -baseDist * (1 - p);
      }

      item.currentPanX = panX;
      item.currentPanY = panY;

      if (p >= 0.999) {
        // Settled state: remove transform so font rasterization is pin-sharp
        if (item.element.style.opacity !== '1') {
          item.element.style.opacity = '1';
        }
        if (item.element.style.transform !== 'none') {
          item.element.style.transform = 'none';
        }
        if (item.element.style.willChange !== 'auto') {
          item.element.style.willChange = 'auto';
        }
        if (item.element.style.pointerEvents !== 'auto') {
          item.element.style.pointerEvents = 'auto';
        }
      } else if (p <= 0.001) {
        // Hidden state
        if (item.element.style.opacity !== '0') {
          item.element.style.opacity = '0';
        }
        const transformStr = `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0)`;
        if (item.element.style.transform !== transformStr) {
          item.element.style.transform = transformStr;
        }
        if (item.element.style.pointerEvents !== 'none') {
          item.element.style.pointerEvents = 'none';
        }
      } else {
        // Active motion
        item.element.style.opacity = p.toFixed(3);
        item.element.style.transform = `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0)`;
        item.element.style.willChange = 'transform, opacity';
        item.element.style.pointerEvents = p > 0.35 ? 'auto' : 'none';
      }
    });

    if (hasActiveMotion) {
      this.animFrameId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
      this.animFrameId = null;
    }
  };
}

export const scrollReveal = new ScrollRevealManager();

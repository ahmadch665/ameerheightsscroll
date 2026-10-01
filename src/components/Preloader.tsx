import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

const floors = [76, 146, 216, 286, 356];

export const Preloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsFading(true), 2050);
    const removeTimer = window.setTimeout(() => setIsVisible(false), 2550);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`blueprint-loader fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#111315] transition-all duration-500 ease-out ${
        isFading ? 'pointer-events-none scale-[1.025] opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="blueprint-grid absolute inset-0" />
      <div className="relative flex w-full max-w-md flex-col items-center px-6">
        <svg viewBox="0 0 360 500" className="blueprint-building w-[min(74vw,330px)] overflow-visible" role="presentation">
          <defs>
            <linearGradient id="blueprintSweep" x1="0" x2="1">
              <stop offset="0" stopColor="#B59A6A" stopOpacity="0" />
              <stop offset="0.5" stopColor="#FAF9F6" stopOpacity="0.5" />
              <stop offset="1" stopColor="#B59A6A" stopOpacity="0" />
            </linearGradient>
            <clipPath id="blueprintFacade"><rect x="42" y="50" width="276" height="390" rx="1" /></clipPath>
          </defs>

          <g className="bp-outline" fill="none" stroke="#FAF9F6" strokeWidth="1.35" strokeLinecap="square">
            <path d="M42 440V50H138V31H220V50H318V440H42Z" />
            <path d="M138 440V31H220V440" />
            <path d="M58 440V391H126V440M235 440V391H300V440" />
            <path d="M155 440V371H203V440" />
          </g>

          {floors.map((y, index) => (
            <g key={y} className="bp-floor" style={{ animationDelay: `${280 + index * 145}ms` }} fill="none" stroke="#FAF9F6" strokeWidth="1">
              <path d={`M42 ${y}H318`} />
              <path d={`M138 ${y}H220`} stroke="#B59A6A" />
              <path d={`M50 ${y + 8}H130M228 ${y + 8}H310`} stroke="#B59A6A" strokeOpacity="0.72" />
            </g>
          ))}

          {floors.map((y, index) => (
            <g key={`windows-${y}`} className="bp-windows" style={{ animationDelay: `${660 + index * 135}ms` }} fill="none" stroke="#FAF9F6" strokeWidth="1">
              <rect x="61" y={y + 14} width="27" height="31" />
              <rect x="96" y={y + 14} width="25" height="31" />
              <rect x="153" y={y + 7} width="20" height="50" />
              <rect x="185" y={y + 7} width="20" height="50" />
              <rect x="238" y={y + 14} width="23" height="31" />
              <rect x="272" y={y + 14} width="23" height="31" />
            </g>
          ))}

          <g className="bp-details" fill="none" stroke="#B59A6A" strokeWidth="0.85" strokeOpacity="0.8">
            <path d="M48 456H312M62 465H298" />
            <path d="M32 440H328M32 435V445M328 435V445" />
            <path d="M126 56V385M231 56V385" strokeDasharray="3 5" />
          </g>
          <rect className="bp-sweep" x="20" y="10" width="82" height="450" fill="url(#blueprintSweep)" clipPath="url(#blueprintFacade)" />
        </svg>

        <BrandLogo className="bp-logo mt-3 h-16 w-16" />
        <p className="bp-caption mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF9F6] sm:text-[11px]">
          Ameer Heights - Tower 10, Multan.
        </p>
      </div>

      <style>{`
        .blueprint-loader { contain: layout paint; }
        .blueprint-grid {
          opacity: 0;
          background-image: linear-gradient(rgba(250,249,246,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(250,249,246,.08) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: bp-grid 520ms ease-out 70ms forwards;
        }
        .bp-outline { stroke-dasharray: 1600; stroke-dashoffset: 1600; animation: bp-draw 900ms cubic-bezier(.2,.8,.2,1) 260ms forwards; }
        .bp-floor { stroke-dasharray: 300; stroke-dashoffset: 300; opacity: 0; animation: bp-draw 440ms cubic-bezier(.2,.8,.2,1) forwards; }
        .bp-windows { stroke-dasharray: 620; stroke-dashoffset: 620; opacity: 0; animation: bp-draw 520ms cubic-bezier(.2,.8,.2,1) forwards; }
        .bp-details { opacity: 0; animation: bp-detail 420ms ease-out 1340ms forwards; }
        .bp-sweep { opacity: 0; transform: translateX(-130px); animation: bp-sweep 720ms ease-in-out 1450ms forwards; }
        .bp-logo { opacity: 0; transform: translateY(8px); animation: bp-caption 480ms cubic-bezier(.22,1,.36,1) 690ms forwards; }
        .bp-caption { opacity: 0; transform: translateY(8px); animation: bp-caption 480ms cubic-bezier(.22,1,.36,1) 820ms forwards; }
        @keyframes bp-grid { to { opacity: .62; } }
        @keyframes bp-draw { 0% { opacity: 0; stroke-dashoffset: 100%; } 10% { opacity: 1; } 100% { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes bp-detail { to { opacity: 1; } }
        @keyframes bp-sweep { 0% { opacity: 0; transform: translateX(-130px); } 20% { opacity: .7; } 100% { opacity: 0; transform: translateX(350px); } }
        @keyframes bp-caption { to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .blueprint-grid, .bp-outline, .bp-floor, .bp-windows, .bp-details, .bp-sweep, .bp-logo, .bp-caption { animation-duration: 1ms !important; animation-delay: 0ms !important; animation-fill-mode: forwards !important; }
        }
      `}</style>
    </div>
  );
};
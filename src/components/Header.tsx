import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { projectData } from '../data/projectData';

interface HeaderProps {
  onOpenEnquiry: (prefill?: { type?: string; size?: string }) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenEnquiry }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky backdrop when scrolled past hero threshold
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Residences', href: '#residences' },
    { label: 'Inventory', href: '#inventory' },
    { label: 'Furnished Living', href: '#furnished' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Location', href: '#location' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        id="main-navigation-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#111315]/85 backdrop-blur-md border-b border-[#B59A6A]/20 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#111315]/80 via-[#111315]/30 to-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Wordmark & Architectural Monogram */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="group flex items-center gap-3.5 focus:outline-none"
            aria-label="Ameer Heights Tower 10 Home"
          >
            <div className="w-9 h-9 border border-[#B59A6A]/60 flex items-center justify-center bg-[#181B1D] text-[#B59A6A] font-serif font-medium text-lg tracking-wider group-hover:border-[#B59A6A] transition-colors">
              <span>AH</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-[0.22em] text-[15px] font-medium text-[#FAF9F6] uppercase leading-tight group-hover:text-[#B59A6A] transition-colors">
                {projectData.name}
              </span>
              <span className="font-mono tracking-[0.28em] text-[10px] text-[#B59A6A] uppercase">
                {projectData.subName}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-[0.14em] uppercase text-[#D8D3CA]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative py-1 hover:text-[#FAF9F6] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#B59A6A] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              id="header-enquire-button"
              type="button"
              onClick={() => onOpenEnquiry()}
              className="btn-luxury-hover hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-[0.18em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] hover:text-[#111315] border border-[#F3F0E9] hover:border-[#B59A6A]"
            >
              <span>Enquire Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#FAF9F6] hover:text-[#B59A6A] transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-navigation-drawer"
        className={`fixed inset-0 z-40 bg-[#111315]/95 backdrop-blur-xl transition-all duration-500 lg:hidden flex flex-col justify-between p-8 pt-28 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-6 text-left">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#B59A6A]">
            Navigation
          </p>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-serif text-2xl tracking-[0.08em] text-[#F3F0E9] hover:text-[#B59A6A] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-[#242526] space-y-4">
          <div className="text-xs font-mono text-[#8C8C87] space-y-1">
            <p className="text-[#D8D3CA] uppercase tracking-wider">{projectData.location.address}</p>
            <p>{projectData.location.city}, {projectData.location.province}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenEnquiry();
            }}
            className="w-full py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors flex items-center justify-center gap-2"
          >
            <span>Enquire Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

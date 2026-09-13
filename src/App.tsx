/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { HeroConstruction } from './components/HeroConstruction';
import { ProjectIntro } from './components/ProjectIntro';
import { ProjectStats } from './components/ProjectStats';
import { ResidenceTypes } from './components/ResidenceTypes';
import { ApartmentInventory } from './components/ApartmentInventory';
import { FurnishedExperience } from './components/FurnishedExperience';
import { ArchitectureSection } from './components/ArchitectureSection';
import { Amenities } from './components/Amenities';
import { LocationSection } from './components/LocationSection';
import { EnquiryCTA } from './components/EnquiryCTA';
import { Footer } from './components/Footer';
import { EnquiryModal } from './components/EnquiryModal';
import { ApartmentUnit } from './types';

export default function App() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [enquiryPrefill, setEnquiryPrefill] = useState<{
    type?: string;
    size?: string;
  }>({});

  const handleOpenEnquiry = (prefill?: { type?: string; size?: string }) => {
    if (prefill) {
      setEnquiryPrefill(prefill);
    } else {
      setEnquiryPrefill({});
    }
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
  };

  const handleSelectCategory = (type: string) => {
    setSelectedTypeFilter(type);
    const target = document.querySelector('#inventory');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectUnit = (unit: ApartmentUnit) => {
    handleOpenEnquiry({
      type: unit.type,
      size: `${unit.sizeSqFt} sq ft`
    });
  };

  return (
    <div className="min-h-screen bg-[#111315] text-[#F3F0E9] selection:bg-[#B59A6A] selection:text-[#111315] antialiased">
      {/* 1-Second Architectural Preloader */}
      <Preloader />

      {/* Primary Fixed Luxury Navigation */}
      <Header onOpenEnquiry={() => handleOpenEnquiry()} />

      {/* Main Experience Flow */}
      <main id="main-content">
        {/* Cinematic Scroll-Linked Construction Hero */}
        <HeroConstruction onOpenEnquiry={() => handleOpenEnquiry()} />

        {/* Section 01: Project Statement & Narrative (Warm Ivory) */}
        <ProjectIntro />

        {/* Section 02: Key Project Specifications (Dark Charcoal) */}
        <ProjectStats />

        {/* Section 03: Residence Typologies (Studio, 1BHK, 2BHK) */}
        <ResidenceTypes
          onSelectCategory={handleSelectCategory}
          onOpenEnquiry={(prefill) => handleOpenEnquiry(prefill)}
        />

        {/* Section 04: Complete Apartment Inventory & Pricing Table */}
        <ApartmentInventory
          selectedTypeFilter={selectedTypeFilter}
          onFilterChange={setSelectedTypeFilter}
          onSelectUnit={handleSelectUnit}
        />

        {/* Section 05: Fully Furnished & Architect Designed Inclusions */}
        <FurnishedExperience />

        {/* Section 06: Architecture With Intention & Facade Form */}
        <ArchitectureSection />

        {/* Section 07: Confirmed Project Features & Amenities */}
        <Amenities />

        {/* Section 08: Geographic Positioning & Location Details */}
        <LocationSection />

        {/* Section 09: Enquiry Call to Action */}
        <EnquiryCTA onOpenEnquiry={() => handleOpenEnquiry()} />
      </main>

      {/* Minimal Luxury Architectural Footer */}
      <Footer />

      {/* Interactive Consultation & Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        prefill={enquiryPrefill}
      />
    </div>
  );
}

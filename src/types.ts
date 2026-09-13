export interface ApartmentUnit {
  id: string;
  type: 'Studio' | '1 Bedroom' | '2 Bedroom';
  sizeSqFt: number;
  unitCount: number;
  indicativePricePkr: number;
  description: string;
}

export interface ResidenceCategory {
  id: string;
  title: string;
  type: 'Studio' | '1 Bedroom' | '2 Bedroom';
  sizeRange: string;
  totalUnits: number;
  highlight: string;
  specs: string[];
}

export interface Amenity {
  id: string;
  title: string;
  category: string;
  description: string;
  isConfirmed: boolean;
}

export interface ProjectData {
  name: string;
  subName: string;
  tagline: string;
  location: {
    address: string;
    landmark: string;
    city: string;
    province: string;
    country: string;
    coordinatesText: string;
    mapQuery: string;
  };
  floors: string;
  totalUnits: number;
  ratePerSqFt: number;
  elevator: string;
  furnishingStatus: string;
  architecturePhilosophy: string[];
  residenceCategories: ResidenceCategory[];
  apartments: ApartmentUnit[];
  amenities: Amenity[];
  contact: {
    // Insert real WhatsApp number here (e.g. "923001234567" without plus or hyphens)
    whatsappNumber: string;
    whatsappDisplay: string;
    enquiryNotice: string;
  };
}

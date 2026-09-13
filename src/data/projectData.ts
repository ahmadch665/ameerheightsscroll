import { ProjectData } from '../types';

/**
 * ======================================================================
 * AMEER HEIGHTS TOWER 10 - CANONICAL PROJECT DATA
 * ======================================================================
 * All figures, square footages, inventory numbers, and rates are strictly
 * verified against official architectural documentation.
 */

// CONFIGURATION: Set the official representative WhatsApp phone number here (international format without + or spaces, e.g. "923001234567")
export const WHATSAPP_NUMBER = "923000000000"; // Replace with verified official project WhatsApp number

export const RATE_PER_SQFT = 15000; // PKR 15,000 / sq ft

export const projectData: ProjectData = {
  name: "AMEER HEIGHTS",
  subName: "TOWER 10",
  tagline: "A Private Residence in Multan",
  location: {
    address: "Main BZU Chowk",
    landmark: "BZU Chowk, Bosan Road",
    city: "Multan",
    province: "Punjab",
    country: "Pakistan",
    coordinatesText: "30.2585° N, 71.5149° E",
    mapQuery: "BZU+Chowk+Multan+Pakistan",
  },
  floors: "Ground + 3 Floors",
  totalUnits: 30,
  ratePerSqFt: RATE_PER_SQFT,
  elevator: "1 High-Speed Elevator",
  furnishingStatus: "100% Fully Furnished & Architect Designed",
  architecturePhilosophy: [
    "Modern monolithic graphite facade with warm timber-textured vertical accents",
    "Tinted floor-to-ceiling fenestration maximizing daylight while moderating thermal absorption",
    "Sculpted glass balustrades with minimalist smoked panels",
    "Central structural architectural portal unifying the vertical ascension",
    "Ground-level secure transit access with dedicated architectural foyer"
  ],
  residenceCategories: [
    {
      id: "studio",
      title: "Studio Residences",
      type: "Studio",
      sizeRange: "337 – 436 sq ft",
      totalUnits: 13,
      highlight: "Compact luxury crafted for modern professionals & executive urban living.",
      specs: [
        "Open-concept master living suite",
        "Designer kitchenette with bespoke fittings",
        "Architect-detailed modern bath",
        "Built-in wardrobe & complete furniture suite"
      ]
    },
    {
      id: "1bhk",
      title: "1 Bedroom Residences",
      type: "1 Bedroom",
      sizeRange: "474 – 773 sq ft",
      totalUnits: 16,
      highlight: "Generous one-bedroom layouts with dedicated private living zones & balconies.",
      specs: [
        "Private master bedroom suite",
        "Spacious architectural living lounge",
        "Executive dining & culinary zone",
        "Private balcony with expansive views"
      ]
    },
    {
      id: "2bhk",
      title: "2 Bedroom Penthouse Suite",
      type: "2 Bedroom",
      sizeRange: "1040 sq ft",
      totalUnits: 1,
      highlight: "The premier signature residence spanning 1,040 sq ft of bespoke comfort.",
      specs: [
        "Dual master suites with en-suite baths",
        "Expansive dual-aspect living & dining salon",
        "Generous architectural terrace / balconies",
        "Signature custom interior package & accessories"
      ]
    }
  ],
  apartments: [
    // Studio Inventory (13 units total)
    {
      id: "std-337",
      type: "Studio",
      sizeSqFt: 337,
      unitCount: 3,
      indicativePricePkr: 337 * RATE_PER_SQFT, // PKR 5,055,000
      description: "Efficiently planned executive studio with integrated living and sleeping zone."
    },
    {
      id: "std-372",
      type: "Studio",
      sizeSqFt: 372,
      unitCount: 3,
      indicativePricePkr: 372 * RATE_PER_SQFT, // PKR 5,580,000
      description: "Optimized studio floorplan with extended seating area and tailored furniture."
    },
    {
      id: "std-416",
      type: "Studio",
      sizeSqFt: 416,
      unitCount: 4,
      indicativePricePkr: 416 * RATE_PER_SQFT, // PKR 6,240,000
      description: "Generous studio residence featuring dedicated work desk and expansive glazing."
    },
    {
      id: "std-436",
      type: "Studio",
      sizeSqFt: 436,
      unitCount: 3,
      indicativePricePkr: 436 * RATE_PER_SQFT, // PKR 6,540,000
      description: "Premier studio configuration with maximized natural light and spacious dressing area."
    },

    // 1 Bedroom Inventory (16 units total)
    {
      id: "1bhk-474",
      type: "1 Bedroom",
      sizeSqFt: 474,
      unitCount: 4,
      indicativePricePkr: 474 * RATE_PER_SQFT, // PKR 7,110,000
      description: "Refined one-bedroom layout featuring partitioned lounge and master bedroom."
    },
    {
      id: "1bhk-587",
      type: "1 Bedroom",
      sizeSqFt: 587,
      unitCount: 4,
      indicativePricePkr: 587 * RATE_PER_SQFT, // PKR 8,805,000
      description: "Spacious 1BHK residence with private balcony and full dining credenza."
    },
    {
      id: "1bhk-669",
      type: "1 Bedroom",
      sizeSqFt: 669,
      unitCount: 3,
      indicativePricePkr: 669 * RATE_PER_SQFT, // PKR 10,035,000
      description: "Corner-oriented one bedroom suite with extensive window walls and storage."
    },
    {
      id: "1bhk-690",
      type: "1 Bedroom",
      sizeSqFt: 690,
      unitCount: 4,
      indicativePricePkr: 690 * RATE_PER_SQFT, // PKR 10,350,000
      description: "Expansive 1BHK featuring an extended salon lounge and executive bedroom suite."
    },
    {
      id: "1bhk-773",
      type: "1 Bedroom",
      sizeSqFt: 773,
      unitCount: 1,
      indicativePricePkr: 773 * RATE_PER_SQFT, // PKR 11,595,000
      description: "Signature 773 sq ft 1BHK residence with oversized living zone and private terrace access."
    },

    // 2 Bedroom Inventory (1 unit)
    {
      id: "2bhk-1040",
      type: "2 Bedroom",
      sizeSqFt: 1040,
      unitCount: 1,
      indicativePricePkr: 1040 * RATE_PER_SQFT, // PKR 15,600,000
      description: "The crown 2BHK residence with dual master bedrooms, expansive living salon and dual balconies."
    }
  ],
  amenities: [
    {
      id: "furnished",
      title: "Fully Furnished Residences",
      category: "Interior Craft",
      description: "Complete interior elements, custom-selected designer furniture, tailored accessories, and contemporary light installations included with every apartment.",
      isConfirmed: true
    },
    {
      id: "architect-interiors",
      title: "Architect-Designed Interiors",
      category: "Design Integrity",
      description: "Every residence is calibrated for ergonomic flow, visual proportion, and durable refinement by professional architectural interior designers.",
      isConfirmed: true
    },
    {
      id: "elevator",
      title: "High-Speed Elevator",
      category: "Vertical Transit",
      description: "Dedicated modern high-speed elevator providing seamless, quiet transit across Ground and all 3 residential levels.",
      isConfirmed: true
    },
    {
      id: "structure",
      title: "Ground + 3 Floors Boutique Scale",
      category: "Scale & Privacy",
      description: "An exclusive boutique low-rise scale of only 30 residences, ensuring heightened acoustic privacy, low foot-traffic density, and dignified community living.",
      isConfirmed: true
    },
    {
      id: "location",
      title: "Central Multan Landmark Address",
      category: "Connectivity",
      description: "Prominently positioned at Main BZU Chowk on Bosan Road — connecting effortlessly to the commercial, educational, and transit arteries of Multan.",
      isConfirmed: true
    }
  ],
  contact: {
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappDisplay: "+92 300 0000000",
    enquiryNotice: "Direct enquiries are attended to promptly by the official project advisory team."
  }
};

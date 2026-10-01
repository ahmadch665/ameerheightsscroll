export type ResidenceType = 'Studio' | '1 BHK' | '2 BHK';

export interface FloorPlanResidence {
  id: string;
  number: string;
  type: ResidenceType;
  size: number;
  status: 'Available';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorPlan {
  id: 'ground' | 'first' | 'second' | 'third';
  label: string;
  shortLabel: string;
  level: string;
  residences: FloorPlanResidence[];
}

const upperFloor = (prefix: string, threeBedroomSize: number): FloorPlanResidence[] => [
  { id: `${prefix}-01`, number: `${prefix}01`, type: '1 BHK', size: 669, status: 'Available', x: 7, y: 62, width: 35, height: 34 },
  { id: `${prefix}-02`, number: `${prefix}02`, type: 'Studio', size: 372, status: 'Available', x: 7, y: 38, width: 35, height: 20 },
  { id: `${prefix}-03`, number: `${prefix}03`, type: '1 BHK', size: threeBedroomSize, status: 'Available', x: 7, y: 8, width: 35, height: 26 },
  { id: `${prefix}-04`, number: `${prefix}04`, type: '1 BHK', size: 474, status: 'Available', x: 46, y: 8, width: 23, height: 26 },
  { id: `${prefix}-05`, number: `${prefix}05`, type: '1 BHK', size: 587, status: 'Available', x: 72, y: 8, width: 22, height: 28 },
  { id: `${prefix}-06`, number: `${prefix}06`, type: 'Studio', size: 416, status: 'Available', x: 57, y: 39, width: 37, height: 20 },
  { id: `${prefix}-07`, number: `${prefix}07`, type: 'Studio', size: 337, status: 'Available', x: 55, y: 63, width: 39, height: 18 },
  { id: `${prefix}-08`, number: `${prefix}08`, type: 'Studio', size: 436, status: 'Available', x: 55, y: 85, width: 39, height: 16 },
];

export const floorPlans: FloorPlan[] = [
  {
    id: 'ground',
    label: 'Ground Floor',
    shortLabel: 'GF',
    level: 'Level 00',
    residences: [
      { id: 'g-01', number: '01', type: '2 BHK', size: 1040, status: 'Available', x: 7, y: 70, width: 35, height: 32 },
      { id: 'g-02', number: '02', type: '1 BHK', size: 690, status: 'Available', x: 7, y: 39, width: 35, height: 26 },
      { id: 'g-03', number: '03', type: '1 BHK', size: 474, status: 'Available', x: 46, y: 8, width: 23, height: 27 },
      { id: 'g-04', number: '04', type: '1 BHK', size: 587, status: 'Available', x: 72, y: 8, width: 22, height: 29 },
      { id: 'g-05', number: '05', type: 'Studio', size: 416, status: 'Available', x: 56, y: 42, width: 38, height: 26 },
      { id: 'g-06', number: '06', type: '1 BHK', size: 773, status: 'Available', x: 57, y: 73, width: 37, height: 29 },
    ],
  },
  { id: 'first', label: 'First Floor', shortLabel: '01', level: 'Level 01', residences: upperFloor('1', 690) },
  { id: 'second', label: 'Second Floor', shortLabel: '02', level: 'Level 02', residences: upperFloor('2', 690) },
  { id: 'third', label: 'Third Floor', shortLabel: '03', level: 'Level 03', residences: upperFloor('3', 690) },
];

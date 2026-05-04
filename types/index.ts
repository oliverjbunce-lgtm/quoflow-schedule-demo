export interface DoorRow {
  id: string;
  mark: string;
  location: string;
  roomContext?: string; // e.g. "Bedroom 1", "Ensuite", "Living/Dining"
  width: string;
  height: string;
  thickness: string;
  hanging: 'LH' | 'RH' | 'Slider' | 'Bi-Fold' | string;
  frameType: 'Standard' | 'Cavity' | 'Bifold' | 'Wardrobe' | 'Custom' | string;
  doorFinish: 'Primed' | 'White' | 'RAW' | 'Custom' | string;
  doorCore: 'Poly' | 'Solid' | 'Honeycomb' | string;
  softClose: boolean;
  hardwareCode: string;
  notes: string;
}

export interface WallSpec {
  id: string;
  wallType: string;       // e.g. "Type A", "W1", "External"
  description: string;    // e.g. "90mm timber stud framing"
  thickness?: string;     // e.g. "90mm"
  framingType?: string;   // e.g. "Timber stud", "Steel stud", "Concrete block"
  cavitySuitable: boolean; // true if a cavity slider could work in this wall
  notes?: string;
}

export interface Flag {
  level: 'error' | 'warning' | 'info';
  message: string;
}

export interface GlobalSpecs {
  hingeDetails: string;
  jambStyle: 'Flat' | 'Groove';
  jambMaterial: 'MDF' | 'Pine';
  drillingRequired: boolean;
  hardwareBrand: string;
  handleHeight: string;
}

export interface QuoteData {
  jobName: string;
  clientName: string;
  siteAddress: string;
  orderNumber: string;
  requiredBy: string;
  deliveryType: 'Delivery' | 'Collection';
  globalSpecs: GlobalSpecs;
  doors: DoorRow[];
}

export interface ExtractApiResponse {
  doors: Omit<DoorRow, 'id'>[];
  walls: Omit<WallSpec, 'id'>[];
  flags: Flag[];
  error?: string;
}

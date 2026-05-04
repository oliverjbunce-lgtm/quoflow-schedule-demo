export interface DoorRow {
  id: string;
  mark: string;
  location: string;
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

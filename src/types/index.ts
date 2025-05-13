
export interface Ingredient {
  id: string;
  name: string;
  weight: number; // in grams
}

export interface Grain extends Ingredient {}

export type HopFormat = 'Pellets' | 'Cones' | 'Extract' | 'Other';
export interface Hop extends Ingredient {
  format: HopFormat;
  alphaAcid: number; // percentage
}

export type YeastType = 'Ale' | 'Lager' | 'Wild' | 'Other';
export interface Yeast extends Ingredient {
  type: YeastType;
  // attenuation?: number; // percentage
  // flocculation?: 'Low' | 'Medium' | 'High';
}

export interface Recipe {
  id: string;
  name: string;
  style: string;
  volume: number; // Liters
  initialGravity?: number; // SG e.g. 1.050
  finalGravity?: number; // SG e.g. 1.010
  colorEBC?: number; // EBC
  bitternessIBU?: number; // IBU
  alcoholABV?: number; // %
  grains: Grain[];
  hops: Hop[];
  yeast?: Yeast; // Make yeast optional or provide a default structure
  fermentationStartDate?: string; // ISO date string
  notes?: string;
  // For AI generated recipes
  instructions?: string; 
}

export interface EquipmentState {
  description: string;
}

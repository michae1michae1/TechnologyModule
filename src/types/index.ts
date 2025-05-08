export interface TechnologyRecord {
  id: string;
  technology: string;
  technologyDesc: string;
  status: 'Prototype' | 'Planning' | 'Deployment';
  outreachLevel?: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
  cost: number;
  vendor: string;
  vendorDesc: string;
  installation: string;
  techNeeds: string[];
  gapLevel: 'High' | 'Medium' | 'Low';
  resiliencyImpact: number;
  existingResiliencyScore?: number;
  geo?: { lat: number; lng: number };
}

export interface FilterState {
  installation: string[];
  technologyType: string[];
  vendor: string[];
  status: string[];
}

export interface CompareItem {
  id: string;
  fieldsToCompare: string[];
} 
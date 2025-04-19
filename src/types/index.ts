export interface TechnologyRecord {
  id: string;
  technology: string;
  status: 'Prototype' | 'Planning' | 'Deployment';
  cost: number;
  vendor: string;
  installation: string;
  techNeeds: string[];
  gapLevel: 'High' | 'Medium' | 'Low';
  resiliencyImpact: number;
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
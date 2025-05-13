'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { FilterState } from '../types';
import { useSearchParams, useRouter } from 'next/navigation';

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
  generateShareableLink: () => string;
}

const defaultFilters: FilterState = {
  installation: [],
  technologyType: [],
  vendor: [],
  status: [],
  costRange: [0, 100]
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Helper to serialize/deserialize arrays in URL params
const serializeArrayParam = (arr: string[]): string => {
  return arr.join(',');
};

const deserializeArrayParam = (param: string | null): string[] => {
  if (!param) return [];
  return param.split(',').filter(Boolean);
};

// Helper to serialize/deserialize cost range
const serializeCostRange = (range: [number, number]): string => {
  return `${range[0]},${range[1]}`;
};

const deserializeCostRange = (param: string | null): [number, number] => {
  if (!param) return [0, 100];
  const parts = param.split(',').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return [0, 100];
};

// Client component that uses useSearchParams
function FilterContextWithSearchParams({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // On mount, check URL params and initialize filters
  useEffect(() => {
    // Only run this once on client-side mount
    const installation = deserializeArrayParam(searchParams.get('installation'));
    const technologyType = deserializeArrayParam(searchParams.get('technology'));
    const vendor = deserializeArrayParam(searchParams.get('vendor'));
    const status = deserializeArrayParam(searchParams.get('status'));
    const costRange = deserializeCostRange(searchParams.get('cost'));
    
    // If we have any filter params in the URL, apply them
    if (installation.length || technologyType.length || vendor.length || status.length || 
        (costRange[0] > 0 || costRange[1] < 100)) {
      setFilters({
        installation,
        technologyType,
        vendor,
        status,
        costRange
      });
    }
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add non-empty filter arrays to URL
    if (filters.installation.length > 0) {
      params.set('installation', serializeArrayParam(filters.installation));
    }
    
    if (filters.technologyType.length > 0) {
      params.set('technology', serializeArrayParam(filters.technologyType));
    }
    
    if (filters.vendor.length > 0) {
      params.set('vendor', serializeArrayParam(filters.vendor));
    }
    
    if (filters.status.length > 0) {
      params.set('status', serializeArrayParam(filters.status));
    }
    
    // Add cost range if it's not default
    if (filters.costRange && (filters.costRange[0] > 0 || filters.costRange[1] < 100)) {
      params.set('cost', serializeCostRange(filters.costRange));
    }
    
    // Create the new URL with updated search params
    const url = new URL(window.location.href);
    url.search = params.toString();
    
    // Replace the current URL without causing a full page reload
    window.history.replaceState({}, '', url);
  }, [filters]);

  // Generate a shareable link with current filters
  const generateShareableLink = (): string => {
    const params = new URLSearchParams();
    
    // Only add non-empty filter arrays to URL
    if (filters.installation.length > 0) {
      params.set('installation', serializeArrayParam(filters.installation));
    }
    
    if (filters.technologyType.length > 0) {
      params.set('technology', serializeArrayParam(filters.technologyType));
    }
    
    if (filters.vendor.length > 0) {
      params.set('vendor', serializeArrayParam(filters.vendor));
    }
    
    if (filters.status.length > 0) {
      params.set('status', serializeArrayParam(filters.status));
    }
    
    // Add cost range if it's not default
    if (filters.costRange && (filters.costRange[0] > 0 || filters.costRange[1] < 100)) {
      params.set('cost', serializeCostRange(filters.costRange));
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    const queryString = params.toString();
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    
    // Clear URL params when filters are cleared
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearFilters, generateShareableLink }}>
      {children}
    </FilterContext.Provider>
  );
}

export function FilterProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <FilterContextWithSearchParams>
        {children}
      </FilterContextWithSearchParams>
    </Suspense>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
} 
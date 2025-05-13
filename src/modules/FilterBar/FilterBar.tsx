'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import MultiSelect from './MultiSelect';

export default function FilterBar() {
  const { filters, setFilters, clearFilters } = useFilters();
  const { filterOptions } = useTechnologyData(filters);
  
  const updateFilter = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const hasActiveFilters = 
    filters.installation.length > 0 || 
    filters.technologyType.length > 0 || 
    filters.vendor.length > 0 || 
    filters.status.length > 0;

  return (
    <div className="bg-slate-800 p-4 flex flex-wrap gap-4 items-center sticky top-0 z-10 shadow-lg">
      <div className="flex-grow-0">
        <MultiSelect
          label="Installation"
          options={filterOptions.installations.map(item => ({ value: item, label: item }))}
          values={filters.installation}
          onChange={(values) => updateFilter('installation', values)}
        />
      </div>
      
      <div className="flex-grow-0">
        <MultiSelect
          label="Technology Type"
          options={filterOptions.technologies.map(item => ({ value: item, label: item }))}
          values={filters.technologyType}
          onChange={(values) => updateFilter('technologyType', values)}
        />
      </div>
      
      <div className="flex-grow-0">
        <MultiSelect
          label="Vendor"
          options={filterOptions.vendors.map(item => ({ value: item, label: item }))}
          values={filters.vendor}
          onChange={(values) => updateFilter('vendor', values)}
        />
      </div>
      
      <div className="flex-grow-0">
        <MultiSelect
          label="Status"
          options={filterOptions.statuses.map(item => ({ value: item, label: item }))}
          values={filters.status}
          onChange={(values) => updateFilter('status', values)}
        />
      </div>
      
      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
} 
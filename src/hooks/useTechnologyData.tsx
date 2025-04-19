'use client';

import { useMemo } from 'react';
import { FilterState, TechnologyRecord } from '@/types';
import technologyRecords from '@/data/technologyRecords.json';

export function useTechnologyData(filters: FilterState) {
  const records = technologyRecords as TechnologyRecord[];
  
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Filter by installation
      if (filters.installation.length > 0 && !filters.installation.includes(record.installation)) {
        return false;
      }
      
      // Filter by technology type (using the technology field)
      if (filters.technologyType.length > 0 && !filters.technologyType.includes(record.technology)) {
        return false;
      }
      
      // Filter by vendor
      if (filters.vendor.length > 0 && !filters.vendor.includes(record.vendor)) {
        return false;
      }
      
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(record.status)) {
        return false;
      }
      
      return true;
    });
  }, [records, filters]);
  
  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const installations = [...new Set(records.map(record => record.installation))];
    const technologies = [...new Set(records.map(record => record.technology))];
    const vendors = [...new Set(records.map(record => record.vendor))];
    const statuses = [...new Set(records.map(record => record.status))];
    
    return {
      installations,
      technologies,
      vendors,
      statuses
    };
  }, [records]);
  
  return {
    allRecords: records,
    filteredRecords,
    filterOptions
  };
} 
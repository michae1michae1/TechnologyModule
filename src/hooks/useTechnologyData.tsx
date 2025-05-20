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
      
      // Filter by techNeeds
      if (filters.techNeeds.length > 0 && !record.techNeeds.some(need => filters.techNeeds.includes(need))) {
        return false;
      }
      
      // Filter by status (which now serves as "outreach" filter)
      if (filters.status.length > 0) {
        // If record has an outreachLevel, check against that
        if (record.outreachLevel) {
          if (!filters.status.includes(record.outreachLevel)) {
            return false;
          }
        } else {
          // Otherwise map the status to an outreach level and check
          const statusToOutreach = {
            'Prototype': 'Level 1',
            'Planning': 'Level 2',
            'Deployment': 'Level 4',
          };
          const outreachLevel = statusToOutreach[record.status as keyof typeof statusToOutreach] || 'Level 3';
          if (!filters.status.includes(outreachLevel)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [records, filters]);
  
  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const installations = [...new Set(records.map(record => record.installation))];
    const technologies = [...new Set(records.map(record => record.technology))];
    const vendors = [...new Set(records.map(record => record.vendor))];
    
    // Get outreach levels, prioritizing actual outreachLevel field when available
    const outreachLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
    
    // Get unique tech needs
    const techNeeds = [...new Set(records.flatMap(record => record.techNeeds))];
    
    return {
      installations,
      technologies,
      vendors,
      statuses: outreachLevels,
      techNeeds
    };
  }, [records]);
  
  return {
    allRecords: records,
    filteredRecords,
    filterOptions
  };
} 
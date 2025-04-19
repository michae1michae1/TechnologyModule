'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import { useFilters } from '@/context/FilterContext';
import { useDetails } from '@/context/DetailsContext';
import { TechnologyRecord } from '@/types';
import { motion } from 'framer-motion';
import { WorldMap } from '@/components/ui/world-map';

// Memoized marker component to prevent excessive re-renders
const InstallationMarker = memo(function InstallationMarker({
  name,
  lat,
  lng,
  count,
  isSelected,
  markerColor,
  onClick,
  onHover,
}: {
  name: string;
  lat: number;
  lng: number;
  count: number;
  isSelected: boolean;
  markerColor: string;
  onClick: () => void;
  onHover: (name: string | null, e?: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${((lng + 180) / 360) * 100}%`,
        top: `${((100 - lat) / 180) * 160}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : 10
      }}
    >
      <button
        onClick={onClick}
        onMouseEnter={(e) => onHover(name, e)}
        onMouseLeave={() => onHover(null)}
        className={`relative rounded-full transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-white ring-opacity-70 shadow-lg' 
            : 'hover:ring-1 hover:ring-white hover:ring-opacity-50'
        }`}
        style={{
          width: count > 1 ? '14px' : '8px',
          height: count > 1 ? '14px' : '8px',
          backgroundColor: markerColor,
        }}
      >
        <span className="sr-only">{name}</span>
        
        {count > 1 && (
          <span 
            className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold"
            aria-hidden="true"
          >
            {count}
          </span>
        )}
      </button>
    </div>
  );
});

// Tooltip component
const InstallationTooltip = memo(function InstallationTooltip({
  name,
  count,
  position,
  installations
}: {
  name: string;
  count: number;
  position: { left: number; top: number };
  installations: { name: string; count: number; technologies: string[] }[];
}) {
  const installation = installations.find(inst => inst.name === name);
  
  return (
    <div 
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
      style={{ 
        left: position.left,
        top: position.top - 10,
        pointerEvents: 'none'
      }}
    >
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rotate-45 bg-slate-900 -mb-1"></div>
        <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded shadow-lg min-w-[200px]">
          <div className="font-medium text-sm">{name}</div>
          <div className="text-slate-300 mt-1">{count} technologies</div>
          {installation && installation.technologies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-[10px] text-slate-400 mb-1">Technologies:</div>
              <div className="flex flex-wrap gap-1">
                {installation.technologies.slice(0, 3).map(tech => (
                  <span key={tech} className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
                {installation.technologies.length > 3 && (
                  <span className="text-[10px] text-slate-400">
                    +{installation.technologies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function MapView() {
  const { filters, setFilters } = useFilters();
  const { allRecords } = useTechnologyData(filters);
  const { setSelectedTech, openDetails } = useDetails();
  const [hoveredInstallation, setHoveredInstallation] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  
  // Calculate installation data once with proper memoization
  const installationData = useMemo(() => {
    const uniqueMap = new Map();
    const techCounts = new Map();
    const techLists = new Map<string, string[]>();
    
    allRecords.forEach(record => {
      if (record.geo && !uniqueMap.has(record.installation)) {
        uniqueMap.set(record.installation, record.geo);
      }
      
      // Pre-calculate tech counts
      const count = techCounts.get(record.installation) || 0;
      techCounts.set(record.installation, count + 1);
      
      // Store technologies for each installation
      const techs = techLists.get(record.installation) || [];
      if (!techs.includes(record.technology)) {
        techs.push(record.technology);
        techLists.set(record.installation, techs);
      }
    });
    
    return Array.from(uniqueMap.entries()).map(([name, geo]) => ({
      name,
      ...geo,
      count: techCounts.get(name) || 0,
      technologies: techLists.get(name) || []
    }));
  }, [allRecords]);
  
  // Handle hover with client-side coordinates
  const handleMarkerHover = useCallback((installationName: string | null, e?: React.MouseEvent) => {
    setHoveredInstallation(installationName);
    
    if (installationName && e) {
      // Store the mouse position for the tooltip
      setTooltipPosition({
        left: e.clientX,
        top: e.clientY
      });
    }
  }, []);
  
  // Handle installation click with debounce
  const handleInstallationClick = useCallback((installationName: string) => {
    // Find all technologies at this installation
    const technologies = allRecords.filter(
      record => record.installation === installationName
    );
    
    if (technologies.length > 0) {
      // If this is already selected, toggle it
      if (filters.installation.includes(installationName)) {
        // Remove from the filter if already included
        setFilters(prev => ({
          ...prev,
          installation: prev.installation.filter(inst => inst !== installationName)
        }));
      } else {
        // Add to existing selection
        setFilters(prev => ({
          ...prev,
          installation: [...prev.installation, installationName]
        }));
      }
      
      // Select the first technology for details
      setSelectedTech(technologies[0]);
      openDetails();
    }
  }, [allRecords, filters.installation, setFilters, setSelectedTech, openDetails]);
  
  // Get marker color - memoize based on filters
  const getMarkerColors = useMemo(() => {
    const colorMap = new Map();
    
    installationData.forEach(installation => {
      if (filters.installation.length > 0) {
        colorMap.set(
          installation.name, 
          filters.installation.includes(installation.name) 
            ? '#3b82f6' // blue-500
            : '#6b7280' // gray-500
        );
      } else {
        colorMap.set(installation.name, '#f43f5e'); // rose-500
      }
    });
    
    return colorMap;
  }, [installationData, filters.installation]);

  // Find the currently hovered installation
  const hoveredInstallationData = useMemo(() => {
    if (!hoveredInstallation) return null;
    return installationData.find(inst => inst.name === hoveredInstallation);
  }, [hoveredInstallation, installationData]);

  return (
    <div className="w-full p-4 relative bg-slate-950">
      <div className="relative w-full aspect-[16/5] overflow-hidden border-2 border-slate-700 rounded-lg shadow-lg">
        <div className="absolute top-4 left-4 z-10 bg-slate-800 bg-opacity-80 p-2 rounded-md shadow-md border border-slate-700">
          <h2 className="text-white font-semibold">Installation Map</h2>
          <div className="flex items-center mt-1 gap-2 text-xs text-slate-300">
            <span className="inline-block w-3 h-3 bg-rose-500 rounded-full"></span>
            <span>Installation</span>
          </div>
        </div>
        
        <WorldMap />
        
        {/* Installation markers */}
        <div className="absolute inset-0">
          {installationData.map(installation => (
            <InstallationMarker
              key={installation.name}
              name={installation.name}
              lat={installation.lat}
              lng={installation.lng}
              count={installation.count}
              isSelected={filters.installation.includes(installation.name)}
              markerColor={getMarkerColors.get(installation.name) || '#f43f5e'}
              onClick={() => handleInstallationClick(installation.name)}
              onHover={handleMarkerHover}
            />
          ))}
        </div>
      </div>
      
      {/* Fixed tooltip that follows the cursor */}
      {hoveredInstallationData && (
        <InstallationTooltip
          name={hoveredInstallationData.name}
          count={hoveredInstallationData.count}
          position={tooltipPosition}
          installations={installationData}
        />
      )}
    </div>
  );
}
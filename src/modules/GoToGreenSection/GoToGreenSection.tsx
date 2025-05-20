'use client';

import React, { useState, useMemo } from 'react';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import { useFilters } from '@/context/FilterContext';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function GoToGreenSection() {
  const { filters } = useFilters();
  const { allRecords } = useTechnologyData(filters);
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [techSortColumn, setTechSortColumn] = useState<string>('technology');
  const [techSortDirection, setTechSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle column header click for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Handle column header click for tech table sorting
  const handleTechSort = (column: string) => {
    if (techSortColumn === column) {
      // Toggle direction if clicking the same column
      setTechSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setTechSortColumn(column);
      setTechSortDirection('asc');
    }
  };
  
  // Get unique installations from the technology records with their stats
  const installationsData = useMemo(() => {
    const uniqueInstallations = Array.from(new Set(allRecords.map(record => record.installation)));
    
    return uniqueInstallations.sort().map(installation => {
      const installationRecords = allRecords.filter(record => record.installation === installation);
      const existingScore = installationRecords[0]?.existingResiliencyScore || 0;
      const greenScore = 80;
      const gapToGreen = existingScore >= greenScore ? 0 : greenScore - existingScore;
      const technologies = installationRecords.length;
      
      // Get the gap level from the first technology (all should have the same gap level)
      const gapLevel = installationRecords[0]?.gapLevel || 'Low';
      
      // Sort by impact and calculate technologies needed
      const sortedTechnologies = [...installationRecords].sort((a, b) => b.resiliencyImpact - a.resiliencyImpact);
      let techsNeeded = 0;
      let remainingGap = gapToGreen;
      
      if (gapToGreen > 0) {
        for (const tech of sortedTechnologies) {
          if (remainingGap <= 0) break;
          techsNeeded++;
          remainingGap -= tech.resiliencyImpact;
        }
      }
      
      return {
        name: installation,
        existingScore,
        gapToGreen,
        gapLevel,
        technologies,
        techsNeeded,
        status: existingScore >= greenScore ? 'Green' : (existingScore >= 50 ? 'Yellow' : 'Red')
      };
    });
  }, [allRecords]);
  
  // Sort the installations based on current sort settings
  const sortedInstallations = useMemo(() => {
    return [...installationsData].sort((a, b) => {
      let comparison = 0;
      
      // Sort based on the selected column
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'gapToGreen':
          comparison = a.gapToGreen - b.gapToGreen;
          break;
        case 'gapLevel':
          // Convert gapLevel to numeric for sorting
          const gapLevelValue = { 'Low': 1, 'Medium': 2, 'High': 3 };
          comparison = gapLevelValue[a.gapLevel as keyof typeof gapLevelValue] - 
                      gapLevelValue[b.gapLevel as keyof typeof gapLevelValue];
          break;
        case 'technologies':
          comparison = a.technologies - b.technologies;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [installationsData, sortColumn, sortDirection]);
  
  // Get all technologies for the selected installation
  const installationTechnologies = useMemo(() => {
    if (!selectedInstallation) return [];
    
    return allRecords.filter(record => record.installation === selectedInstallation);
  }, [selectedInstallation, allRecords]);
  
  // Calculate the current resiliency score for the installation
  const installationScore = useMemo(() => {
    if (!installationTechnologies.length) return 0;
    
    // All technologies at an installation should have the same existingResiliencyScore
    return installationTechnologies[0].existingResiliencyScore || 0;
  }, [installationTechnologies]);
  
  // Calculate the gap to reach a green score (80)
  const greenScoreGap = useMemo(() => {
    const targetGreenScore = 80;
    
    if (installationScore >= targetGreenScore) {
      return 0;
    }
    
    return targetGreenScore - installationScore;
  }, [installationScore]);
  
  // Sort technologies by resiliency impact (highest first)
  const sortedTechnologies = useMemo(() => {
    if (!installationTechnologies.length) return [];
    
    return [...installationTechnologies].sort((a, b) => b.resiliencyImpact - a.resiliencyImpact);
  }, [installationTechnologies]);
  
  // Calculate which technologies would be needed to reach the green score
  const technologiesNeededForGreen = useMemo(() => {
    if (greenScoreGap <= 0) return [];
    
    let remainingGap = greenScoreGap;
    const technologies = [];
    
    for (const tech of sortedTechnologies) {
      if (remainingGap <= 0) break;
      
      technologies.push({
        ...tech,
        contributionToGap: Math.min(tech.resiliencyImpact, remainingGap)
      });
      
      remainingGap -= tech.resiliencyImpact;
    }
    
    return technologies;
  }, [greenScoreGap, sortedTechnologies]);
  
  // Sort the technologies based on current tech sort settings
  const sortedTechnologiesForTable = useMemo(() => {
    return [...technologiesNeededForGreen].sort((a, b) => {
      let comparison = 0;
      
      // Sort based on the selected column
      switch (techSortColumn) {
        case 'technology':
          comparison = a.technology.localeCompare(b.technology);
          break;
        case 'vendor':
          comparison = a.vendor.localeCompare(b.vendor);
          break;
        case 'status':
          // Sort by outreachLevel
          const levelValue = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4 };
          const aLevel = a.outreachLevel || 'Level 1';
          const bLevel = b.outreachLevel || 'Level 1';
          comparison = levelValue[aLevel as keyof typeof levelValue] - 
                      levelValue[bLevel as keyof typeof levelValue];
          break;
        case 'impact':
          comparison = a.resiliencyImpact - b.resiliencyImpact;
          break;
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return techSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [technologiesNeededForGreen, techSortColumn, techSortDirection]);
  
  // Calculate if the installation can reach green status with current technologies
  const canReachGreen = technologiesNeededForGreen.length > 0 && 
    technologiesNeededForGreen.reduce((sum, tech) => sum + tech.resiliencyImpact, 0) >= greenScoreGap;
  
  // Calculate total cost to implement the technologies needed for green
  const totalCostForGreen = technologiesNeededForGreen.reduce((sum, tech) => sum + tech.cost, 0);
  
  // Render the gap level badge
  const renderGapLevel = (level: 'High' | 'Medium' | 'Low') => {
    const colors = {
      High: 'bg-red-500 text-white',
      Medium: 'bg-yellow-500 text-black',
      Low: 'bg-green-500 text-white',
    };
    
    return (
      <span className={`${colors[level]} px-2 py-1 rounded text-xs font-medium`}>
        {level}
      </span>
    );
  };
  
  // Main component render
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-slate-900 text-white p-4 overflow-hidden border-x border-slate-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Installation Selection Table */}
        <div className="col-span-2">
          <div className="bg-slate-800 p-4 rounded-lg h-full">
            <div className="overflow-y-auto scrollbar-hide rounded-md" style={{ maxHeight: "320px" }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-800 z-10">
                  <tr className="border-b border-slate-700">
                    <th 
                      className="text-left py-2 px-2 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort('name')}
                    >
                      Installation
                    </th>
                    <th 
                      className="text-center py-2 px-2 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort('gapToGreen')}
                    >
                      To Green
                    </th>
                    <th 
                      className="text-center py-2 px-2 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort('gapLevel')}
                    >
                      Gap Level
                    </th>
                    <th 
                      className="text-center py-2 px-2 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort('technologies')}
                    >
                      Technologies
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInstallations.map(installation => (
                    <tr 
                      key={installation.name}
                      onClick={() => setSelectedInstallation(installation.name)}
                      className={`border-b border-slate-700 cursor-pointer transition-colors ${
                        selectedInstallation === installation.name 
                          ? 'bg-blue-900/30' 
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              installation.status === 'Green' 
                                ? 'bg-green-500' 
                                : installation.status === 'Yellow' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}
                          ></div>
                          <span className="font-medium truncate">{installation.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        {installation.gapToGreen > 0 ? (
                          <span className="text-yellow-500 font-bold">+{installation.gapToGreen}</span>
                        ) : (
                          <CheckCircle2 size={16} className="text-green-500 inline" />
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {renderGapLevel(installation.gapLevel as 'High' | 'Medium' | 'Low')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="text-blue-400">{installation.technologies}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Installation Details and Strategy */}
        <div className="col-span-3">
          {!selectedInstallation ? (
            <div className="bg-slate-800 p-6 rounded-lg h-full flex flex-col items-center justify-center text-center">
              <Zap size={48} className="text-slate-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Select an Installation</h3>
              <p className="text-slate-400">
                Please select an installation from the table to see its resiliency status 
                and the technologies needed to reach green status.
              </p>
            </div>
          ) : greenScoreGap <= 0 ? (
            <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg text-center h-full flex flex-col items-center justify-center">
              <CheckCircle2 size={64} className="text-green-500 mb-3" />
              <h3 className="text-xl font-bold text-green-500 mb-2">
                {selectedInstallation} has achieved Green status!
              </h3>
              <p className="text-slate-300">
                This installation already meets or exceeds the resiliency score threshold of 80.
                Continue to maintain current systems and explore opportunities for further enhancement.
              </p>
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">Current Score</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-slate-700 rounded-full h-3 mr-2">
                      <div 
                        className={`h-3 rounded-full ${installationScore >= 80 ? 'bg-green-500' : installationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, installationScore)}%` }}
                      ></div>
                    </div>
                    <span className="text-xl font-bold">{installationScore}</span>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">Gap to Green</h3>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {greenScoreGap.toFixed(1)}
                    </div>
                    {!canReachGreen && (
                      <div title="Not enough technology impacts to reach green status">
                        <AlertTriangle size={20} className="text-yellow-500 ml-2" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">Estimated Cost</h3>
                  <div className="text-2xl font-bold">
                    ${totalCostForGreen >= 1000 ? `${(totalCostForGreen/1000).toFixed(1)}M` : `${totalCostForGreen}K`}
                  </div>
                </div>
              </div>
              
              {/* Technologies Needed Section */}
              <div className="bg-slate-800 p-4 rounded-lg flex-grow mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Recommended Technologies</h3>
                  
                  {!canReachGreen && (
                    <div className="flex items-center gap-1 text-sm text-red-400">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span>Cannot fully close gap with available technologies</span>
                    </div>
                  )}
                </div>
                
                <div className="overflow-y-auto scrollbar-hide rounded-md" style={{ maxHeight: "180px" }}>
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr className="border-b border-slate-700">
                        <th 
                          className="text-left py-2 px-3 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                          onClick={() => handleTechSort('technology')}
                        >
                          Technology
                        </th>
                        <th 
                          className="text-center py-2 px-3 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                          onClick={() => handleTechSort('vendor')}
                        >
                          Vendor
                        </th>
                        <th 
                          className="text-center py-2 px-3 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                          onClick={() => handleTechSort('status')}
                        >
                          Status
                        </th>
                        <th 
                          className="text-center py-2 px-3 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                          onClick={() => handleTechSort('impact')}
                        >
                          Impact
                        </th>
                        <th 
                          className="text-right py-2 px-3 text-xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white"
                          onClick={() => handleTechSort('cost')}
                        >
                          Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTechnologiesForTable.map(tech => (
                        <tr key={tech.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                          <td className="py-3 px-3">{tech.technology}</td>
                          <td className="py-3 px-3 text-center">{tech.vendor}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tech.outreachLevel === 'Level 4' ? 'bg-green-500 text-white' :
                              tech.outreachLevel === 'Level 3' ? 'bg-yellow-500 text-black' :
                              tech.outreachLevel === 'Level 2' ? 'bg-blue-500 text-white' :
                              'bg-purple-500 text-white'
                            }`}>
                              {tech.outreachLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-green-500">+{tech.resiliencyImpact.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            ${tech.cost >= 1000 ? `${(tech.cost/1000).toFixed(1)}M` : `${tech.cost}K`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 
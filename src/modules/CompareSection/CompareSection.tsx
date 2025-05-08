'use client';

import React, { useMemo, useState } from 'react';
import { useCompare } from '@/context/CompareContext';
import { TechnologyRecord } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import technologyRecords from '@/data/technologyRecords.json';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CompareSection() {
  const { compareItems, removeFromCompare } = useCompare();
  const records = useMemo(() => technologyRecords as TechnologyRecord[], []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get full technology records for the compare items
  const itemsToCompare = useMemo(() => {
    return compareItems.map(item => {
      const record = records.find(r => r.id === item.id);
      return {
        ...item,
        record
      };
    }).filter(item => item.record); // Filter out any items where we couldn't find the record
  }, [compareItems, records]);
  
  if (itemsToCompare.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full bg-slate-950 border-y border-slate-700">
      <div className="flex justify-between items-center p-3">
        <h2 className="text-lg font-bold text-white">Technology Comparison</h2>
        <div className="flex items-center">
          <div className="text-sm text-slate-400 mr-2">
            {itemsToCompare.length}/3 Items
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors text-slate-200"
            aria-label={isCollapsed ? "Expand comparison" : "Collapse comparison"}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="grid gap-4" style={{ 
            gridTemplateColumns: `repeat(${itemsToCompare.length}, 1fr)` 
          }}>
            <AnimatePresence>
              {itemsToCompare.map(item => (
                <motion.div
                  key={item.id}
                  className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-slate-950 border-b border-slate-700 p-2 flex justify-between items-center">
                    <h3 className="text-base font-medium text-white">{item.record?.technology}</h3>
                    <button
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      onClick={() => removeFromCompare(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-3">
                    {item.record && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Outreach</span>
                          <OutreachBadge record={item.record} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Cost</span>
                            <span className="text-xs text-slate-400">${item.record.cost >= 1000 ? `${(item.record.cost/1000).toFixed(1)}M` : `${item.record.cost}K`}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min((item.record.cost / 10000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Vendor</span>
                          <span className="text-xs text-slate-200">{item.record.vendor}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Gap Level</span>
                          <GapBadge level={item.record.gapLevel} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Resiliency</span>
                            <span className="text-xs text-white">{item.record.resiliencyImpact.toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                            <div 
                              className={getResiliencyColor(item.record.resiliencyImpact)}
                              style={{ width: `${Math.min((item.record.resiliencyImpact / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Installation</span>
                          <span className="text-xs text-slate-200">{item.record.installation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function OutreachBadge({ record }: { record: TechnologyRecord }) {
  // Define colors for outreach levels - match the same colors used in TechTable
  const colors = {
    'Level 1': 'bg-purple-500 text-white',
    'Level 2': 'bg-blue-500 text-white',
    'Level 3': 'bg-yellow-500 text-black',
    'Level 4': 'bg-green-500 text-white',
  };
  
  // Use outreachLevel if available, otherwise map from status
  let outreachLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
  
  if (record.outreachLevel) {
    outreachLevel = record.outreachLevel as 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
  } else {
    // Fallback mapping from old status values - same as in TechTable
    const statusToOutreach: Record<string, 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4'> = {
      'Prototype': 'Level 1',
      'Planning': 'Level 2',
      'Deployment': 'Level 4',
    };
    outreachLevel = statusToOutreach[record.status] || 'Level 3';
  }
  
  return (
    <span className={`${colors[outreachLevel]} px-2 py-0.5 rounded text-xs font-medium inline-block`}>
      {outreachLevel}
    </span>
  );
}

function GapBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const colors = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-yellow-500 text-black',
    Low: 'bg-green-500 text-white',
  };
  
  return (
    <span className={`${colors[level]} px-2 py-0.5 rounded text-xs font-medium inline-block`}>
      {level}
    </span>
  );
}

function getResiliencyColor(value: number) {
  // Scale is now 0-10 for resiliency impact
  if (value >= 6) return 'bg-green-500 h-2 rounded-full';
  if (value >= 3) return 'bg-yellow-500 h-2 rounded-full';
  return 'bg-red-500 h-2 rounded-full';
}
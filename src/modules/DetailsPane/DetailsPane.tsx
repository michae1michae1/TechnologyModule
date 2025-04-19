'use client';

import React, { memo, useCallback } from 'react';
import { useDetails } from '@/context/DetailsContext';
import { useCompare } from '@/context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlusCircle, MinusCircle, X } from 'lucide-react';

const TechDetails = memo(function TechDetails({
  selectedTech,
  isInCompare,
  onToggleCompare,
  onHideDetails 
}: {
  selectedTech: any;
  isInCompare: boolean;
  onToggleCompare: () => void;
  onHideDetails: () => void; 
}) {
  if (!selectedTech) return null;

  const getResiliencyColor = (value: number) => {
    if (value > 10) return 'bg-green-500';
    if (value > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCostColor = (cost: number) => {
    if (cost < 33) return 'bg-green-500';
    if (cost < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Deployment') return 'text-green-400';
    if (status === 'Planning') return 'text-blue-400';
    return 'text-purple-400';
  };

  const getGapColor = (level: string) => {
    if (level === 'Low') return 'text-green-400';
    if (level === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-bold text-white">{selectedTech.technology}</h2>
          <div className="flex items-center gap-2">
            <span className={`${getStatusColor(selectedTech.status)}`}>
              {selectedTech.status}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400 text-xs">{selectedTech.vendor}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleCompare}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            {isInCompare ? 
              <><MinusCircle size={12} /> Remove</> : 
              <><PlusCircle size={12} /> Compare</>
            }
          </button>
          <button
            onClick={onHideDetails}
            className="flex items-center justify-center p-1 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors border border-slate-700"
            aria-label="Close Details Panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main content in a 2 column grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {/* Left column */}
        <div>
          {/* Cost */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400">Cost Estimate:</span>
              <span className="text-white font-semibold">${Math.round((selectedTech.cost / 100) * 99000) + 1000}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className={`${getCostColor(selectedTech.cost)} h-1.5 rounded-full`}
                style={{ width: `${selectedTech.cost}%` }}
              ></div>
            </div>
          </div>

          {/* Installation */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Installation:</span>
            <span className="text-white">{selectedTech.installation}</span>
          </div>

          {/* Gap Level */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Gap Level:</span>
            <span className={`font-semibold ${getGapColor(selectedTech.gapLevel)}`}>
              {selectedTech.gapLevel}
            </span>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Resilience */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400">Resilience Impact:</span>
              <span className="text-white font-semibold">{selectedTech.resiliencyImpact}/15</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className={`${getResiliencyColor(selectedTech.resiliencyImpact)} h-1.5 rounded-full`}
                style={{ width: `${(selectedTech.resiliencyImpact / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Tech Needs */}
          <div>
            <div className="text-slate-400 mb-1">Technology Needs:</div>
            <div className="flex flex-wrap gap-1">
              {selectedTech.techNeeds.map((need: string) => (
                <span key={need} className="bg-slate-800 text-slate-200 text-xs px-1.5 py-0.5 rounded-sm">
                  {need}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main component with optimized rendering
export default function DetailsPane() {
  const { selectedTech, isDetailsOpen, toggleDetails } = useDetails();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const isInCompareValue = selectedTech ? isInCompare(selectedTech.id) : false;

  const handleToggleCompare = useCallback(() => {
    if (!selectedTech) return;

    if (isInCompare(selectedTech.id)) {
      removeFromCompare(selectedTech.id);
    } else {
      addToCompare({
        id: selectedTech.id,
        fieldsToCompare: ['technology', 'cost', 'gapLevel', 'resiliencyImpact', 'status', 'vendor', 'installation'],
      });
    }
  }, [selectedTech, isInCompare, removeFromCompare, addToCompare]);


  const handleHideDetails = toggleDetails;

  if (!selectedTech) {
      return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isDetailsOpen && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-slate-900 shadow-md z-20 max-h-[35vh] overflow-y-auto border-t border-slate-700"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          layout
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <TechDetails
            selectedTech={selectedTech}
            isInCompare={isInCompareValue}
            onToggleCompare={handleToggleCompare}
            onHideDetails={handleHideDetails}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
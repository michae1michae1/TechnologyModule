'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelect({ label, options, values, onChange }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValues, setLocalValues] = useState<string[]>(values);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update local values when external values change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);
  
  const handleToggleOption = (value: string) => {
    setLocalValues(prevValues => {
      if (prevValues.includes(value)) {
        return prevValues.filter(v => v !== value);
      } else {
        return [...prevValues, value];
      }
    });
    // Critical: immediately stop propagation to prevent default Radix closing behavior
    return false;
  };
  
  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalValues(options.map(option => option.value));
  };
  
  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalValues([]);
  };
  
  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(localValues);
    setIsOpen(false);
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalValues(values);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
      >
        {label} {values.length > 0 && `(${values.length})`}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <div 
            ref={contentRef}
            className="absolute top-full left-0 mt-1 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-800 rounded-md shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto"
            >
              <div className="flex justify-between mb-2 pb-2 border-b border-slate-700">
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button 
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-1">
                {options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-700 rounded-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleOption(option.value);
                    }}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${localValues.includes(option.value) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                      {localValues.includes(option.value) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-white">{option.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 pt-2 border-t border-slate-700 flex justify-end gap-2">
                <button 
                  className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-700 transition-colors"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleCancel}
          style={{ background: 'transparent' }}
        />
      )}
    </div>
  );
} 
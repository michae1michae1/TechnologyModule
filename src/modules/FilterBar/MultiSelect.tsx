'use client';

import React, { useState } from 'react';
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
  
  const handleToggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };
  
  const handleSelectAll = () => {
    onChange(options.map(option => option.value));
  };
  
  const handleClearAll = () => {
    onChange([]);
  };
  
  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button 
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
      </DropdownMenu.Trigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content 
              align="start" 
              sideOffset={5}
              asChild
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
                
                {options.map((option) => (
                  <DropdownMenu.CheckboxItem
                    key={option.value}
                    checked={values.includes(option.value)}
                    onCheckedChange={() => handleToggleOption(option.value)}
                    className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-700 rounded-sm outline-none"
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${values.includes(option.value) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                      {values.includes(option.value) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-white">{option.label}</span>
                  </DropdownMenu.CheckboxItem>
                ))}
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
} 
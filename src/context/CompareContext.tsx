'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CompareItem } from '../types';

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);

  const addToCompare = (item: CompareItem) => {
    if (compareItems.length < 3 && !isInCompare(item.id)) {
      setCompareItems([...compareItems, item]);
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  const isInCompare = (id: string) => {
    return compareItems.some(item => item.id === id);
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider 
      value={{ 
        compareItems, 
        addToCompare, 
        removeFromCompare,
        isInCompare,
        clearCompare 
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
} 
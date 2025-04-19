'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { TechnologyRecord } from '../types';

interface DetailsContextType {
  selectedTech: TechnologyRecord | null;
  setSelectedTech: React.Dispatch<React.SetStateAction<TechnologyRecord | null>>;
  isDetailsOpen: boolean;
  toggleDetails: () => void;
  openDetails: () => void;
  closeDetails: () => void;
}

const DetailsContext = createContext<DetailsContextType | undefined>(undefined);

export function DetailsProvider({ children }: { children: ReactNode }) {
  const [selectedTech, setSelectedTech] = useState<TechnologyRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Use useCallback to memoize functions
  const toggleDetails = useCallback(() => {
    setIsDetailsOpen(prev => !prev);
  }, []);

  const openDetails = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    selectedTech, 
    setSelectedTech, 
    isDetailsOpen, 
    toggleDetails,
    openDetails,
    closeDetails
  }), [selectedTech, isDetailsOpen, toggleDetails, openDetails, closeDetails]);

  return (
    <DetailsContext.Provider value={contextValue}>
      {children}
    </DetailsContext.Provider>
  );
}

export function useDetails() {
  const context = useContext(DetailsContext);
  if (context === undefined) {
    throw new Error('useDetails must be used within a DetailsProvider');
  }
  return context;
} 
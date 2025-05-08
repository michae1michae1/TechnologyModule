'use client';

import React, { useEffect } from 'react';
import MapView from '../modules/MapView/MapView';
import TechTable from '../modules/TechTable/TechTable';
import DetailsPane from '../modules/DetailsPane/DetailsPane';
import CompareSection from '../modules/CompareSection/CompareSection';
import { useDetails } from '../context/DetailsContext';
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { useOnboarding } from '@/context/OnboardingContext';

export default function Dashboard() {
  const { isDetailsOpen } = useDetails();
  const { isOnboardingOpen, openOnboarding, closeOnboarding, markOnboardingAsSeen } = useOnboarding();
  
  // Handler for closing the onboarding guide
  const handleCloseOnboarding = () => {
    closeOnboarding();
    markOnboardingAsSeen();
  };
  
  // Handler for opening the onboarding guide from the info button
  const handleInfoButtonClick = () => {
    openOnboarding();
  };
  
  return (
    <main className="flex flex-col bg-slate-950 min-h-screen max-w-[1920px] mx-auto">
      <div className="flex flex-col flex-grow">
        <section className="w-full">
          <MapView />
        </section>
        
        <section className="w-full">
          <CompareSection />
        </section>
        
        <section className="w-full flex-grow overflow-hidden">
          <TechTable />
        </section>
        
        {/* The details pane is fixed to the bottom and slides up */}
        <DetailsPane />
        
        {/* Onboarding Guide */}
        <OnboardingGuide 
          isOpen={isOnboardingOpen}
          onClose={handleCloseOnboarding}
          onInfoButtonClick={handleInfoButtonClick}
        />
      </div>
    </main>
  );
} 
'use client';

import React from 'react';
import MapView from '../modules/MapView/MapView';
import TechTable from '../modules/TechTable/TechTable';
import DetailsPane from '../modules/DetailsPane/DetailsPane';
import CompareSection from '../modules/CompareSection/CompareSection';
import { useDetails } from '../context/DetailsContext';

export default function Dashboard() {
  const { isDetailsOpen } = useDetails();
  
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
      </div>
    </main>
  );
} 
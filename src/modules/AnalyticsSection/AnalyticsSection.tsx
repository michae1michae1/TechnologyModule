'use client';

import React, { useMemo } from 'react';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import { useFilters } from '@/context/FilterContext';
import { useCompare } from '@/context/CompareContext';
import { TechnologyRecord } from '@/types';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// We need to extend the TechnologyRecord type with additional analytics fields
interface ExtendedTechnologyRecord {
  id: string;
  technology: string;
  status: 'Prototype' | 'Planning' | 'Deployment';
  cost: number;
  vendor: string;
  installation: string;
  techNeeds: string[];
  gapLevel: 'High' | 'Medium' | 'Low';
  resiliencyImpact: number;
  geo?: { lat: number; lng: number };
  // Additional analytics fields
  risk: number;         // 0-100 scale
  costEfficiency: number; // 0-100 scale
  timeToDevelop: number;  // 0-100 scale 
  resiliencyImpactPotential: number; // 0-100 scale
  criticalGapsAddressed: number;   // 0-100 scale
  capex: number;      // Capital expenditure in $M
  opex: number;       // Operational expenditure in $M/yr
  npv: number;        // Net present value in $M
  techMaturity: number; // 0-100 scale
  marketViability: number; // 0-100 scale
  suppliersReliability: number; // 0-100 scale
}

// Synthetic data generator function - for demo purposes
const enrichTechnologyData = (records: any[]): ExtendedTechnologyRecord[] => {
  return records.map(record => {
    // Generate synthetic data based on existing properties
    const riskBase = record.gapLevel === 'High' ? 70 : record.gapLevel === 'Medium' ? 50 : 30;
    const risk = Math.min(100, Math.max(0, riskBase + (Math.random() * 20 - 10)));
    
    // Cost efficiency based on actual cost (in thousands) - higher efficiency for lower cost
    const scaledCost = Math.min(record.cost, 10000); // Cap at 10M
    const costEfficiencyBase = 100 - ((scaledCost / 10000) * 100); // Inverse of scaled cost
    const costEfficiency = Math.min(100, Math.max(0, costEfficiencyBase + (Math.random() * 15 - 7.5)));
    
    const timeToDevelopBase = record.status === 'Deployment' ? 80 : record.status === 'Planning' ? 50 : 30;
    const timeToDevelop = Math.min(100, Math.max(0, timeToDevelopBase + (Math.random() * 20 - 10)));
    
    // Scale resiliency impact from 0-10 to 0-100
    const resiliencyImpactPotential = Math.min(100, Math.max(0, (record.resiliencyImpact / 10) * 100 + (Math.random() * 10 - 5)));
    
    const criticalGapsAddressedBase = record.gapLevel === 'High' ? 80 : record.gapLevel === 'Medium' ? 60 : 40;
    const criticalGapsAddressed = Math.min(100, Math.max(0, criticalGapsAddressedBase + (Math.random() * 20 - 10)));
    
    // Financial data - scale cost in thousands to millions
    const capexBase = record.cost / 1000; // Convert K to M
    const capex = parseFloat((capexBase + (Math.random() * 0.2 - 0.1)).toFixed(2));
    
    const opexBase = record.cost / 5000; // 20% of capex annually
    const opex = parseFloat((opexBase + (Math.random() * 0.1 - 0.05)).toFixed(2));
    
    // NPV calculation (simplified)
    const npvBase = capexBase * 1.5 - opexBase * 5;
    const npv = parseFloat((npvBase + (Math.random() * 2 - 1)).toFixed(2));
    
    // Tech evaluation criteria
    const techMaturityBase = record.status === 'Deployment' ? 80 : record.status === 'Planning' ? 50 : 30;
    const techMaturity = Math.min(100, Math.max(0, techMaturityBase + (Math.random() * 15 - 7.5)));
    
    const marketViabilityBase = 60 + (record.resiliencyImpact * 3);
    const marketViability = Math.min(100, Math.max(0, marketViabilityBase + (Math.random() * 15 - 7.5)));
    
    const suppliersReliabilityBase = 70; // Default base value
    const suppliersReliability = Math.min(100, Math.max(0, suppliersReliabilityBase + (Math.random() * 20 - 10)));
    
    return {
      ...record,
      risk,
      costEfficiency,
      timeToDevelop,
      resiliencyImpactPotential,
      criticalGapsAddressed,
      capex,
      opex,
      npv,
      techMaturity,
      marketViability,
      suppliersReliability
    };
  });
};

// Empty State Component for when no items are pinned
const EmptyAnalyticsState = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md shadow-lg border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">No Items to Analyze</h3>
        <p className="text-slate-400 mb-4">
          Please pin items to the comparison to see analytics. You can pin up to 3 items by clicking the pin icon in the table.
        </p>
        <div className="animate-pulse flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <line x1="12" y1="17" x2="12" y2="17.01" />
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="14" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Spider Chart Component
const SpiderChart = ({ data }: { data: ExtendedTechnologyRecord[] }) => {
  // Take only the first 5 records for clarity
  const displayedRecords = data.slice(0, 5);
  
  // Prepare data for the spider chart
  const chartData = {
    labels: ['Risk', 'Cost Efficiency', 'Time to Develop', 'Resiliency Impact', 'Critical Gaps Addressed'],
    datasets: displayedRecords.map((record, index) => {
      // Generate a unique color for each technology
      const hue = (index * 60) % 360;
      const color = `hsla(${hue}, 80%, 60%, 0.4)`;
      const borderColor = `hsla(${hue}, 80%, 50%, 0.8)`;
      
      return {
        label: record.technology,
        data: [
          record.risk,
          record.costEfficiency,
          record.timeToDevelop,
          record.resiliencyImpactPotential,
          record.criticalGapsAddressed
        ],
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: 1.5,
      };
    }),
  };
  
  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
          },
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.8)',
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 10,
          },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <div className="rounded-lg p-3 mb-4">
      <div className="w-full h-56">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Financial Details Component
const FinancialDetails = ({ data }: { data: ExtendedTechnologyRecord[] }) => {
  // Calculate averages
  const avgCapex = data.reduce((sum, item) => sum + item.capex, 0) / data.length;
  const avgOpex = data.reduce((sum, item) => sum + item.opex, 0) / data.length;
  const avgNpv = data.reduce((sum, item) => sum + item.npv, 0) / data.length;
  const totalCapex = data.reduce((sum, item) => sum + item.capex, 0);
  
  return (
    <div className="rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">Financial Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-700 rounded p-3">
          <h4 className="text-sm text-slate-400">Average CAPEX</h4>
          <p className="text-xl font-semibold">${avgCapex.toFixed(2)}M</p>
          <p className="text-xs text-slate-400">Total: ${totalCapex.toFixed(2)}M</p>
        </div>
        <div className="border border-slate-700 rounded p-3">
          <h4 className="text-sm text-slate-400">Average OPEX</h4>
          <p className="text-xl font-semibold">${avgOpex.toFixed(2)}M/yr</p>
        </div>
        <div className="border border-slate-700 rounded p-3">
          <h4 className="text-sm text-slate-400">Average NPV</h4>
          <p className="text-xl font-semibold">${avgNpv.toFixed(2)}M</p>
          <p className="text-xs text-slate-400 mt-1">{avgNpv > 0 ? 'Positive Return' : 'Negative Return'}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Projects by Investment Size</h4>
        <div className="w-full bg-slate-700 rounded-lg h-10 flex overflow-hidden">
          <div 
            className="bg-green-600 h-full" 
            style={{ width: `${(data.filter(i => i.cost < 2000).length / data.length) * 100}%` }}
            title="Under $2M"
          ></div>
          <div 
            className="bg-blue-600 h-full" 
            style={{ width: `${(data.filter(i => i.cost >= 2000 && i.cost < 5000).length / data.length) * 100}%` }}
            title="$2M - $5M"
          ></div>
          <div 
            className="bg-yellow-600 h-full" 
            style={{ width: `${(data.filter(i => i.cost >= 5000 && i.cost < 8000).length / data.length) * 100}%` }}
            title="$5M - $8M"
          ></div>
          <div 
            className="bg-red-600 h-full" 
            style={{ width: `${(data.filter(i => i.cost >= 8000).length / data.length) * 100}%` }}
            title="Over $8M"
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>&lt; $2M</span>
          <span>$2-5M</span>
          <span>$5-8M</span>
          <span>&gt; $8M</span>
        </div>
      </div>
    </div>
  );
};

// Technology Evaluation Component
const TechnologyEvaluation = ({ data }: { data: ExtendedTechnologyRecord[] }) => {
  const avgTechMaturity = data.reduce((sum, item) => sum + item.techMaturity, 0) / data.length;
  const avgMarketViability = data.reduce((sum, item) => sum + item.marketViability, 0) / data.length;
  const avgSuppliersReliability = data.reduce((sum, item) => sum + item.suppliersReliability, 0) / data.length;
  
  return (
    <div className="bg-slate-900 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Technology Evaluation Criteria</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Technology Maturity</span>
            <span className="text-sm">{avgTechMaturity.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${avgTechMaturity}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Market Viability</span>
            <span className="text-sm">{avgMarketViability.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${avgMarketViability}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Suppliers Reliability</span>
            <span className="text-sm">{avgSuppliersReliability.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${avgSuppliersReliability}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-sm font-medium">Technology Status Distribution</div>
          <div className="flex justify-between text-xs mt-2">
            <span>Prototype: {data.filter(i => i.status === 'Prototype').length}</span>
            <span>Planning: {data.filter(i => i.status === 'Planning').length}</span>
            <span>Deployment: {data.filter(i => i.status === 'Deployment').length}</span>
          </div>
        </div>
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-sm font-medium">Gap Level Distribution</div>
          <div className="flex justify-between text-xs mt-2">
            <span>Low: {data.filter(i => i.gapLevel === 'Low').length}</span>
            <span>Medium: {data.filter(i => i.gapLevel === 'Medium').length}</span>
            <span>High: {data.filter(i => i.gapLevel === 'High').length}</span>
          </div>
        </div>
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-sm font-medium">Average Resiliency Impact</div>
          <div className="text-xl text-center mt-1">
            {(data.reduce((sum, item) => sum + item.resiliencyImpact, 0) / data.length).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsSection() {
  const { filters } = useFilters();
  const { allRecords } = useTechnologyData(filters);
  const { compareItems } = useCompare();
  
  // Filter records based on the compareItems 
  const compareRecords = useMemo(() => {
    if (compareItems.length === 0) {
      // Return a subset of all records if no items are pinned
      return allRecords.slice(0, Math.min(5, allRecords.length));
    }
    
    return compareItems
      .map(item => allRecords.find(record => record.id === item.id))
      .filter(Boolean) as TechnologyRecord[];
  }, [allRecords, compareItems]);
  
  // Enrich data with analytics fields
  const enrichedData = useMemo(() => {
    return enrichTechnologyData(compareRecords);
  }, [compareRecords]);
  
  // If no items are pinned, show the empty state
  if (compareRecords.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-slate-900 text-white p-4 overflow-hidden border-x border-slate-700"
      >
        <EmptyAnalyticsState />
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-slate-900 text-white p-4 overflow-hidden border-x border-slate-700"
    >
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpiderChart data={enrichedData} />
        <FinancialDetails data={enrichedData} />
      </div>
      
      <TechnologyEvaluation data={enrichedData} />
    </motion.div>
  );
} 
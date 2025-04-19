'use client';

import React from 'react';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import { useFilters } from '@/context/FilterContext';
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
    
    const costEfficiencyBase = 100 - record.cost; // Inverse of cost
    const costEfficiency = Math.min(100, Math.max(0, costEfficiencyBase + (Math.random() * 15 - 7.5)));
    
    const timeToDevelopBase = record.status === 'Deployment' ? 80 : record.status === 'Planning' ? 50 : 30;
    const timeToDevelop = Math.min(100, Math.max(0, timeToDevelopBase + (Math.random() * 20 - 10)));
    
    const resiliencyImpactPotential = Math.min(100, Math.max(0, record.resiliencyImpact * 7 + (Math.random() * 10 - 5)));
    
    const criticalGapsAddressedBase = record.gapLevel === 'High' ? 80 : record.gapLevel === 'Medium' ? 60 : 40;
    const criticalGapsAddressed = Math.min(100, Math.max(0, criticalGapsAddressedBase + (Math.random() * 20 - 10)));
    
    // Financial data
    const capexBase = (record.cost / 20) + 0.5; // Scale cost to $M
    const capex = parseFloat((capexBase + (Math.random() * 1 - 0.5)).toFixed(2));
    
    const opexBase = (record.cost / 100) + 0.1; // Scale to $M/yr
    const opex = parseFloat((opexBase + (Math.random() * 0.2 - 0.1)).toFixed(2));
    
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
    <div className="bg-slate-900 rounded-lg p-3 mb-4">
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
    <div className="bg-slate-900 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">Financial Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded p-3">
          <h4 className="text-sm text-slate-400">Average CAPEX</h4>
          <p className="text-xl font-semibold">${avgCapex.toFixed(2)}M</p>
          <p className="text-xs text-slate-400">Total: ${totalCapex.toFixed(2)}M</p>
        </div>
        <div className="bg-slate-800 rounded p-3">
          <h4 className="text-sm text-slate-400">Average OPEX</h4>
          <p className="text-xl font-semibold">${avgOpex.toFixed(2)}M/yr</p>
        </div>
        <div className="bg-slate-800 rounded p-3">
          <h4 className="text-sm text-slate-400">Average NPV</h4>
          <p className="text-xl font-semibold">${avgNpv.toFixed(2)}M</p>
          <p className="text-xs text-slate-400 mt-1">{avgNpv > 0 ? 'Positive Return' : 'Negative Return'}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Projects by Investment Size</h4>
        <div className="w-full bg-slate-700 rounded-lg h-10 flex overflow-hidden">
          <div className="bg-green-600 h-full" style={{ width: `${(data.filter(i => i.capex < 1).length / data.length) * 100}%` }}></div>
          <div className="bg-blue-600 h-full" style={{ width: `${(data.filter(i => i.capex >= 1 && i.capex < 5).length / data.length) * 100}%` }}></div>
          <div className="bg-yellow-600 h-full" style={{ width: `${(data.filter(i => i.capex >= 5 && i.capex < 10).length / data.length) * 100}%` }}></div>
          <div className="bg-red-600 h-full" style={{ width: `${(data.filter(i => i.capex >= 10).length / data.length) * 100}%` }}></div>
        </div>
        <div className="flex text-xs mt-1 justify-between text-slate-400">
          <span>Under $1M</span>
          <span>$1M-$5M</span>
          <span>$5M-$10M</span>
          <span>$10M+</span>
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
  const { filteredRecords } = useTechnologyData(filters);
  
  // Enrich data with analytics properties
  const enrichedData = enrichTechnologyData(filteredRecords);
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-slate-950 text-white p-4 overflow-hidden"
    >
      <h2 className="text-xl font-semibold mb-4">Technology Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpiderChart data={enrichedData} />
        <FinancialDetails data={enrichedData} />
      </div>
      
      <TechnologyEvaluation data={enrichedData} />
    </motion.div>
  );
} 
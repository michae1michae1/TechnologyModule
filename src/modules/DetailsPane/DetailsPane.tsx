'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useDetails } from '@/context/DetailsContext';
import { useCompare } from '@/context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Pin, 
  X, 
  TabletSmartphone, 
  ShieldCheck, 
  BrainCircuit, 
  AlertTriangle, 
  FileStack,
  Cpu,
  Building2,
  Share2,
  PenLine
} from 'lucide-react';
import { useState as useLocalState } from 'react';

// Mock data for the new tabbed sections
const mockGapsData = {
  'High': [
    { id: 'g1', description: 'Critical energy supply vulnerability during extreme weather events' },
    { id: 'g2', description: 'Insufficient backup power for mission-critical systems' },
    { id: 'g3', description: 'Single point of failure in primary communications infrastructure' },
    { id: 'g4', description: 'Outdated security protocols for operational technology systems' },
    { id: 'g5', description: 'Limited ability to withstand coordinated cyber attacks' }
  ],
  'Medium': [
    { id: 'g6', description: 'Aging physical infrastructure approaching end of service life' },
    { id: 'g7', description: 'Intermittent connectivity issues in remote operation areas' },
    { id: 'g8', description: 'Moderate supply chain dependencies for critical components' }
  ],
  'Low': [
    { id: 'g9', description: 'Occasional training gaps for new system operation' },
    { id: 'g10', description: 'Minor redundancy issues in secondary support systems' }
  ]
};

// Update mock strategies data to include contribution percentages
const mockStrategiesData = [
  { id: 's1', title: 'Distributed Energy Resources', description: 'Implement localized energy generation and storage systems to enhance resilience during grid outages', contributionPercent: 45 },
  { id: 's2', title: 'Adaptive Cybersecurity Framework', description: 'Deploy AI-powered threat detection with automated response capabilities to mitigate evolving threats', contributionPercent: 15 },
  { id: 's3', title: 'Redundant Communications Grid', description: 'Establish multi-modal communication pathways with automatic failover to ensure continuous operations', contributionPercent: 10 },
  { id: 's4', title: 'Critical Infrastructure Hardening', description: 'Upgrade physical infrastructure to withstand intensified climate events and potential threats', contributionPercent: 20 },
  { id: 's5', title: 'Autonomous System Backup', description: 'Integrate self-healing technologies that can operate independently during primary system failures', contributionPercent: 5 },
  { id: 's6', title: 'Supply Chain Diversification', description: 'Develop multiple sourcing pathways for critical components to reduce dependency vulnerabilities', contributionPercent: 5 }
];

// Mock technology descriptions
const mockTechnologyDescriptions: Record<string, string> = {
  'Microgrid Controller': 'Advanced digital control system that manages distributed energy resources within a microgrid, enabling intelligent load balancing, demand response, and islanding capabilities during grid outages. Provides real-time monitoring and autonomous decision-making for optimal energy flow management.',
  'Solar + Storage': 'Integrated solution combining photovoltaic solar arrays with battery energy storage systems, designed for resilient power generation and load shifting. Features intelligent power electronics for seamless grid connection or islanded operation during outages.',
  'AI Power Forecasting': 'Machine learning platform that analyzes historical data, weather patterns, and energy consumption trends to predict future power needs with 95%+ accuracy. Enables proactive energy management and optimized resource allocation.',
  'Smart Transformers': 'Digitally-enabled power transformers with real-time monitoring capabilities and adjustable voltage regulation. Features automated load management, fault detection, and remote diagnostics to prevent cascading failures.',
  'Energy Management System': 'Comprehensive software platform that provides centralized monitoring and control of energy assets across multiple facilities. Offers predictive analytics, automated optimization routines, and integration with building automation systems.',
  'Fuel Cells': 'Electrochemical energy conversion devices that generate electricity through hydrogen fuel, providing clean, efficient power with minimal emissions. Suitable for continuous baseload operation with rapid response capabilities.',
  'Edge Computing Platform': 'Distributed computing architecture that processes data near the source, reducing latency and bandwidth usage for critical applications. Enhances resilience by maintaining local control capabilities when central systems are unavailable.',
  'Predictive Maintenance Analytics': 'Advanced software solution that uses real-time sensor data and machine learning algorithms to predict equipment failures before they occur. Helps prevent unexpected outages and extends asset lifespans.',
  'Energy Storage System': 'Large-scale battery systems designed to store excess energy and discharge during peak demand or outages. Provides grid stability, frequency regulation, and backup power capabilities with millisecond response times.'
};

// Define a type for the keys of mockTechnologyDescriptions
type TechnologyKey = keyof typeof mockTechnologyDescriptions;

// Mock vendor descriptions 
const mockVendorDescriptions: Record<string, string> = {
  'PowerGrid Solutions': 'Industry leader in grid modernization technologies with over 25 years of experience delivering resilient power solutions for critical infrastructure. Known for innovative microgrid controllers and energy management systems with military-grade cybersecurity protections.',
  'ResilientPower Inc': 'Specialized provider of hardened power systems for defense and aerospace applications. Employs former DoD personnel with extensive knowledge of military installation requirements and security protocols.',
  'SolarEdge Technologies': 'Premier manufacturer of solar inverters and power optimizers with advanced grid services capabilities. Offers comprehensive monitoring platforms and smart energy management solutions designed for seamless integration.',
  'GridAI': 'Cutting-edge artificial intelligence firm focused exclusively on power systems applications. Develops proprietary forecasting algorithms and autonomous control systems for optimized grid performance under normal and emergency conditions.',
  'TechSecure Systems': 'Cybersecurity-focused technology provider specializing in protected operational technology for critical infrastructure. Implements zero-trust architectures and continuous monitoring for resilient system operation.',
  'AdvancedMicro Controls': 'Engineering firm specializing in microcontroller-based solutions for power systems integration. Known for ruggedized electronics that maintain functionality in extreme environments.',
  'CleanEnergy Systems': 'Vertically integrated clean energy provider developing next-generation fuel cell and hydrogen technologies. Maintains domestic manufacturing capabilities for key components to ensure supply chain security.',
  'StorageTech Co': 'Industry pioneer in grid-scale energy storage solutions with deployments across federal and military installations. Offers proprietary battery management systems with extended cycle life and rapid response capabilities.',
  'EdgeWorks LLC': 'Specialized provider of edge computing platforms designed specifically for energy management applications. Develops hardware and software solutions for distributed intelligence and autonomous operation.',
  'MaintainAI Solutions': 'Predictive maintenance platform provider utilizing advanced machine learning for equipment health monitoring. Specializes in critical infrastructure applications with minimal false positive rates.'
};

// Mock outreach level details
const mockOutreachDetails: Record<'Level 1' | 'Level 2' | 'Level 3' | 'Level 4', {
  description: string;
  characteristics: string[];
  requirements: string[];
  timeline: string;
}> = {
  'Level 1': {
    description: 'Initial prototype phase with limited deployment and testing',
    characteristics: [
      'Early stage development and testing',
      'Limited user feedback',
      'Focused technical validation',
      'Small-scale implementation'
    ],
    requirements: [
      'Basic functionality demonstration',
      'Initial security assessment',
      'Preliminary documentation',
      'Test environment setup'
    ],
    timeline: '3-6 months'
  },
  'Level 2': {
    description: 'Expanded testing with controlled deployment across select sites',
    characteristics: [
      'Multiple site testing',
      'Structured user feedback',
      'Integration validation',
      'Performance monitoring'
    ],
    requirements: [
      'Documented test results',
      'Security compliance review',
      'Training materials',
      'Support procedures'
    ],
    timeline: '6-12 months'
  },
  'Level 3': {
    description: 'Broad deployment with comprehensive operational validation',
    characteristics: [
      'Wide-scale implementation',
      'Full system integration',
      'Operational assessment',
      'Performance optimization'
    ],
    requirements: [
      'Full documentation suite',
      'Security authorization',
      'Training program',
      'Maintenance procedures'
    ],
    timeline: '12-18 months'
  },
  'Level 4': {
    description: 'Full operational capability with proven performance',
    characteristics: [
      'Enterprise-wide deployment',
      'Proven reliability',
      'Optimized performance',
      'Full integration'
    ],
    requirements: [
      'Operational certification',
      'Security accreditation',
      'Complete documentation',
      'Support infrastructure'
    ],
    timeline: '18-24 months'
  }
};

// Update tab options to remove documents
const tabOptions = [
  { id: 'basics', label: 'Basics', icon: <TabletSmartphone size={16} /> },
  { id: 'technology', label: 'Technology', icon: <Cpu size={16} /> },
  { id: 'vendor', label: 'Vendor', icon: <Building2 size={16} /> },
  { id: 'outreach', label: 'Outreach', icon: <Share2 size={16} /> },
  { id: 'gaps', label: 'Gaps', icon: <AlertTriangle size={16} /> },
  { id: 'strategies', label: 'Strategies', icon: <ShieldCheck size={16} /> },
  { id: 'notes', label: 'Notes', icon: <PenLine size={16} /> }
];

// Define an interface for selectedTech
interface SelectedTech {
  id: string;
  technology: string; // This could be any string
  vendor: string;
  cost: number;
  installation: string;
  gapLevel: 'High' | 'Medium' | 'Low';
  resiliencyImpact: number;
  status?: string;
  outreachLevel?: string;
  techNeeds: string[];
  vendorDesc: string;
  technologyDesc: string;
}

const TechDetails = memo(function TechDetails({
  selectedTech,
  isInCompare,
  onToggleCompare,
  onHideDetails 
}: {
  selectedTech: SelectedTech;
  isInCompare: boolean;
  onToggleCompare: () => void;
  onHideDetails: () => void; 
}) {
  const [leftActiveTab, setLeftActiveTab] = useState('basics');
  const [rightActiveTab, setRightActiveTab] = useState('gaps');
  
  // Initialize notes from localStorage
  const [notes, setNotes] = useLocalState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('techNotes');
      return savedNotes ? JSON.parse(savedNotes) : {};
    }
    return {};
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('techNotes', JSON.stringify(notes));
    }
  }, [notes]);

  if (!selectedTech) return null;

  // Update the resiliency color function for the new scale
  const getResiliencyColor = (value: number) => {
    if (value >= 5.0) return 'bg-green-500';
    if (value >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCostColor = (cost: number) => {
    const maxCost = 10000; // 10M
    const percentage = (cost / maxCost) * 100;
    if (percentage < 33) return 'bg-green-500';
    if (percentage < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOutreachColor = (level: string) => {
    const colors = {
      'Level 1': 'text-purple-500',
      'Level 2': 'text-blue-500',
      'Level 3': 'text-yellow-500',
      'Level 4': 'text-green-500',
    };
    return colors[level as keyof typeof colors] || 'text-purple-500';
  };

  const getOutreachLevel = () => {
    // Use outreachLevel if available, otherwise map from status
    if (selectedTech.outreachLevel) {
      return selectedTech.outreachLevel;
    }
    
    // Fallback mapping from old status values
    const statusToOutreach: Record<string, 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4'> = {
      'Prototype': 'Level 1',
      'Planning': 'Level 2',
      'Deployment': 'Level 4',
    };
    
    return statusToOutreach[selectedTech.status as string] || 'Level 3';
  };

  const getGapColor = (level: string) => {
    if (level === 'Low') return 'text-green-400';
    if (level === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = { ...notes, [selectedTech.id]: e.target.value };
    setNotes(newNotes);
  };

  // Update the notes rendering in both left and right content
  const renderNotesContent = () => (
    <div className="space-y-2">
      <div className="text-slate-300 font-medium">Notes</div>
      <textarea
        value={notes[selectedTech.id] || ''}
        onChange={handleNotesChange}
        placeholder="Add notes about this technology..."
        className="w-full h-24 bg-slate-800 text-slate-200 text-sm p-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
      />
    </div>
  );

  // Update renderGapLevel function to match TechTable styling
  const renderGapLevel = (level: 'High' | 'Medium' | 'Low') => {
    const colors = {
      High: 'bg-red-500 text-white',
      Medium: 'bg-yellow-500 text-black',
      Low: 'bg-green-500 text-white',
    };
    
    return (
      <span className={`${colors[level]} px-2 py-1 rounded text-xs font-medium`}>
        {level}
      </span>
    );
  };

  // Render tab content based on selected tab
  const renderLeftTabContent = () => {
    switch (leftActiveTab) {
      case 'basics':
        return (
          <>
            {/* Cost */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Cost Estimate:</span>
                <span className="text-white font-semibold">
                  {selectedTech.cost >= 1000 
                    ? `$${(selectedTech.cost/1000).toFixed(1)}M` 
                    : `$${selectedTech.cost}K`}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className={`${getCostColor(selectedTech.cost)} h-1.5 rounded-full`}
                  style={{ width: `${Math.min((selectedTech.cost / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Installation */}
            <div className="flex justify-between items-center mb-3">
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
          </>
        );
      case 'technology':
        // Display technology description
        const techDescription = mockTechnologyDescriptions[selectedTech.technology] || 
          `Detailed information about ${selectedTech.technology} technology is not available.`;
        
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">{selectedTech.technology}</div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <p className="text-slate-200 text-xs leading-relaxed">{selectedTech.technologyDesc}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-400">Technology Category:</span>
              <span className="text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded">
                {selectedTech.techNeeds[0] || "Energy"}
              </span>
            </div>
          </div>
        );
      case 'vendor':
        // Display vendor information
        const vendorDescription = mockVendorDescriptions[selectedTech.vendor] || 
          `Detailed information about ${selectedTech.vendor} is not available.`;
        
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Vendor Profile</div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="text-sm text-slate-200 mb-2">{selectedTech.vendor}</div>
              <div className="text-xs text-slate-400">{selectedTech.vendorDesc}</div>
            </div>
          </div>
        );
      case 'outreach':
        // Display outreach details
        const outreachLevel = getOutreachLevel() as keyof typeof mockOutreachDetails;
        const outreachDetails = mockOutreachDetails[outreachLevel];
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium flex items-center gap-2">
              Outreach Level: {renderOutreachBadge(outreachLevel)}
            </div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="text-sm text-slate-200 mb-2">{outreachDetails.description}</div>
              <div className="text-xs text-slate-400">Characteristics:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {outreachDetails.characteristics.map((characteristic: string) => (
                  <span key={characteristic} className="bg-slate-700 text-slate-200 text-xs px-1.5 py-0.5 rounded-sm">
                    {characteristic}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-slate-300 font-medium mt-2">Requirements:</div>
            <div className="flex flex-wrap gap-1">
              {outreachDetails.requirements.map((requirement: string) => (
                <span key={requirement} className="bg-slate-700 text-slate-200 text-xs px-1.5 py-0.5 rounded-sm">
                  {requirement}
                </span>
              ))}
            </div>
            <div className="text-slate-300 font-medium mt-2">Timeline:</div>
            <div className="text-slate-200">{outreachDetails.timeline}</div>
          </div>
        );
      case 'gaps':
        // Display gap list based on technology's gap level
        const relevantGaps = mockGapsData[selectedTech.gapLevel as keyof typeof mockGapsData] || [];
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium flex items-center gap-2">
              Identified Resiliency Gaps ({relevantGaps.length}) {renderGapLevel(selectedTech.gapLevel)}
            </div>
            {relevantGaps.length > 0 ? (
              <div className="space-y-2">
                {relevantGaps.map(gap => (
                  <div key={gap.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                    <p className="text-slate-200">{gap.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic">No gaps identified for this technology</div>
            )}
          </div>
        );
      case 'strategies':
        // Show strategies with impact contribution
        const totalImpact = selectedTech.resiliencyImpact;
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Resilience Strategies</div>
            <div className="space-y-2">
              {mockStrategiesData.map(strategy => {
                // Calculate actual impact contribution
                const impactContribution = (strategy.contributionPercent / 100) * totalImpact;
                return (
                  <div key={strategy.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="font-medium text-slate-200 mb-1 flex justify-between">
                      <span>{strategy.title}</span>
                      <span className="text-green-400">{strategy.contributionPercent}%</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{strategy.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${strategy.contributionPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400">+{impactContribution.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'notes':
        return renderNotesContent();
      default:
        return <div>Select a tab to view details</div>;
    }
  };
  
  const renderRightTabContent = () => {
    switch (rightActiveTab) {
      case 'basics':
        return (
          <>
            {/* Resilience */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Resilience Impact:</span>
                <span className="text-white font-semibold">{selectedTech.resiliencyImpact.toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className={`${getResiliencyColor(selectedTech.resiliencyImpact)} h-1.5 rounded-full`}
                  style={{ width: `${(selectedTech.resiliencyImpact / 8.0) * 100}%` }}
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
          </>
        );
      case 'technology':
        // Display technical specifications and implementation timeline
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Technology Overview</div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="text-sm text-slate-200 mb-2">{selectedTech.technology}</div>
              <div className="text-xs text-slate-400">{selectedTech.technologyDesc}</div>
            </div>
            <div className="text-slate-300 font-medium mt-2">Technical Specifications</div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Avg Power Output:</div>
                <div className="text-slate-200 text-right">{(selectedTech.cost / 10) + 5} kW</div>
                
                <div className="text-slate-400">Response Time:</div>
                <div className="text-slate-200 text-right">{selectedTech.resiliencyImpact < 8 ? '30-60s' : '< 10s'}</div>
                
                <div className="text-slate-400">Service Interval:</div>
                <div className="text-slate-200 text-right">{selectedTech.gapLevel === 'Low' ? 'Annual' : 'Quarterly'}</div>
                
                <div className="text-slate-400">Redundancy:</div>
                <div className="text-slate-200 text-right">{selectedTech.resiliencyImpact > 10 ? 'N+1' : 'N'}</div>
              </div>
            </div>
            <div className="text-slate-300 font-medium mt-2">Implementation Timeline</div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">1</div>
                  <div className="text-xs text-slate-400 mt-1">Plan</div>
                </div>
                <div className="flex-1 h-1 bg-blue-500 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">2</div>
                  <div className="text-xs text-slate-400 mt-1">Procure</div>
                </div>
                <div className="flex-1 h-1 bg-blue-500 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">3</div>
                  <div className="text-xs text-slate-400 mt-1">Install</div>
                </div>
                <div className="flex-1 h-1 bg-slate-600 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">4</div>
                  <div className="text-xs text-slate-400 mt-1">Test</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'vendor':
        // Display vendor capabilities and qualifications
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Vendor Capabilities</div>
            <div className="space-y-2">
              <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">Technical Support</span>
                  <span className="text-xs text-green-400">24/7 Available</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">Installation Services</span>
                  <span className="text-xs text-blue-400">Full Service</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: selectedTech.vendor.includes('Resilient') ? "95%" : "75%" }}></div>
                </div>
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">Security Clearance</span>
                  <span className="text-xs text-yellow-400">Secret</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
            <div className="text-slate-300 font-medium mt-1">Certifications</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded">ISO 27001</span>
              <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded">NIST 800-171</span>
              <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded">UL Listed</span>
            </div>
          </div>
        );
      case 'gaps':
        // Display all gaps categorized by severity
        const relevantGaps = mockGapsData[selectedTech.gapLevel as keyof typeof mockGapsData] || [];
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium flex items-center gap-2">
              Identified Resiliency Gaps ({relevantGaps.length}) {renderGapLevel(selectedTech.gapLevel)}
            </div>
            {relevantGaps.length > 0 ? (
              <div className="space-y-2">
                {relevantGaps.map(gap => (
                  <div key={gap.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                    <p className="text-slate-200">{gap.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic">No gaps identified for this technology</div>
            )}
          </div>
        );
      case 'strategies':
        // Show strategies with impact contribution
        const totalImpact = selectedTech.resiliencyImpact;
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Resilience Strategies</div>
            <div className="space-y-2">
              {mockStrategiesData.map(strategy => {
                // Calculate actual impact contribution
                const impactContribution = (strategy.contributionPercent / 100) * totalImpact;
                return (
                  <div key={strategy.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="font-medium text-slate-200 mb-1 flex justify-between">
                      <span>{strategy.title}</span>
                      <span className="text-green-400">{strategy.contributionPercent}%</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{strategy.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${strategy.contributionPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400">+{impactContribution.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'outreach':
        // Display outreach details
        const outreachLevel = getOutreachLevel() as keyof typeof mockOutreachDetails;
        const outreachDetails = mockOutreachDetails[outreachLevel];
        return (
          <div className="space-y-2">
            <div className="text-slate-300 font-medium flex items-center gap-2">
              Outreach Level: {renderOutreachBadge(outreachLevel)}
            </div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="text-sm text-slate-200 mb-2">{outreachDetails.description}</div>
              <div className="text-xs text-slate-400">Characteristics:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {outreachDetails.characteristics.map((characteristic: string) => (
                  <span key={characteristic} className="bg-slate-700 text-slate-200 text-xs px-1.5 py-0.5 rounded-sm">
                    {characteristic}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-slate-300 font-medium mt-2">Requirements:</div>
            <div className="flex flex-wrap gap-1">
              {outreachDetails.requirements.map((requirement: string) => (
                <span key={requirement} className="bg-slate-700 text-slate-200 text-xs px-1.5 py-0.5 rounded-sm">
                  {requirement}
                </span>
              ))}
            </div>
            <div className="text-slate-300 font-medium mt-2">Timeline:</div>
            <div className="text-slate-200">{outreachDetails.timeline}</div>
          </div>
        );
      case 'notes':
        return renderNotesContent();
      default:
        return <div>Select a tab to view details</div>;
    }
  };

  // Add a function to get outreach badge with proper colors
  const renderOutreachBadge = (level: string) => {
    const colors = {
      'Level 1': 'bg-purple-500 text-white',
      'Level 2': 'bg-blue-500 text-white',
      'Level 3': 'bg-yellow-500 text-black',
      'Level 4': 'bg-green-500 text-white',
    };
    return (
      <span className={`${colors[level as keyof typeof colors]} px-2 py-1 rounded text-xs font-medium`}>
        {level}
      </span>
    );
  };

  return (
    <div className="p-3">
      {/* Header with title, outreach level, vendor, and pin button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <h2 className="text-lg font-bold text-white truncate">{selectedTech.technology}</h2>
          <span className={`${getOutreachColor(getOutreachLevel())}`}>
            {getOutreachLevel()}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 text-xs truncate">{selectedTech.vendor}</span>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={onToggleCompare}
            className={`p-1 rounded-full ${isInCompare ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-300'} mr-2`}
            title={isInCompare ? "Remove from comparison" : "Add to comparison"}
          >
            <Pin 
              size={16} 
              fill={isInCompare ? 'currentColor' : 'none'} 
              className={isInCompare ? 'rotate-45' : ''}
            />
          </button>
          <button
            onClick={onHideDetails}
            className="flex items-center justify-center p-1.5 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors border border-slate-700"
            aria-label="Close Details Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabbed sections */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
        {/* Left column tabs */}
        <div>
          <div className="flex overflow-x-auto mb-3 pb-1 scrollbar-hide">
            {tabOptions.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-md mr-1 ${
                  leftActiveTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => setLeftActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Left tab content */}
          <div className="max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
            {renderLeftTabContent()}
          </div>
        </div>

        {/* Right column tabs */}
        <div>
          <div className="flex overflow-x-auto mb-3 pb-1 scrollbar-hide">
            {tabOptions.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-md mr-1 ${
                  rightActiveTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => setRightActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Right tab content */}
          <div className="max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
            {renderRightTabContent()}
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
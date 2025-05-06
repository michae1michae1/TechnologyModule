'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTechnologyData } from '@/hooks/useTechnologyData';
import { useFilters } from '@/context/FilterContext';
import { useDetails } from '@/context/DetailsContext';
import { useCompare } from '@/context/CompareContext';
import { TechnologyRecord } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Pin, BarChart2, Search, DollarSign, TrendingUp } from 'lucide-react';
import AnalyticsSection from '../AnalyticsSection/AnalyticsSection';

export default function TechTable() {
  const { filters, setFilters, clearFilters } = useFilters();
  const { filteredRecords, filterOptions } = useTechnologyData(filters);
  const { setSelectedTech, openDetails } = useDetails();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [costRange, setCostRange] = useState<[number, number]>([0, 100]);
  const [showCostPerImpact, setShowCostPerImpact] = useState(false);
  const [showGoToGreen, setShowGoToGreen] = useState(false);
  
  // Handle row click to view details
  const handleRowClick = (record: TechnologyRecord) => {
    setSelectedTech(record);
    openDetails();
  };
  
  // Handle pin/unpin for comparison
  const handleToggleCompare = (e: React.MouseEvent, record: TechnologyRecord) => {
    e.stopPropagation(); // Prevent row click
    
    if (isInCompare(record.id)) {
      removeFromCompare(record.id);
    } else {
      addToCompare({
        id: record.id,
        fieldsToCompare: ['technology', 'cost', 'gapLevel', 'resiliencyImpact', 'status', 'vendor', 'installation'],
      });
    }
  };
  
  // Render a cost bar with dollar value
  const renderCostBar = (cost: number) => {
    // Convert cost percentage to dollar value (scale $1K-$100K)
    const dollarValue = Math.round((cost / 100) * 99000) + 1000;
    const formattedDollar = `$${(dollarValue/1000).toFixed(0)}K`;
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${cost}%` }}
          ></div>
        </div>
        <span>{formattedDollar}</span>
      </div>
    );
  };
  
  // Render status badge (renamed to Outreach)
  const renderOutreach = (level: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4') => {
    const colors = {
      'Level 1': 'bg-purple-500 text-white',
      'Level 2': 'bg-blue-500 text-white',
      'Level 3': 'bg-yellow-500 text-black',
      'Level 4': 'bg-green-500 text-white',
    };
    
    return (
      <span className={`${colors[level]} px-2 py-1 rounded text-xs font-medium`}>
        {level}
      </span>
    );
  };
  
  // Render resiliency impact stacked bar
  const renderResiliencyStackedBar = (impact: number, existingScore: number) => {
    const totalScore = existingScore + impact;
    
    // Scale for visualization (out of 100)
    const existingScaleWidth = existingScore;
    const impactScaleWidth = impact;
    
    // Get appropriate color based on total value
    const getTotalColor = (total: number) => {
      if (total >= 80) return 'bg-green-500';
      if (total >= 30) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    // Get lighter version of the same color for impact
    const getImpactColor = (total: number) => {
      if (total >= 80) return 'bg-green-400';
      if (total >= 30) return 'bg-yellow-400';
      return 'bg-red-400';
    };
    
    const totalColor = getTotalColor(totalScore);
    const impactColor = getImpactColor(totalScore);
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5 overflow-hidden">
          {/* Existing score segment with color based on total */}
          <div 
            className={`${totalColor} h-2.5 float-left`}
            style={{ width: `${existingScaleWidth}%` }}
          ></div>
          {/* Impact segment with lighter color */}
          <div 
            className={`${impactColor} h-2.5 float-left`}
            style={{ width: `${impactScaleWidth}%` }}
          ></div>
        </div>
        <div className="flex items-center">
          <span className="text-slate-400">{existingScore}</span>
          <span className="text-green-500 ml-1">+{impact}</span>
        </div>
      </div>
    );
  };
  
  // Render "Go to Green" visualization
  const renderGoToGreenBar = (impact: number, existingScore: number) => {
    const totalScore = existingScore + impact;
    const targetScore = 80;
    const gapToGreen = Math.max(0, targetScore - existingScore);
    
    // Determine if this impact brings the score from below 80 to above 80
    const achievesGreen = existingScore < targetScore && totalScore >= targetScore;
    
    // Calculate widths as percentages
    const gapWidthPercent = (gapToGreen / targetScore) * 100;
    const impactWidthPercent = (impact / targetScore) * 100;
    
    return (
      <div className="flex items-center gap-2">
        <div className={`relative w-20 bg-gray-700 rounded-full h-2.5 overflow-hidden ${achievesGreen ? 'ring-2 ring-green-500' : ''}`}>
          {/* Gap to green segment - Just show this and the impact */}
          <div 
            className="bg-green-300 h-2.5 float-left"
            style={{ width: `${gapToGreen}%` }}
          ></div>
          {/* Impact segment */}
          <div 
            className="bg-green-500 h-2.5 float-left"
            style={{ width: `${impact}%` }}
          ></div>
          {/* Add an additional outline/highlight effect when it reaches green threshold */}
          {achievesGreen && (
            <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-green-300">{gapToGreen}</span>
          <span className="text-green-500 ml-1">+{impact}</span>
        </div>
      </div>
    );
  };
  
  // Render gap level badge
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

  // Render cost per impact bar
  const renderCostPerImpactBar = (cost: number, impact: number) => {
    if (impact === 0) {
      return <span className="text-red-500">N/A</span>;
    }
    
    const costPerImpact = cost / impact;
    const formattedCostPerImpact = `$${costPerImpact.toFixed(1)}K/pt`;
    
    // Define color and width based on cost efficiency
    // Lower cost per impact is better (more efficient)
    const getColor = (value: number) => {
      if (value < 6) return 'bg-green-500';
      if (value < 12) return 'bg-yellow-500';
      return 'bg-red-500';
    };
    
    // Scale width inversely - more efficient (lower value) gets wider bar
    // Scale from 0-20, with 20 being 0% width and 0 being 100% width
    const maxValue = 20;
    const width = Math.max(0, Math.min(100, (1 - Math.min(costPerImpact, maxValue) / maxValue) * 100));
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5">
          <div 
            className={`${getColor(costPerImpact)} h-2.5 rounded-full`} 
            style={{ width: `${width}%` }}
          ></div>
        </div>
        <span className={costPerImpact < 6 ? 'text-green-500' : costPerImpact < 12 ? 'text-yellow-500' : 'text-red-500'}>
          {formattedCostPerImpact}
        </span>
      </div>
    );
  };

  // Define table columns
  const columns: ColumnDef<TechnologyRecord>[] = useMemo(() => [
    {
      id: "pin",
      header: "Pin",
      cell: ({ row }) => (
        <button 
          className={`p-1 rounded-full ${isInCompare(row.original.id) ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-300'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCompare(e, row.original);
          }}
        >
          <Pin 
            size={16} 
            fill={isInCompare(row.original.id) ? 'currentColor' : 'none'} 
            className={isInCompare(row.original.id) ? 'rotate-45' : ''}
          />
        </button>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "technology",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Technology
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
              <ChevronUp className="h-2 w-4" />
              <ChevronDown className="h-2 w-4 -mt-1" />
            </div>
          )}
        </div>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.technology}</div>,
      filterFn: (row, id, filterValue) => {
        return filterValue.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Outreach
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
              <ChevronUp className="h-2 w-4" />
              <ChevronDown className="h-2 w-4 -mt-1" />
            </div>
          )}
        </div>
      ),
      cell: ({ row }) => {
        // Use outreachLevel if available, otherwise map from status
        if (row.original.outreachLevel) {
          return renderOutreach(row.original.outreachLevel);
        }
        
        // Fallback mapping from old status values
        const statusToOutreach = {
          'Prototype': 'Level 1',
          'Planning': 'Level 2',
          'Deployment': 'Level 4',
        };
        const outreachLevel = statusToOutreach[row.original.status as keyof typeof statusToOutreach] || 'Level 3';
        return renderOutreach(outreachLevel as 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4');
      },
      filterFn: (row, id, filterValue) => {
        // Check outreachLevel first if available
        if (row.original.outreachLevel) {
          return filterValue.includes(row.original.outreachLevel);
        }
        
        // Fallback to mapping from status
        const statusToOutreach = {
          'Prototype': 'Level 1',
          'Planning': 'Level 2',
          'Deployment': 'Level 4',
        };
        const status = row.getValue(id) as string;
        const outreachLevel = statusToOutreach[status as keyof typeof statusToOutreach] || 'Level 3';
        return filterValue.includes(outreachLevel);
      },
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vendor
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
              <ChevronUp className="h-2 w-4" />
              <ChevronDown className="h-2 w-4 -mt-1" />
            </div>
          )}
        </div>
      ),
      cell: ({ row }) => row.original.vendor,
      filterFn: (row, id, filterValue) => {
        return filterValue.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "installation",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Installation
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
              <ChevronUp className="h-2 w-4" />
              <ChevronDown className="h-2 w-4 -mt-1" />
            </div>
          )}
        </div>
      ),
      cell: ({ row }) => row.original.installation,
      filterFn: (row, id, filterValue) => {
        return filterValue.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "techNeeds",
      header: "Tech Needs",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.techNeeds.map(need => (
            <span key={need} className="bg-slate-700 px-2 py-0.5 text-xs rounded">
              {need}
            </span>
          ))}
        </div>
      ),
      filterFn: (row, id, filterValue) => {
        if (!filterValue.length) return true;
        const techNeeds = row.getValue(id) as string[];
        return techNeeds.some(need => filterValue.includes(need));
      },
    },
    {
      accessorKey: "gapLevel",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gap Level
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
              <ChevronUp className="h-2 w-4" />
              <ChevronDown className="h-2 w-4 -mt-1" />
            </div>
          )}
        </div>
      ),
      cell: ({ row }) => renderGapLevel(row.original.gapLevel),
      filterFn: (row, id, filterValue) => {
        return filterValue.includes(row.getValue(id));
      },
    },
    {
      id: "resiliencyImpact",
      accessorFn: (row) => {
        // Get the values we need, ensure they're numbers
        const impact = Number(row.resiliencyImpact) || 0;
        const existingScore = row.existingResiliencyScore !== undefined 
          ? Number(row.existingResiliencyScore) 
          : 50;
        
        // When in "Go To Green" mode, sort by points needed to reach green
        if (showGoToGreen) {
          const targetScore = 80;
          const gapToGreen = Math.max(0, targetScore - existingScore);
          return gapToGreen;
        }
        
        // In regular mode, sort by impact value
        return impact;
      },
      header: ({ column }) => (
        <div className="flex items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {showGoToGreen ? "Go-To Green" : "Resiliency Impact"}
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
                <ChevronUp className="h-2 w-4" />
                <ChevronDown className="h-2 w-4 -mt-1" />
              </div>
            )}
          </div>
          <button 
            onClick={toggleGoToGreenView} 
            className={`ml-2 p-1 rounded-full hover:bg-slate-700 ${showGoToGreen ? 'bg-green-500 text-white' : 'text-slate-300'}`}
            title={showGoToGreen ? "Show current impact" : "Show gap to reach green status"}
          >
            <BarChart2 size={16} />
          </button>
        </div>
      ),
      cell: ({ row }) => {
        const impact = Number(row.original.resiliencyImpact);
        // Use existingResiliencyScore if available, otherwise default to 50
        const existingScore = row.original.existingResiliencyScore !== undefined 
          ? Number(row.original.existingResiliencyScore) 
          : 50;
          
        return showGoToGreen 
          ? renderGoToGreenBar(impact, existingScore) 
          : renderResiliencyStackedBar(impact, existingScore);
      },
    },
    {
      id: "cost",
      accessorFn: (row) => {
        // Get the values we need, ensure they're numbers
        const cost = Number(row.cost) || 0;
        const impact = Number(row.resiliencyImpact) || 0;
        
        // When in cost per impact mode
        if (showCostPerImpact) {
          // Prevent division by zero
          if (impact <= 0) {
            return Number.MAX_VALUE; // Put at the end when sorting
          }
          
          // Return cost per impact point ($ per point of resiliency)
          return cost / impact;
        } 
        
        // In regular cost mode, sort by raw cost
        return cost;
      },
      header: ({ column }) => (
        <div className="flex items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {showCostPerImpact ? "Cost Per Impact" : "Cost"}
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <div className="ml-1 h-4 w-4 opacity-30 flex items-center">
                <ChevronUp className="h-2 w-4" />
                <ChevronDown className="h-2 w-4 -mt-1" />
              </div>
            )}
          </div>
          <button 
            onClick={toggleCostPerImpactView} 
            className={`ml-2 p-1 rounded-full hover:bg-slate-700 ${showCostPerImpact ? 'bg-blue-500 text-white' : 'text-slate-300'}`}
            title={showCostPerImpact ? "Show raw cost" : "Show cost per impact point"}
          >
            {showCostPerImpact ? <DollarSign size={16} /> : <TrendingUp size={16} />}
          </button>
        </div>
      ),
      cell: ({ row }) => {
        if (showCostPerImpact) {
          return renderCostPerImpactBar(Number(row.original.cost), Number(row.original.resiliencyImpact));
        } else {
          return renderCostBar(Number(row.original.cost));
        }
      },
    },
  ], [isInCompare, handleToggleCompare, showCostPerImpact, showGoToGreen]);
  
  // Create filter mapping from context filters to column filters
  useMemo(() => {
    const newColumnFilters: ColumnFiltersState = [];
    
    if (filters.status.length > 0) {
      newColumnFilters.push({
        id: 'status',
        value: filters.status,
      });
    }
    
    if (filters.vendor.length > 0) {
      newColumnFilters.push({
        id: 'vendor',
        value: filters.vendor,
      });
    }
    
    if (filters.installation.length > 0) {
      newColumnFilters.push({
        id: 'installation',
        value: filters.installation,
      });
    }
    
    if (filters.technologyType.length > 0) {
      newColumnFilters.push({
        id: 'technology',
        value: filters.technologyType,
      });
    }
    
    // Add cost range filter
    if (costRange[0] > 0 || costRange[1] < 100) {
      newColumnFilters.push({
        id: 'cost',
        value: costRange,
      });
    }
    
    setColumnFilters(newColumnFilters);
  }, [filters, costRange]);
  
  // Setup TanStack table
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    enableMultiSort: true,
    filterFns: {
      costRange: (row, id, value: [number, number]) => {
        const cost = row.getValue(id) as number;
        return cost >= value[0] && cost <= value[1];
      },
    },
  });

  // Enhanced filter component for each column with search
  const FilterSelect = ({ 
    column, 
    title, 
    options 
  }: { 
    column: string, 
    title: string, 
    options: string[] 
  }) => {
    const selectedValues = filters[column as keyof typeof filters] || [];
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px' });
    
    const handleToggle = () => {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen(!isOpen);
    };

    // Update dropdown position
    const updatePosition = () => {
      if (!buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`
      });
    };

    // Update position on scroll and resize
    useEffect(() => {
      if (!isOpen) return;
      
      const handleUpdate = () => {
        updatePosition();
      };
      
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }, [isOpen]);

    // Filter options based on search term
    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleFilterSelect = (value: string) => {
      setFilters(prev => {
        if (prev[column as keyof typeof prev].includes(value)) {
          return {
            ...prev,
            [column]: prev[column as keyof typeof prev].filter(item => item !== value)
          };
        } else {
          return {
            ...prev,
            [column]: [...prev[column as keyof typeof prev], value]
          };
        }
      });
    };

    // Clear this specific filter
    const clearThisFilter = () => {
      setFilters(prev => ({
        ...prev,
        [column]: []
      }));
      setSearchTerm('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;
      
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
    
    const hasActiveFilters = selectedValues.length > 0;
    
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 text-sm rounded",
            hasActiveFilters 
              ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30" 
              : "bg-slate-700/30 hover:bg-slate-700/50"
          )}
        >
          {title}
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full h-5 w-5 text-xs">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="fixed bg-slate-800 border border-slate-700 rounded-md shadow-lg p-2 min-w-[220px] z-[9999]" 
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="relative mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 bg-slate-700 text-white rounded text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-2 top-1.5 h-4 w-4 text-slate-400" />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div key={option} className="flex items-center py-1">
                    <label className="flex items-center cursor-pointer w-full text-sm">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => handleFilterSelect(option)}
                        className="mr-2"
                      />
                      <span className="truncate">{option}</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="py-2 text-sm text-slate-400 text-center">No matching options</div>
              )}
            </div>
            {selectedValues.length > 0 && (
              <button
                onClick={clearThisFilter}
                className="mt-2 w-full text-xs py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Clear {title} Filter
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Cost range filter component
  const CostRangeFilter = () => {
    const [localCostRange, setLocalCostRange] = useState(costRange);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px' });

    // Update dropdown position
    const updatePosition = () => {
      if (!buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`
      });
    };

    // Handle toggle open/close
    const handleToggle = () => {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen(!isOpen);
    };

    // Update position on scroll and resize
    useEffect(() => {
      if (!isOpen) return;
      
      const handleUpdate = () => {
        updatePosition();
      };
      
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }, [isOpen]);

    // Convert cost percentage to dollar value (scale $1K-$100K)
    const toDollarValue = (percentage: number) => {
      return `$${Math.round((percentage / 100) * 99000 + 1000) / 1000}K`;
    };

    // Format the current range for display
    const formatRangeDisplay = () => {
      return `${toDollarValue(localCostRange[0])} - ${toDollarValue(localCostRange[1])}`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;
      
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Apply cost range filter
    const applyFilter = () => {
      setCostRange(localCostRange);
    };

    // Reset cost range filter
    const resetFilter = () => {
      setLocalCostRange([0, 100]);
      setCostRange([0, 100]);
    };

    const hasActiveFilter = costRange[0] > 0 || costRange[1] < 100;

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 text-sm rounded",
            hasActiveFilter 
              ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
              : "bg-slate-700/30 hover:bg-slate-700/50"
          )}
        >
          Cost
          {hasActiveFilter && (
            <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full h-5 w-5 text-xs">
              ✓
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="fixed bg-slate-800 border border-slate-700 rounded-md shadow-lg p-3 min-w-[260px] z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm text-slate-300">
                <span>{toDollarValue(localCostRange[0])}</span>
                <span>{toDollarValue(localCostRange[1])}</span>
              </div>
              <div className="relative w-full h-2 bg-slate-700 rounded-full">
                <div
                  className="absolute top-0 h-2 bg-blue-500 rounded-full"
                  style={{
                    left: `${localCostRange[0]}%`,
                    width: `${localCostRange[1] - localCostRange[0]}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localCostRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < localCostRange[1]) {
                      setLocalCostRange([value, localCostRange[1]]);
                    }
                  }}
                  className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 2 }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localCostRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > localCostRange[0]) {
                      setLocalCostRange([localCostRange[0], value]);
                    }
                  }}
                  className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 2 }}
                />
              </div>
            </div>
            <div className="text-center text-sm mb-3 text-slate-300">
              Current: {formatRangeDisplay()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilter}
                className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={resetFilter}
                className="flex-1 py-1.5 bg-slate-700 text-white text-sm rounded hover:bg-slate-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle cost toggle view change
  const toggleCostPerImpactView = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First toggle the view state
    setShowCostPerImpact(prev => !prev);
    
    // Force resort if currently sorting by cost
    if (table.getState().sorting.some(sort => sort.id === "cost")) {
      // Get current sorting direction for cost
      const costSortConfig = table.getState().sorting.find(sort => sort.id === "cost");
      const isDesc = costSortConfig?.desc ?? false; // Default to false if undefined
      
      // First, completely remove cost sorting to reset
      const otherSortings = table.getState().sorting.filter(sort => sort.id !== "cost");
      setSorting(otherSortings);
      
      // In the next tick, reapply the cost sorting with same direction
      setTimeout(() => {
        setSorting([...otherSortings, { id: "cost", desc: isDesc }]);
      }, 0);
    }
  };
  
  // Handle resiliency impact toggle view change
  const toggleGoToGreenView = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First toggle the view state
    setShowGoToGreen(prev => !prev);
    
    // Force resort if currently sorting by resiliency impact
    if (table.getState().sorting.some(sort => sort.id === "resiliencyImpact")) {
      // Get current sorting direction for resiliency
      const resiliencySortConfig = table.getState().sorting.find(sort => sort.id === "resiliencyImpact");
      const isDesc = resiliencySortConfig?.desc ?? false; // Default to false if undefined
      
      // First, completely remove resiliency sorting to reset
      const otherSortings = table.getState().sorting.filter(sort => sort.id !== "resiliencyImpact");
      setSorting(otherSortings);
      
      // In the next tick, reapply the resiliency sorting with same direction
      setTimeout(() => {
        setSorting([...otherSortings, { id: "resiliencyImpact", desc: isDesc }]);
      }, 0);
    }
  };

  return (
    <div className="w-full p-4 bg-slate-950 overflow-hidden">
      {isTableCollapsed ? (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-t-lg flex justify-between items-center">
          <h2 className="text-base font-medium text-white">Technology Data Table</h2>
          
          <div className="flex items-center">
            {(Object.values(filters).some(arr => arr.length > 0) || costRange[0] > 0 || costRange[1] < 100) && (
              <button 
                onClick={() => {
                  clearFilters();
                  setCostRange([0, 100]);
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors mr-2"
              >
                Clear Filters
              </button>
            )}
            
            <button
              onClick={() => setIsTableCollapsed(false)}
              className="flex items-center justify-center p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors text-slate-200"
              aria-label="Expand table"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-3 bg-slate-900 border-t border-l border-r border-slate-700 rounded-t-lg flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <FilterSelect 
                column="status" 
                title="Outreach" 
                options={filterOptions.statuses}
              />
              
              <FilterSelect 
                column="installation" 
                title="Installation" 
                options={filterOptions.installations}
              />
              
              <FilterSelect 
                column="vendor" 
                title="Vendor" 
                options={filterOptions.vendors}
              />
              
              <FilterSelect 
                column="technologyType" 
                title="Technology" 
                options={filterOptions.technologies}
              />
              
              <CostRangeFilter />
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${showAnalytics ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              >
                <BarChart2 size={16} />
                <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
              </button>
            </div>
            
            <div className="flex items-center ml-2">
              {(Object.values(filters).some(arr => arr.length > 0) || costRange[0] > 0 || costRange[1] < 100) && (
                <button 
                  onClick={() => {
                    clearFilters();
                    setCostRange([0, 100]);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors mr-2"
                >
                  Clear Filters
                </button>
              )}
              
              <button
                onClick={() => setIsTableCollapsed(true)}
                className="flex items-center justify-center p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors text-slate-200"
                aria-label="Collapse table"
              >
                <ChevronUp size={18} />
              </button>
            </div>
          </div>
          
          {/* Analytics section */}
          <AnimatePresence>
            {showAnalytics && <AnalyticsSection />}
          </AnimatePresence>
          
          <div className="overflow-x-auto border-x border-slate-700 scrollbar-hide">
            <div className="max-h-[700px] overflow-y-auto scrollbar-hide">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-slate-900 border-b-0">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-slate-300 border-b border-slate-700">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        className="border-b border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(row.original)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                        No technologies found matching the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="h-2 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg"></div>
        </>
      )}
    </div>
  );
}
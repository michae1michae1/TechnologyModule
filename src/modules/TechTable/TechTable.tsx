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
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Pin, BarChart2, Search, DollarSign, TrendingUp, Zap, Link } from 'lucide-react';
import AnalyticsSection from '../AnalyticsSection/AnalyticsSection';
import GoToGreenSection from '../GoToGreenSection/GoToGreenSection';
import { DualRangeSlider } from '@/components/ui/dual-range-slider';

export default function TechTable() {
  const { filters, setFilters, clearFilters, generateShareableLink } = useFilters();
  const { filteredRecords, filterOptions } = useTechnologyData(filters);
  const { setSelectedTech, openDetails } = useDetails();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGoToGreen, setShowGoToGreen] = useState(false);
  const [costRange, setCostRange] = useState<[number, number]>([0, 100]);
  const [showCostPerImpact, setShowCostPerImpact] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
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
    // Cost is already in thousands
    const formattedDollar = cost >= 1000 
      ? `$${(cost/1000).toFixed(1)}M` 
      : `$${cost}K`;
    
    // Scale the bar width based on max cost in data (assuming 10M max)
    const maxCost = 10000; // 10M
    const barWidth = Math.min((cost / maxCost) * 100, 100);
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${barWidth}%` }}
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
    
    // Get appropriate color based on value
    const getColorForValue = (value: number) => {
      if (value >= 80) return 'green';
      if (value >= 30) return 'yellow';
      return 'red';
    };

    const existingScoreColor = getColorForValue(existingScore);
    const totalScoreColor = getColorForValue(totalScore);
    
    // Map colors to CSS classes
    const colorClasses = {
      red: {
        bar: 'bg-red-500',
        text: 'text-red-500'
      },
      yellow: {
        bar: 'bg-yellow-500',
        text: 'text-yellow-500'
      },
      green: {
        bar: 'bg-green-500',
        text: 'text-green-500'
      }
    };
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5 overflow-hidden">
          {/* Existing score segment with color based on existing score */}
          <div 
            className={`${colorClasses[existingScoreColor].bar} h-2.5 float-left`}
            style={{ width: `${existingScaleWidth}%` }}
          ></div>
          {/* Impact segment with color based on total score */}
          <div 
            className={`${colorClasses[totalScoreColor].bar} h-2.5 float-left`}
            style={{ width: `${impactScaleWidth}%` }}
          ></div>
        </div>
        <div className="flex items-center">
          <span className={colorClasses[existingScoreColor].text}>{existingScore}</span>
          <span className={colorClasses[totalScoreColor].text + " ml-1"}>+{impact}</span>
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
    
    const costPerImpact = cost / impact; // Cost per point of resiliency impact
    const formattedCostPerImpact = costPerImpact >= 1000 
      ? `$${(costPerImpact/1000).toFixed(1)}M/pt` 
      : `$${costPerImpact.toFixed(0)}K/pt`;
    
    // Use the same bar visualization as regular cost to maintain consistency
    // Scale the bar width based on max cost in data (assuming 10M max)
    const maxCost = 10000; // 10M
    const barWidth = Math.min((cost / maxCost) * 100, 100);
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${barWidth}%` }}
          ></div>
        </div>
        <span>{formattedCostPerImpact}</span>
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
        
        // Sort by impact value
        return impact;
      },
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resiliency Impact
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
        const impact = Number(row.original.resiliencyImpact);
        // Use existingResiliencyScore if available, otherwise default to 50
        const existingScore = row.original.existingResiliencyScore !== undefined 
          ? Number(row.original.existingResiliencyScore) 
          : 50;
          
        return renderResiliencyStackedBar(impact, existingScore);
      },
    },
    {
      id: "cost",
      accessorKey: "cost", // Use accessorKey to directly access the raw cost
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
        const cost = Number(row.original.cost);
        const impact = Number(row.original.resiliencyImpact);
        
        if (showCostPerImpact) {
          return renderCostPerImpactBar(cost, impact);
        } else {
          return renderCostBar(cost);
        }
      },
    },
  ], [isInCompare, handleToggleCompare, showCostPerImpact]);
  
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
    
    // Add cost range filter using correct filter type
    if (costRange[0] > 0 || costRange[1] < 100) {
      // Transform percentage range to actual cost range
      const maxCost = 10000; // 10M in K
      const minCostValue = (costRange[0] / 100) * maxCost;
      const maxCostValue = (costRange[1] / 100) * maxCost;
      
      newColumnFilters.push({
        id: 'cost',
        value: [minCostValue, maxCostValue]
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
  });

  // Get available filter options based on current filtered data
  const getAvailableFilterOptions = () => {
    // Get the current filtered data from the table
    const currentFilteredData = table.getFilteredRowModel().rows.map(row => row.original);
    
    // Extract unique values for each filter type
    const availableOptions = {
      statuses: [...new Set(currentFilteredData.map(item => {
        // Use outreachLevel if available, otherwise map from status
        if (item.outreachLevel) {
          return item.outreachLevel;
        }
        
        // Fallback mapping from old status values
        const statusToOutreach = {
          'Prototype': 'Level 1',
          'Planning': 'Level 2',
          'Deployment': 'Level 4',
        };
        return statusToOutreach[item.status as keyof typeof statusToOutreach] || 'Level 3';
      }))],
      installations: [...new Set(currentFilteredData.map(item => item.installation))],
      vendors: [...new Set(currentFilteredData.map(item => item.vendor))],
      technologies: [...new Set(currentFilteredData.map(item => item.technology))],
      techNeeds: [...new Set(currentFilteredData.flatMap(item => item.techNeeds))]
    };
    
    return availableOptions;
  };
  
  // Get the current available filter options based on filtered data
  const availableFilterOptions = getAvailableFilterOptions();

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
    const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(selectedValues);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px' });
    
    // Sync local values with global filter state
    useEffect(() => {
      setLocalSelectedValues(selectedValues);
    }, [selectedValues]);
    
    // Get available options - include selected values even if they're filtered out
    const availableOptions = useMemo(() => {
      let baseOptions: string[] = [];
      
      // Get options from the filtered data
      switch(column) {
        case 'status':
          baseOptions = availableFilterOptions.statuses;
          break;
        case 'installation':
          baseOptions = availableFilterOptions.installations;
          break;
        case 'vendor':
          baseOptions = availableFilterOptions.vendors;
          break;
        case 'technologyType':
          baseOptions = availableFilterOptions.technologies;
          break;
        default:
          baseOptions = options;
      }
      
      // Include any currently selected values that might not be in the filtered data
      const combined = [...new Set([...baseOptions, ...localSelectedValues])];
      return combined;
    }, [column, localSelectedValues, availableFilterOptions, options]);

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

    // Filter options based on search term against available options
    const filteredOptions = availableOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check if an option actually exists in the filtered data
    const isOptionAvailableInFiltered = (option: string) => {
      switch(column) {
        case 'status':
          return availableFilterOptions.statuses.includes(option);
        case 'installation':
          return availableFilterOptions.installations.includes(option);
        case 'vendor':
          return availableFilterOptions.vendors.includes(option);
        case 'technologyType':
          return availableFilterOptions.technologies.includes(option);
        default:
          return true;
      }
    };
    
    // Handle toggling an option in the local state
    const handleLocalFilterSelect = (value: string) => {
      setLocalSelectedValues(prev => {
        if (prev.includes(value)) {
          return prev.filter(item => item !== value);
        } else {
          return [...prev, value];
        }
      });
    };
    
    // Apply the local selections to the global filter
    const applyFilters = () => {
      setFilters(prev => ({
        ...prev,
        [column]: localSelectedValues
      }));
      setIsOpen(false);
    };
    
    // Cancel and revert to previous state
    const cancelSelection = () => {
      setLocalSelectedValues(selectedValues);
      setIsOpen(false);
    };
    
    // Select all available options
    const selectAll = () => {
      const availableFiltered = filteredOptions.filter(option => isOptionAvailableInFiltered(option));
      setLocalSelectedValues(availableFiltered);
    };
    
    // Clear all selections
    const clearAllSelections = () => {
      setLocalSelectedValues([]);
    };

    // Clear this specific filter
    const clearThisFilter = () => {
      setLocalSelectedValues([]);
      setFilters(prev => ({
        ...prev,
        [column]: []
      }));
      setSearchTerm('');
      setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;
      
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)
        ) {
          cancelSelection();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, selectedValues]);
    
    const hasActiveFilters = selectedValues.length > 0;
    const hasLocalChanges = JSON.stringify(localSelectedValues) !== JSON.stringify(selectedValues);
    
    // Get the counts of different types of options
    const counts = useMemo(() => {
      const availableCount = filteredOptions.filter(option => isOptionAvailableInFiltered(option)).length;
      const selectedCount = localSelectedValues.length;
      
      return { availableCount, selectedCount };
    }, [filteredOptions, localSelectedValues, isOptionAvailableInFiltered]);
    
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
            <div className="flex justify-between mb-2 pb-2 border-b border-slate-700">
              <button 
                className="text-xs text-blue-400 hover:text-blue-300"
                onClick={selectAll}
              >
                Select All
              </button>
              <button 
                className="text-xs text-red-400 hover:text-red-300"
                onClick={clearAllSelections}
              >
                Clear All
              </button>
            </div>
            
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
                    <label className={`flex items-center cursor-pointer w-full text-sm ${!isOptionAvailableInFiltered(option) && !localSelectedValues.includes(option) ? 'hidden' : ''}`}>
                      <input
                        type="checkbox"
                        checked={localSelectedValues.includes(option)}
                        onChange={() => handleLocalFilterSelect(option)}
                        className="mr-2"
                      />
                      <span className={`truncate ${!isOptionAvailableInFiltered(option) ? 'text-slate-500' : ''}`}>
                        {option}
                      </span>
                      {!isOptionAvailableInFiltered(option) && localSelectedValues.includes(option) && (
                        <span className="ml-2 text-xs text-gray-400">(no matches)</span>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <div className="py-2 text-sm text-slate-400 text-center">No matching options</div>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-400 text-center">
              Showing {counts.availableCount} available options {counts.selectedCount > 0 ? `(${counts.selectedCount} selected)` : ''}
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-700 flex justify-end gap-2">
              <button
                onClick={cancelSelection}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                Apply
              </button>
            </div>
            
            {selectedValues.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={clearThisFilter}
                  className="w-full text-xs py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                >
                  Clear {title} Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Cost range filter component
  const CostRangeFilter = () => {
    const [localCostRange, setLocalCostRange] = useState<[number, number]>(costRange);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px' });

    // Convert cost to dollar value for range filter
    const toDollarValue = (percentage: number) => {
      // Round to 2 decimal places to avoid floating point issues
      const maxCost = 10000; // 10M
      const cost = Math.round((percentage / 100) * maxCost * 100) / 100;
      
      // Apply different formatting based on value range
      if (cost >= 1000) {
        // For values in millions, format with one decimal place
        return `$${(cost/1000).toFixed(1)}M`;
      } else {
        // For values in thousands, use whole numbers only
        return `$${Math.round(cost)}K`;
      }
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
    
    // Custom label for the slider that shows dollar values
    const dollarValueLabel = (value: number | undefined) => {
      if (value === undefined) return null;
      return (
        <span className="text-xs font-medium bg-slate-800 text-white px-2 py-1 rounded">
          {toDollarValue(value)}
        </span>
      );
    };
    
    // Handle value change from dual range slider
    const handleValueChange = (newValues: number[]) => {
      // Convert number[] to [number, number] tuple for our state
      setLocalCostRange([newValues[0], newValues[1]]);
    };

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
            <div className="mb-3 pt-4">
              <DualRangeSlider
                value={localCostRange}
                onValueChange={handleValueChange}
                min={0}
                max={100}
                step={1}
                label={dollarValueLabel}
                labelPosition="top"
                className="mt-6"
              />
            </div>
            
            <div className="text-center text-sm mb-3 text-slate-300 mt-8">
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

  // Handle cost toggle view change - simplified to only toggle display
  const toggleCostPerImpactView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCostPerImpact(prev => !prev);
  };

  // Handle copying the shareable link
  const handleCopyLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    
    // Reset copy confirmation after 2 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
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
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-3 py-1.5 rounded mr-2 text-sm ${linkCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              aria-label="Share link with current filters"
            >
              <Link size={16} />
              <span>{linkCopied ? 'Copied!' : 'Share Link'}</span>
            </button>
            
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
                onClick={() => {
                  setShowAnalytics(!showAnalytics);
                  if (showGoToGreen) setShowGoToGreen(false);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${showAnalytics ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              >
                <BarChart2 size={16} />
                <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowGoToGreen(!showGoToGreen);
                  if (showAnalytics) setShowAnalytics(false);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${showGoToGreen ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              >
                <Zap size={16} />
                <span>{showGoToGreen ? 'Hide Go-To-Green' : 'Show Go-To-Green'}</span>
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
                onClick={handleCopyLink}
                className={`flex items-center gap-1 px-3 py-1.5 rounded mr-2 text-sm ${linkCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                aria-label="Share link with current filters"
              >
                <Link size={16} />
                <span>{linkCopied ? 'Copied!' : 'Share Link'}</span>
              </button>
              
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
          
          {/* Go To Green section */}
          <AnimatePresence>
            {showGoToGreen && <GoToGreenSection />}
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
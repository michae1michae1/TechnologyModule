'use client';

import React, { useState, useMemo } from 'react';
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
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Pin, BarChart2 } from 'lucide-react';
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
  
  // Render status badge
  const renderStatus = (status: 'Prototype' | 'Planning' | 'Deployment') => {
    const colors = {
      Prototype: 'bg-purple-500 text-white',
      Planning: 'bg-blue-500 text-white',
      Deployment: 'bg-green-500 text-white',
    };
    
    return (
      <span className={`${colors[status]} px-2 py-1 rounded text-xs font-medium`}>
        {status}
      </span>
    );
  };

  // Define table columns
  const columns: ColumnDef<TechnologyRecord>[] = [
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
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
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
      cell: ({ row }) => renderStatus(row.original.status),
      filterFn: (row, id, filterValue) => {
        return filterValue.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "cost",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cost
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
      cell: ({ row }) => renderCostBar(row.original.cost),
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
      accessorKey: "resiliencyImpact",
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
      cell: ({ row }) => row.original.resiliencyImpact,
    },
  ];
  
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
        id: 'techNeeds',
        value: filters.technologyType,
      });
    }
    
    setColumnFilters(newColumnFilters);
  }, [filters]);
  
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

  // Filter component for each column
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
    
    const handleToggle = () => setIsOpen(!isOpen);
    
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
    
    const hasActiveFilters = selectedValues.length > 0;
    
    return (
      <div className="relative">
        <button
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
          <div className="absolute z-50 mt-1 left-0 bg-slate-800 border border-slate-700 rounded-md shadow-lg p-2 min-w-[200px]">
            <div className="max-h-64 overflow-y-auto">
              {options.map(option => (
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
              ))}
            </div>
            {selectedValues.length > 0 && (
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    [column]: []
                  }));
                }}
                className="mt-2 w-full text-xs py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-950 overflow-hidden">
      {isTableCollapsed ? (
        <div className="p-3 bg-slate-900 border border-slate-700 flex justify-between items-center">
          <h2 className="text-base font-medium text-white">Technology Data Table</h2>
          
          <div className="flex items-center">
            {Object.values(filters).some(arr => arr.length > 0) && (
              <button 
                onClick={clearFilters}
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
          <div className="p-3 bg-slate-900 border border-slate-700 flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <FilterSelect 
                column="status" 
                title="Status" 
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
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${showAnalytics ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              >
                <BarChart2 size={16} />
                <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
              </button>
            </div>
            
            <div className="flex items-center ml-2">
              {Object.values(filters).some(arr => arr.length > 0) && (
                <button 
                  onClick={clearFilters}
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
          
          <div className="overflow-x-auto">
            <div className="max-h-[700px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-slate-800 border-b-0">
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
        </>
      )}
    </div>
  );
} 
"use client";

import { HistoryResponse, getHistoryPaginated } from "@/lib/api";
import {
  Home,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

interface Props {
  data: HistoryResponse[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function CalculationTable({
  data,
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <div className='space-y-6'>
      <div className='overflow-x-auto rounded-xl border border-white/20'>
        <table className='min-w-full divide-y divide-white/10 text-sm text-white/90'>
          <thead className='bg-white/5'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold'>ID</th>
              <th className='px-4 py-3 text-left font-semibold'>Created At</th>
              <th className='px-4 py-3 text-left font-semibold'>Origin</th>
              <th className='px-4 py-3 text-left font-semibold'>Destination</th>
              <th className='px-4 py-3 text-right font-semibold'>
                Straight (mi)
              </th>
              <th className='px-4 py-3 text-right font-semibold'>Road (mi)</th>
              <th className='px-4 py-3 text-right font-semibold'>Circuity</th>
              <th className='px-4 py-3 text-right font-semibold'>Time (ms)</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-white/10'>
            {data.map((row, index) => (
              <tr key={row.id} className='hover:bg-white/5'>
                <td className='px-4 py-3'>{index+1}</td>
                <td className='px-4 py-3'>
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className='px-4 py-3'>
                  {row.origin_name || "Unknown"} <br />
                  <span className='text-xs text-white/60'>
                    ({row.origin_lat.toFixed(4)}, {row.origin_lng.toFixed(4)})
                  </span>
                </td>
                <td className='px-4 py-3'>
                  {row.destination_name || "Unknown"} <br />
                  <span className='text-xs text-white/60'>
                    ({row.destination_lat.toFixed(4)},{" "}
                    {row.destination_lng.toFixed(4)})
                  </span>
                </td>
                <td className='px-4 py-3 text-right'>
                  {row.straight_distance.toFixed(2)}
                </td>
                <td className='px-4 py-3 text-right'>
                  {row.road_distance.toFixed(2)}
                </td>
                <td className='px-4 py-3 text-right'>
                  {row.circuity_factor.toFixed(3)}
                </td>
                <td className='px-4 py-3 text-right'>
                  {row.calculation_time_ms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-white/60'>
            Page {currentPage} of {totalPages}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300'
            >
              <ChevronLeft className='w-4 h-4 text-white' />
              <span className='text-sm font-medium text-white'>Previous</span>
            </button>

            <div className='flex items-center gap-1'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                        : "bg-white/10 backdrop-blur-xl text-white hover:bg-white/20"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300'
            >
              <span className='text-sm font-medium text-white'>Next</span>
              <ChevronRight className='w-4 h-4 text-white' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "circuity_asc", label: "Circuity: Low to High" },
    { value: "circuity_desc", label: "Circuity: High to Low" },
  ];

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-w-48'
      >
        <Filter
          strokeWidth={1.5}
          aria-label='filter icon'
          className='w-4 h-4 text-white'
        />
        <span className='text-sm font-medium text-white flex-1 text-left'>
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-2 z-50'>
          <div className='bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden'>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-3 hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0 text-sm font-medium ${
                  value === option.value
                    ? "text-emerald-300 bg-emerald-500/10"
                    : "text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const Database = () => {
  const [allResults, setAllResults] = useState<HistoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 20;

  const getData = async () => {
    try {
      setLoading(true);
      const data = await getHistoryPaginated();
      setAllResults(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllResults([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    console.log("Processing data:", {
      totalRecords: allResults.length,
      searchQuery,
      sortBy,
    });

    let filtered = [...allResults];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = allResults.filter(
        (item) =>
          (item.origin_name || "").toLowerCase().includes(query) ||
          (item.destination_name || "").toLowerCase().includes(query) ||
          item.circuity_factor.toString().includes(query) ||
          item.id.toString().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "circuity_asc":
          return a.circuity_factor - b.circuity_factor;
        case "circuity_desc":
          return b.circuity_factor - a.circuity_factor;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [allResults, searchQuery, sortBy]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = filteredAndSortedData.slice(startIndex, endIndex);
    return pageData;
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className='w-full px-10 py-10 flex items-center justify-center min-h-96'>
        <div className='w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin'></div>
        <span className='ml-3 text-white/60'>Loading calculations...</span>
      </div>
    );
  }

  return (
    <div className='w-full px-10 py-10'>
      <div className='mb-8 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4 mb-[-1em]'>
          <Link
            href={"/"}
            className='flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] max-w-36 text-center mb-10'
          >
            <Home
              strokeWidth={1.5}
              aria-label='home icon'
              className='w-4 h-4 text-white'
            />
            <span className='text-sm font-semibold text-white'>Home</span>
          </Link>
          <div className='relative flex-1'>
            <div className='absolute left-5 top-1/4 transform -translate-y-1/2 text-white/50 z-20'>
              <Search strokeWidth={1.5} className='w-5 h-5' />
            </div>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by origin, destination, ID, or circuity...'
              className='w-full h-11 pl-14 pr-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl 
                       text-white placeholder-white/50 text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/20
                       shadow-xl hover:shadow-2xl hover:bg-white/15
                       transition-all duration-300 ease-out'
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className='absolute right-5 top-1/4 transform -translate-y-1/2 text-white/50 hover:text-red-400 transition-colors p-1'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            )}
          </div>

          <FilterDropdown value={sortBy} onChange={setSortBy} />
        </div>

        <div className='text-sm text-white/60'>
          {searchQuery ? (
            <span>
              Found {filteredAndSortedData.length} result
              {filteredAndSortedData.length !== 1 ? "s" : ""} for {searchQuery}
              {filteredAndSortedData.length !== allResults.length && (
                <span> (filtered from {allResults.length} total)</span>
              )}
            </span>
          ) : (
            <span>
              Showing {allResults.length} calculation
              {allResults.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className='mb-10'>
        {paginatedData.length === 0 ? (
          <div className='text-center py-20'>
            <div className='text-white/60 text-lg font-medium mb-2'>
              {searchQuery ? "No results found" : "No calculations yet"}
            </div>
            <div className='text-white/40 text-sm'>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start by calculating some circuity factors"}
            </div>
          </div>
        ) : (
          <CalculationTable
            data={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Database;

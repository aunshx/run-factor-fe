"use client";

import { NominatimResult, useNominatim } from "@/hooks/useNominatim";
import { useState, useEffect, useRef } from "react";

interface Point {
  lat: number;
  lng: number;
  name: string;
}

interface SearchInputProps {
  placeholder: string;
  value?: Point | null;
  onSelect: (point: Point) => void;
  onClear: () => void;
  icon: React.ReactNode;
}

export function SearchInput({
  placeholder,
  value,
  onSelect,
  onClear,
  icon,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, search, clearResults } = useNominatim();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
    } else {
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (newQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        search(newQuery).then((results) => {
          setIsOpen(results.length > 0);
        });
      }, 300);
    } else {
      clearResults();
      setIsOpen(false);
    }
  };

  const handleSelectResult = (result: NominatimResult) => {
    const point: Point = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: formatLocationName(result),
    };

    onSelect(point);
    setQuery(point.name);
    setIsOpen(false);
    clearResults();
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const formatLocationName = (result: NominatimResult): string => {
    const parts = result.display_name.split(",");
    if (parts.length >= 2) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return parts[0].trim();
  };

  return (
    <div className='relative'>
      <div className='relative group'>
        <div className='absolute left-5 top-1/2 transform -translate-y-1/2 text-white/50 group-focus-within:text-emerald-400 transition-colors'>
          {isLoading ? (
            <div className='w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin'></div>
          ) : (
            icon
          )}
        </div>

        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className='w-full h-16 pl-14 pr-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl 
                   text-white placeholder-white/50 text-base font-medium
                   focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/20
                   shadow-xl hover:shadow-2xl hover:bg-white/15
                   transition-all duration-300 ease-out z-10'
        />

        {query && (
          <button
            onClick={handleClear}
            className='absolute right-5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-red-400 transition-colors z-10 p-1'
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

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className='absolute top-full left-0 right-0 mt-2 z-[9999]'
          style={{ zIndex: 9999 }}
        >
          <div className='bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto'>
            {results.map((result, index) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                className='w-full text-left px-6 py-4 hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-b-0 group flex items-start gap-4'
              >
                <div className='w-2 h-2 bg-emerald-400 rounded-full mt-3 opacity-60 group-hover:opacity-100 transition-opacity shadow-lg flex-shrink-0'></div>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-white text-base group-hover:text-emerald-300 transition-colors leading-tight'>
                    {formatLocationName(result)}
                  </p>
                  <p className='text-sm text-white/60 mt-1 truncate font-medium leading-tight'>
                    {result.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

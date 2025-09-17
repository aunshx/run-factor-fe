"use client";

import { useState, useCallback, useRef } from "react";

export interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export function useNominatim() {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string): Promise<NominatimResult[]> => {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        return [];
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: `${query}, California, USA`,
          format: "json",
          limit: "8",
          addressdetails: "1",
          countrycodes: "us",
          viewbox: "-124.4,32.5,-114.6,42.0",
          bounded: "1",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: NominatimResult[] = await response.json();

        // Filter to only include California results
        const californiaResults = data.filter((result) => {
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          return (
            lat >= 32.5 &&
            lat <= 42.0 &&
            lon >= -124.4 &&
            lon <= -114.6 &&
            (result.display_name.includes("California") ||
              result.display_name.includes("CA"))
          );
        });

        setResults(californiaResults);
        return californiaResults;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          console.error("Nominatim search error:", err);
        }
        setResults([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}

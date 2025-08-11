"use client";

import { SearchInput } from "@/components/search-input";
import { CalculateResponse, checkHealth } from "@/lib/api";
import {
  Clock,
  Database,
  MapPin,
  Navigation,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("../components/map"), {
  ssr: false,
  loading: () => (
    <div className='w-full h-full bg-white/5 backdrop-blur-xl flex items-center justify-center rounded-3xl border border-white/10'>
      <div className='text-center'>
        <div className='w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-white/80 font-medium'>Loading California map...</p>
      </div>
    </div>
  ),
});

interface Point {
  lat: number;
  lng: number;
  name: string;
}

function formatLocationName(lat: number, lng: number): string {
  const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  if (lat > 40.0) return `${coords} (Northern CA)`;
  if (lat > 37.0) return `${coords} (Bay Area)`;
  if (lat > 35.0) return `${coords} (Central CA)`;
  if (lat > 34.0) return `${coords} (Central Coast)`;
  return `${coords} (Southern CA)`;
}

function getEfficiencyColor(factor: number): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  if (factor < 1.2)
    return {
      bg: "bg-gradient-to-br from-emerald-50/10 to-green-100/5",
      text: "text-emerald-300",
      border: "border-emerald-200/20",
      dot: "bg-emerald-400",
    };
  if (factor < 1.5)
    return {
      bg: "bg-gradient-to-br from-amber-50/10 to-yellow-100/5",
      text: "text-amber-300",
      border: "border-amber-200/20",
      dot: "bg-amber-400",
    };
  if (factor < 2.0)
    return {
      bg: "bg-gradient-to-br from-orange-50/10 to-orange-100/5",
      text: "text-orange-300",
      border: "border-orange-200/20",
      dot: "bg-orange-400",
    };
  return {
    bg: "bg-gradient-to-br from-red-50/10 to-red-100/5",
    text: "text-red-300",
    border: "border-red-200/20",
    dot: "bg-red-400",
  };
}

function getEfficiencyLabel(factor: number): string {
  if (factor < 1.2) return "Excellent";
  if (factor < 1.5) return "Good";
  if (factor < 2.0) return "Fair";
  return "Poor";
}

export default function Home() {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [calculation, setCalculation] = useState<CalculateResponse | null>(
    null
  );
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check backend health
  useEffect(() => {
    checkHealth().then(setBackendHealthy);
    const interval = setInterval(
      () => checkHealth().then(setBackendHealthy),
      30000
    );
    return () => clearInterval(interval);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    const point = {
      lat,
      lng,
      name: formatLocationName(lat, lng),
    };

    if (!origin) {
      setOrigin(point);
    } else if (!destination) {
      setDestination(point);
    } else {
      setOrigin(point);
      setDestination(null);
      setCalculation(null);
    }
  };

  const clearAll = () => {
    setOrigin(null);
    setDestination(null);
    setCalculation(null);
  };

  const swapPoints = () => {
    if (origin && destination) {
      setOrigin(destination);
      setDestination(origin);
    }
  };

  const efficiencyColors = calculation
    ? getEfficiencyColor(calculation.circuity_factor)
    : null;

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8'>
      <div className='max-w-[1800px] mx-auto h-[calc(100vh-4rem)]'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent mb-2'>
              California Routes
            </h1>
            <p className='text-white/70 text-lg font-medium'>
              Transportation Efficiency Calculator
            </p>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <Link
              href={"/database"}
              className='flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
            >
              <Database
                strokeWidth={1.5}
                aria-label='database icon'
                className='w-4 h-4 text-white'
              />
              <span className='text-sm font-semibold text-white'>Database</span>
            </Link>
            <div className='flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl'>
              <div
                className={`w-3 h-3 rounded-full ${
                  backendHealthy ? "bg-emerald-400" : "bg-red-400"
                } shadow-lg`}
              ></div>
              <span className='text-sm font-semibold text-white'>
                Backend{" "}
                {backendHealthy === null
                  ? "Checking..."
                  : backendHealthy
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-12 gap-8 h-[calc(100%-8rem)]'>
          <div className='col-span-4 space-y-6 overflow-y-auto pr-2 relative z-10'>
            <div className='bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full'></div>
                <h2 className='text-2xl font-bold text-white'>
                  Location Selection
                </h2>
              </div>

              <div className='space-y-6'>
                <div className=''>
                  <label className='block text-sm font-semibold text-white/90 mb-4 flex items-center gap-3'>
                    <div className='w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg'>
                      A
                    </div>
                    <span className='text-base'>Origin Point</span>
                  </label>
                  <SearchInput
                    placeholder='Search California locations...'
                    value={origin}
                    onSelect={setOrigin}
                    onClear={() => {
                      setOrigin(null);
                      setCalculation(null);
                    }}
                    icon={<MapPin className='w-5 h-5' />}
                  />
                </div>
                <div className=''>
                  <label className='block text-sm font-semibold text-white/90 mb-4 flex items-center gap-3'>
                    <div className='w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg'>
                      B
                    </div>
                    <span className='text-base'>Destination Point</span>
                  </label>
                  <SearchInput
                    placeholder='Search California locations...'
                    value={destination}
                    onSelect={setDestination}
                    onClear={() => {
                      setDestination(null);
                      setCalculation(null);
                    }}
                    icon={<Navigation className='w-5 h-5' />}
                  />
                </div>
              </div>
            </div>
            {calculation && (
              <div className='bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10'>
                <div className='flex items-center gap-4 mb-8'>
                  <div className='w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full'></div>
                  <h2 className='text-2xl font-bold text-white'>
                    Route Analysis
                  </h2>
                </div>
                <div className='grid grid-cols-2 gap-6 mb-8'>
                  <div className='bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30'>
                    <div className='text-3xl font-bold text-blue-300 mb-2'>
                      {calculation.straight_distance.toFixed(1)}
                    </div>
                    <div className='text-sm font-semibold text-blue-400 mb-1'>
                      miles
                    </div>
                    <div className='text-xs text-white/60 font-medium'>
                      Straight Distance
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30'>
                    <div className='text-3xl font-bold text-purple-300 mb-2'>
                      {calculation.road_distance.toFixed(1)}
                    </div>
                    <div className='text-sm font-semibold text-purple-400 mb-1'>
                      miles
                    </div>
                    <div className='text-xs text-white/60 font-medium'>
                      Road Distance
                    </div>
                  </div>
                </div>
                <div
                  className={`${efficiencyColors?.bg} backdrop-blur-sm rounded-2xl p-8 border ${efficiencyColors?.border} shadow-xl mb-6`}
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`w-4 h-4 ${efficiencyColors?.dot} rounded-full shadow-lg`}
                      ></div>
                      <span className='text-lg font-bold text-white'>
                        Circuity Factor
                      </span>
                    </div>
                    <div className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl'>
                      <span
                        className={`text-sm font-bold ${efficiencyColors?.text}`}
                      >
                        {getEfficiencyLabel(calculation.circuity_factor)}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-end gap-6'>
                    <div
                      className={`text-5xl font-bold ${efficiencyColors?.text}`}
                    >
                      {calculation.circuity_factor.toFixed(3)}
                    </div>
                    <div
                      className={`text-xl font-semibold ${efficiencyColors?.text} mb-2`}
                    >
                      {calculation.efficiency_percent.toFixed(1)}% efficient
                    </div>
                  </div>
                </div>
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-3 text-white/80'>
                      <Zap className='w-5 h-5' />
                      <span className='font-semibold text-base'>
                        {calculation.calculation_time_ms}ms
                      </span>
                    </div>
                    {calculation.cached && (
                      <div className='flex items-center gap-3 text-white/80'>
                        <Clock className='w-5 h-5' />
                        <span className='font-semibold text-base'>Cached</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className='bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative z-0'>
              <div className='space-y-4'>
                {origin && destination && (
                  <button
                    onClick={swapPoints}
                    className='w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm cursor-pointer'
                  >
                    <div className='flex items-center justify-center gap-3'>
                      <RotateCcw className='w-5 h-5' />
                      <span className='text-lg'>Swap Points</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={clearAll}
                  disabled={!origin && !destination}
                  className='w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 disabled:from-slate-600/50 disabled:to-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none backdrop-blur-sm cursor-pointer'
                >
                  <div className='flex items-center justify-center gap-3'>
                    <Trash2 className='w-5 h-5' />
                    <span className='text-lg'>Clear All</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className='col-span-8'>
            <div className='h-full bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden'>
              <Map
                origin={origin}
                destination={destination}
                onMapClick={handleMapClick}
                onCalculationResult={setCalculation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

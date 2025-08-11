"use client";

import { CalculateResponse, checkHealth } from "@/lib/api";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Map = dynamic(() => import("../components/map"), {
  ssr: false,
  loading: () => (
    <div className='w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
        <p className='text-gray-600'>Loading California map...</p>
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

function getEfficiencyColor(factor: number): string {
  if (factor < 1.2) return "text-green-600 bg-green-50 border-green-200";
  if (factor < 1.5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (factor < 2.0) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
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

  useEffect(() => {
    checkHealth().then(setBackendHealthy);
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

  return (
    <div className='h-screen w-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='w-96 bg-white/80 backdrop-blur-md shadow-2xl flex flex-col border-r border-white/20'>
        <div className='p-6 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl'>
              🌉
            </div>
            <div>
              <h1 className='text-2xl font-bold'>California Routes</h1>
              <p className='text-blue-100 text-sm'>
                Transportation Efficiency Calculator
              </p>
            </div>
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <div
              className={`w-2 h-2 rounded-full ${
                backendHealthy ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
            <span className='text-sm text-blue-100'>
              Backend:{" "}
              {backendHealthy === null
                ? "Checking..."
                : backendHealthy
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>
        </div>

        <div className='flex-1 p-6 space-y-6 overflow-y-auto'>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                A
              </div>
              <label className='font-semibold text-gray-700'>
                Origin Point
              </label>
            </div>
            {origin ? (
              <div className='p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl'>
                <p className='font-semibold text-green-800'>{origin.name}</p>
                <p className='text-sm text-green-600 mt-2 font-mono'>
                  {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
                </p>
                <button
                  onClick={() => {
                    setOrigin(null);
                    setCalculation(null);
                  }}
                  className='text-sm text-red-600 hover:text-red-800 mt-3 font-medium'
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className='p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center'>
                <p className='text-gray-500 text-sm'>
                  Click anywhere in California to set origin
                </p>
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                B
              </div>
              <label className='font-semibold text-gray-700'>
                Destination Point
              </label>
            </div>
            {destination ? (
              <div className='p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl'>
                <p className='font-semibold text-red-800'>{destination.name}</p>
                <p className='text-sm text-red-600 mt-2 font-mono'>
                  {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                </p>
                <button
                  onClick={() => {
                    setDestination(null);
                    setCalculation(null);
                  }}
                  className='text-sm text-red-600 hover:text-red-800 mt-3 font-medium'
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className='p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center'>
                <p className='text-gray-500 text-sm'>
                  {origin
                    ? "Click in California to set destination"
                    : "Set origin point first"}
                </p>
              </div>
            )}
          </div>

          {calculation && (
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                <span className='text-xl'>📊</span>
                Route Analysis
              </h3>

              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-xs text-blue-600 font-medium'>
                    Straight Distance
                  </p>
                  <p className='text-lg font-bold text-blue-800'>
                    {calculation.straight_distance.toFixed(1)} mi
                  </p>
                </div>
                <div className='p-3 bg-purple-50 border border-purple-200 rounded-lg'>
                  <p className='text-xs text-purple-600 font-medium'>
                    Road Distance
                  </p>
                  <p className='text-lg font-bold text-purple-800'>
                    {calculation.road_distance.toFixed(1)} mi
                  </p>
                </div>
              </div>

              <div
                className={`p-4 border rounded-xl ${getEfficiencyColor(
                  calculation.circuity_factor
                )}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-semibold'>Circuity Factor</span>
                  <span className='px-2 py-1 bg-white/60 rounded-full text-xs font-bold'>
                    {getEfficiencyLabel(calculation.circuity_factor)}
                  </span>
                </div>
                <div className='flex items-end gap-3'>
                  <span className='text-2xl font-bold'>
                    {calculation.circuity_factor.toFixed(3)}
                  </span>
                  <span className='text-sm mb-1'>
                    {calculation.efficiency_percent.toFixed(1)}% efficient
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
                <span>⚡ {calculation.calculation_time_ms}ms</span>
                {calculation.cached && <span>💾 Cached</span>}
              </div>
            </div>
          )}
          <div className='space-y-3'>
            {origin && destination && (
              <button
                onClick={swapPoints}
                className='w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                🔄 Swap Points
              </button>
            )}

            <button
              onClick={clearAll}
              disabled={!origin && !destination}
              className='w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none'
            >
              🗑️ Clear All
            </button>
          </div>

          {origin && destination && (
            <div className='border-t pt-6 space-y-3'>
              <h3 className='font-semibold text-gray-700'>📏 Line Types</h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-6 h-0.5 bg-red-500 opacity-80'
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to right, #ef4444, #ef4444 4px, transparent 4px, transparent 8px)",
                    }}
                  ></div>
                  <span className='text-sm text-gray-600'>
                    Straight line (crow flies)
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-6 h-0.5 bg-blue-500'></div>
                  <span className='text-sm text-gray-600'>OSRM road route</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex-1 h-full'>
        <Map
          origin={origin}
          destination={destination}
          onMapClick={handleMapClick}
          onCalculationResult={setCalculation}
        />
      </div>
    </div>
  );
}

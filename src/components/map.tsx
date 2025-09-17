"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import { calculateCircuity, CalculateResponse } from "@/lib/api";
import californiaBoundary from "@/data/california.json";

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// California bounds
const CALIFORNIA_BOUNDS = {
  north: 42.0,
  south: 32.5,
  east: -114.6,
  west: -124.4,
};

const CALIFORNIA_CENTER: [number, number] = [36.7783, -119.4179];

interface Point {
  lat: number;
  lng: number;
  name: string;
}

interface MapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (lat: number, lng: number) => void;
  onCalculationResult: (result: CalculateResponse | null) => void;
}

function isInCalifornia(lat: number, lng: number): boolean {
  return (
    lat >= CALIFORNIA_BOUNDS.south &&
    lat <= CALIFORNIA_BOUNDS.north &&
    lng >= CALIFORNIA_BOUNDS.west &&
    lng <= CALIFORNIA_BOUNDS.east
  );
}

function MapEvents({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (isInCalifornia(lat, lng)) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
}

const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        <span style="transform: rotate(45deg);">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function Map({
  origin,
  destination,
  onMapClick,
  onCalculationResult,
}: MapProps) {
  const mapRef = useRef<L.Map>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculation, setCalculation] = useState<CalculateResponse | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [osrmRoute, setOsrmRoute] = useState<[number, number][]>([]);
  const [mapKey, setMapKey] = useState(0); // Force remount on errors

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.warn("Error cleaning up map:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      try {
        const map = mapRef.current;
        const bounds = L.latLngBounds(
          [CALIFORNIA_BOUNDS.south, CALIFORNIA_BOUNDS.west],
          [CALIFORNIA_BOUNDS.north, CALIFORNIA_BOUNDS.east]
        );
        map.setMaxBounds(bounds);
        map.options.minZoom = 6;
        map.options.maxZoom = 18;
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch (error) {
        console.warn("Error setting up map bounds:", error);
        // Force remount on error
        setMapKey((prev) => prev + 1);
      }
    }
  }, [mapKey]);

  useEffect(() => {
    if (origin && destination) {
      handleCalculation();
    } else {
      setCalculation(null);
      setOsrmRoute([]);
      onCalculationResult(null);
    }
  }, [origin, destination]);

  const handleCalculation = async () => {
    if (!origin || !destination) return;

    setIsCalculating(true);
    setOsrmRoute([]);

    try {
      const result = await calculateCircuity({
        origin: {
          lat: origin.lat,
          lng: origin.lng,
          name: origin.name,
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          name: destination.name,
        },
        units: "miles",
      });

      setCalculation(result);
      onCalculationResult(result);

      // If backend returns route geometry then use it
      if (result.route_geometry) {
        setOsrmRoute(result.route_geometry as [number, number][]);
      } else {
        // Fallback: fetch OSRM route directly
        await fetchOSRMRoute();
      }
    } catch (error) {
      console.error("Calculation failed:", error);
      onCalculationResult(null);
      // Still try to show OSRM route even if backend fails
      await fetchOSRMRoute();
    } finally {
      setIsCalculating(false);
    }
  };

  const fetchOSRMRoute = async () => {
    if (!origin || !destination) return;

    try {
      const osrmUrl = `http://localhost:5001/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates;
        const leafletCoords: [number, number][] = coordinates.map(
          (coord: number[]) => [coord[1], coord[0]]
        );
        setOsrmRoute(leafletCoords);
      }
    } catch (error) {
      console.error("OSRM route fetch failed:", error);
    }
  };

  useEffect(() => {
    if (mapRef.current && origin && destination) {
      try {
        const bounds = L.latLngBounds([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng],
        ]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.warn("Error fitting bounds:", error);
      }
    }
  }, [origin, destination]);

  const originIcon = createCustomIcon("#10b981", "A");
  const destinationIcon = createCustomIcon("#ef4444", "B");

  const straightLine =
    origin && destination
      ? ([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng],
        ] as [number, number][])
      : [];

  return (
    <div className='w-full h-full relative' ref={containerRef}>
      <MapContainer
        key={mapKey} // Force remount on errors
        center={CALIFORNIA_CENTER}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
        className='rounded-xl'
        whenReady={() => {
          console.log("Map is ready");
        }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='© OpenStreetMap contributors'
          maxZoom={19}
        />
        <GeoJSON
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={californiaBoundary as any}
          style={{
            color: "#121003ff",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0,
          }}
        />

        <MapEvents onMapClick={onMapClick} />

        {origin && (
          <Marker
            position={[origin.lat, origin.lng]}
            icon={originIcon}
            title={`Origin: ${origin.name}`}
          />
        )}

        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
            title={`Destination: ${destination.name}`}
          />
        )}

        {straightLine.length > 0 && (
          <Polyline
            positions={straightLine}
            pathOptions={{
              color: "#ef4444",
              weight: 3,
              opacity: 0.7,
              dashArray: "10, 10",
            }}
          />
        )}

        {osrmRoute.length > 0 && (
          <Polyline
            positions={osrmRoute}
            pathOptions={{
              color: "#3b82f6",
              weight: 4,
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>

      {isCalculating && (
        <div className='absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl'>
          <div className='bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 flex items-center gap-4'>
            <div className='w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin'></div>
            <span className='font-medium text-white'>Calculating route...</span>
          </div>
        </div>
      )}

      <div className='absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-white/80 border border-white/20'>
        📍 California Routes Only
      </div>

      {!origin && !destination && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 max-w-sm text-center pointer-events-none'>
          <div className='text-3xl mb-3'>🌉</div>
          <h3 className='font-bold text-white mb-2'>California Routes</h3>
          <p className='text-sm text-white/70'>
            Click anywhere in California to set your origin and destination
            points
          </p>
        </div>
      )}

      {origin && !destination && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 backdrop-blur-xl rounded-xl p-6 border border-emerald-400/20 max-w-sm text-center pointer-events-none'>
          <div className='text-2xl mb-3'>✅</div>
          <h3 className='font-bold text-emerald-300 mb-2'>
            Origin Set: {origin.name}
          </h3>
          <p className='text-sm text-white/70'>
            Now click your destination point on the map
          </p>
        </div>
      )}
    </div>
  );
}

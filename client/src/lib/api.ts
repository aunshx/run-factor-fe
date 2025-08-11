// lib/api.ts - Backend Integration
export interface CalculateRequest {
  origin: {
    lat: number;
    lng: number;
    name?: string;
  };
  destination: {
    lat: number;
    lng: number;
    name?: string;
  };
  units: "miles" | "km";
}

export interface CalculateResponse {
  origin: {
    lat: number;
    lng: number;
    name?: string;
  };
  destination: {
    lat: number;
    lng: number;
    name?: string;
  };
  road_distance: number;
  straight_distance: number;
  circuity_factor: number;
  efficiency_percent: number;
  units: string;
  calculation_time_ms: number;
  cached: boolean;
  route_geometry?: number[][]; // OSRM route coordinates
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function calculateCircuity(
  request: CalculateRequest
): Promise<CalculateResponse> {
  try {
    const response = await fetch(`${API_BASE}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error - check if backend is running", 0);
  }
}

export async function getHistory(): Promise<CalculateResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch history", 0);
  }
}

export async function getStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch statistics", 0);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

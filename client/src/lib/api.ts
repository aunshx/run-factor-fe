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

export interface HistoryResponse {
  id: number;
  calculation_time_ms: number;
  circuity_factor: number;
  created_at: string; // ISO timestamp
  origin_lat: number;
  origin_lng: number;
  origin_name: string;
  destination_lat: number;
  destination_lng: number;
  destination_name: string;
  road_distance: number;
  straight_distance: number;
  units: string; // e.g., "miles"
}

export interface PaginatedHistoryResponse {
  length: number;
  items: HistoryResponse[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface HistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "newest" | "oldest" | "circuity_asc" | "circuity_desc";
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

export async function getHistoryPaginated(
  params: HistoryParams = {}
): Promise<PaginatedHistoryResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.sort_by) searchParams.append("sort_by", params.sort_by);

    const url = `${API_BASE}/history${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch paginated history", 0);
  }
}

// Legacy function for backward compatibility
export async function getHistory(): Promise<HistoryResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/history_simple`);
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

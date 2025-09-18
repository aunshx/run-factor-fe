# California Circuity Factor Calculator

A comprehensive web application for analyzing transportation network efficiency across California using circuity factor methodology. This system combines interactive mapping, geospatial analysis, and route optimization to quantify the efficiency of road networks by comparing actual driving distances to straight-line distances.

## Overview

The Circuity Factor is defined as the ratio of network distance (actual driving route) to geodetic distance (straight-line distance) between two points:

```
Circuity Factor = Road Distance / Straight-Line Distance
```

A circuity factor of 1.0 represents perfect efficiency (straight-line routing), while higher values indicate less efficient routing due to terrain, infrastructure constraints, or network design.

## Features

- **Interactive Map Interface**: Click anywhere in California to set origin and destination points
- **Real-time Route Calculation**: Instant circuity factor computation with visual route display
- **Advanced Search**: Location search powered by Nominatim geocoding service
- **Calculation History**: Database of all previous calculations with filtering and pagination
- **Performance Monitoring**: Backend health status and calculation timing metrics
- **Responsive Design**: Modern UI with glassmorphism effects and smooth animations

## Technology Stack

### Frontend
- **Next.js 15.4.6** with React 19.1.0
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Leaflet.js** with React Leaflet for interactive mapping
- **Lucide React** for icons
- **ESRi Leaflet** for enhanced mapping features

### Backend (Not included in this repository)
- **FastAPI** with Python for high-performance API
- **PostgreSQL** with PostGIS for spatial data storage
- **OSRM** (Open Source Routing Machine) for route calculations
- **Multi-tier caching** system for performance optimization

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   └── database/
│   │       └── page.tsx          # Calculation history viewer
│   ├── components/
│   │   ├── map.tsx               # Interactive Leaflet map component
│   │   └── search-input.tsx      # Location search with autocomplete
│   ├── hooks/
│   │   └── useNominatim.ts       # Custom hook for geocoding
│   ├── lib/
│   │   └── api.ts                # API client functions
│   └── data/
│       └── california.json       # California boundary GeoJSON
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend API server running (see backend repository)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd california-circuity-factor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Calculating Circuity Factors

1. **Set Origin Point**: Click anywhere in California to place your starting point (marked as "A")
2. **Set Destination**: Click another location to set your destination (marked as "B")
3. **View Results**: The system automatically calculates and displays:
   - Straight-line distance (geodetic distance)
   - Road network distance (via OSRM routing)
   - Circuity factor and efficiency percentage
   - Route visualization on the map

### Interpreting Results

- **Circuity Factor < 1.2**: Excellent efficiency
- **Circuity Factor 1.2-1.5**: Good efficiency  
- **Circuity Factor 1.5-2.0**: Fair efficiency
- **Circuity Factor > 2.0**: Poor efficiency (significant detours required)

### Database Explorer

Access the calculation history at `/database` to:
- View all previous calculations in a paginated table
- Search by location names, coordinates, or circuity values
- Sort by date, circuity factor, or other metrics
- Analyze patterns in transportation efficiency

## API Integration

The frontend communicates with a backend API that provides:

### Endpoints
- `POST /calculate` - Calculate circuity factor for route pair
- `GET /history` - Retrieve calculation history with pagination
- `GET /health` - Backend health check
- `GET /stats` - System performance statistics

### Data Models
```typescript
interface CalculateRequest {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  units: "miles" | "km";
}

interface CalculateResponse {
  road_distance: number;
  straight_distance: number;
  circuity_factor: number;
  efficiency_percent: number;
  calculation_time_ms: number;
  cached: boolean;
  route_geometry?: number[][];
}
```

## Performance Features

- **Intelligent Caching**: Backend caches route calculations to avoid redundant computations
- **Spatial Indexing**: Optimized database queries for large-scale analysis
- **Async Processing**: Non-blocking UI updates during calculations
- **Distance Filtering**: Limits analysis to meaningful route distances (5-50km)
- **Batch Operations**: Efficient handling of multiple route calculations

## Geographic Constraints

- **California-Only**: Application is restricted to California state boundaries
- **Coordinate Validation**: Ensures all points fall within California bounds
- **Administrative Boundaries**: Integrates county-level boundary data
- **Road Network**: Uses OpenStreetMap data processed through OSRM

## Development

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Type Checking
The project uses TypeScript with strict type checking. All components and utilities are fully typed.

## Browser Support

- Modern browsers with ES2020+ support
- WebGL-capable browsers for advanced mapping features
- Responsive design for mobile and desktop devices

## Research Applications

This application supports transportation research including:

- **Network Efficiency Analysis**: Quantitative assessment of road network performance
- **Regional Comparisons**: Comparative analysis across California counties
- **Infrastructure Planning**: Evidence-based transportation decision making
- **Academic Research**: Data collection for transportation efficiency studies

Research has shown circuity factors ranging from 1.466 in urban areas (Alameda County) to 4.089 in complex agricultural regions (Fresno County), demonstrating significant spatial heterogeneity in transportation network efficiency.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenStreetMap** contributors for road network data
- **Nominatim** service for geocoding functionality
- **OSRM** project for high-performance routing
- **Leaflet.js** community for mapping capabilities
- **California Department of Transportation** for administrative boundary data

## Related Work

For detailed technical documentation, algorithm descriptions, and research findings, see:
- Backend repository: [https://github.com/aunshx/run-factor-be](https://github.com/aunshx/run-factor-be)

---

**Note**: This frontend application requires a compatible backend API server to function. Please ensure the backend is running and accessible at the configured `NEXT_PUBLIC_API_BASE_URL` before using the application.
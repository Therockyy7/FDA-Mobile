// features/map/services/route.service.ts
import polyline from "@mapbox/polyline";

// OSRM Public Demo Server (Free, for testing only)
// In production, use your own OSRM server or Google Directions API
const OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export const RouteService = {
  /**
   * Fetch detailed route geometry between two points using OSRM
   */
  getRouteShape: async (start: LatLng, end: LatLng): Promise<LatLng[]> => {
    try {
      // OSRM expects "lng,lat" formatted string
      const startStr = `${start.longitude},${start.latitude}`;
      const endStr = `${end.longitude},${end.latitude}`;

      const url = `${OSRM_API_URL}/${startStr};${endStr}?overview=full&geometries=polyline`;

      console.log("🗺️ Fetching route shape:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        console.warn("⚠️ OSRM could not find route:", data.code);
        return [];
      }

      // Decode the polyline geometry
      const encodedPolyline = data.routes[0].geometry;
      const points = polyline.decode(encodedPolyline);

      // Convert format [lat, lng] -> { latitude, longitude }
      return points.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
    } catch (error) {
      console.error("❌ Error fetching route shape:", error);
      return [];
    }
  },

  /**
   * Helper to get start and end points from a list of coordinates
   */
  getEndpoints: (coordinates: LatLng[]) => {
    if (!coordinates || coordinates.length < 2) return null;
    return {
      start: coordinates[0],
      end: coordinates[coordinates.length - 1],
    };
  },
};

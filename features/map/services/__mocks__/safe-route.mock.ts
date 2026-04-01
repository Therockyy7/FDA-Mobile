// features/map/services/__mocks__/safe-route.mock.ts
// Dev-only mock data for SafeRouteService — DO NOT import in production code

import type { SafeRouteResponse } from "../../types/safe-route.types";

export const MOCK_SAFE_ROUTE_RESPONSE: SafeRouteResponse = {
  success: true,
  message: "Safe route calculated successfully",
  statusCode: 200,
  data: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [108.237932, 16.030218],
            [108.23814, 16.029985],
            [108.238596, 16.029284],
            [108.239072, 16.029516],
            [108.240068, 16.028775],
            [108.241941, 16.029686],
            [108.244695, 16.031046],
            [108.246203, 16.031774],
            [108.245586, 16.03338],
            [108.244351, 16.035815],
            [108.243139, 16.038183],
            [108.242122, 16.040186],
            [108.239819, 16.044671],
            [108.239008, 16.046429],
            [108.238325, 16.048808],
            [108.237348, 16.052142],
            [108.236813, 16.053674],
            [108.235932, 16.05665],
            [108.23542, 16.058392],
            [108.234545, 16.061272],
            [108.232976, 16.061441],
            [108.230005, 16.061324],
            [108.224246, 16.061131],
            [108.224122, 16.062283],
            [108.222681, 16.062674],
            [108.222012, 16.062732],
          ],
        },
        properties: {
          name: "safeRoute",
          distanceMeters: 6429.105,
          durationSeconds: 421,
          floodRiskScore: 100,
          instructions: [
            { distance: 119.332, time: 14320, text: "Di chuyển trên Đường Giang Châu 2" },
            { distance: 758.032, time: 59325, text: "Rẽ trái vào Đường Bùi Tá Hán" },
            { distance: 2591.797, time: 167287, text: "Rẽ trái vào Đường Lê Văn Hiến" },
            { distance: 1090.45, time: 59479, text: "Rẽ trái" },
            { distance: 0, time: 0, text: "Đến nơi" },
          ],
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [108.221589, 16.0625],
              [108.222991, 16.061153],
              [108.221589, 16.0598],
              [108.220187, 16.061153],
              [108.221589, 16.0625],
            ],
          ],
        },
        properties: {
          name: "floodZone",
          stationId: "mock-station-1",
          stationCode: "ST_DN_DRAGON_01",
          stationName: "Trạm Quan Trắc Cầu Rồng",
          severity: "critical",
          severityLevel: 3,
          waterLevel: 40.52,
          unit: "cm",
          latitude: 16.061153,
          longitude: 108.221589,
          distanceFromRouteMeters: 181.3,
        },
      },
    ],
    metadata: {
      safetyStatus: 2,
      totalFloodZones: 1,
      alternativeRouteCount: 0,
      generatedAt: new Date().toISOString(),
      startInFloodZone: false,
      endInFloodZone: false,
    },
  },
};

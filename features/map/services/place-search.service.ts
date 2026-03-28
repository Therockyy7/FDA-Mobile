// features/map/services/place-search.service.ts
// VietMap Autocomplete & Place Detail API calls

import type { PlaceDetail, PlacePrediction } from "../hooks/usePlaceSearch";
import { MapServiceError } from "./map-service-error";

const VIETMAP_API_KEY = process.env.EXPO_PUBLIC_VIETMAP_API_KEY ?? "";

// Danang center for biasing search results
const DANANG_LAT = 16.0544;
const DANANG_LNG = 108.2022;

export class PlaceSearchService {
  static async autocomplete(
    input: string,
    focusLat: number = DANANG_LAT,
    focusLng: number = DANANG_LNG,
  ): Promise<PlacePrediction[]> {
    try {
      const params = new URLSearchParams({
        apikey: VIETMAP_API_KEY,
        text: input,
        "focus.point.lat": String(focusLat),
        "focus.point.lon": String(focusLng),
      });

      const res = await fetch(`https://maps.vietmap.vn/api/autocomplete/v3?${params}`);

      if (!res.ok) {
        throw new MapServiceError("VietMap autocomplete request failed", res.status);
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data.slice(0, 5).map((item: any): PlacePrediction => {
        const name = item.name ?? "";
        const address = item.address ?? "";
        const display = item.display ?? `${name}, ${address}`;
        return {
          placeId: item.ref_id ?? "",
          mainText: name,
          secondaryText: address,
          fullText: display,
        };
      });
    } catch (error: any) {
      if (error instanceof MapServiceError) throw error;
      throw new MapServiceError(
        error?.message || "Failed to fetch place suggestions",
      );
    }
  }

  static async getPlaceDetail(
    prediction: PlacePrediction,
  ): Promise<PlaceDetail | null> {
    // Coords embedded in placeId for geo_ results
    if (prediction.placeId.startsWith("geo_")) {
      const [lat, lng] = prediction.placeId
        .replace("geo_", "")
        .split(",")
        .map(Number);
      return {
        placeId: prediction.placeId,
        name: prediction.mainText,
        address: prediction.fullText,
        coordinate: { latitude: lat, longitude: lng },
      };
    }

    try {
      const params = new URLSearchParams({
        apikey: VIETMAP_API_KEY,
        refid: prediction.placeId,
      });

      const res = await fetch(`https://maps.vietmap.vn/api/place/v3?${params}`);

      if (!res.ok) {
        throw new MapServiceError("VietMap place detail request failed", res.status);
      }

      const data = await res.json();

      if (data.lat && data.lng) {
        return {
          placeId: prediction.placeId,
          name: data.name || prediction.mainText,
          address: data.display || prediction.fullText,
          coordinate: { latitude: data.lat, longitude: data.lng },
        };
      }

      return null;
    } catch (error: any) {
      if (error instanceof MapServiceError) throw error;
      throw new MapServiceError(
        error?.message || "Failed to fetch place detail",
      );
    }
  }
}

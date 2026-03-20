// features/map/hooks/usePlaceSearch.ts
// Location search using VietMap Autocomplete API (free, optimized for Vietnam)

import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "../types/safe-route.types";

const VIETMAP_API_KEY = process.env.EXPO_PUBLIC_VIETMAP_API_KEY ?? "";

// Danang center for biasing results
const DANANG_LAT = 16.0544;
const DANANG_LNG = 108.2022;

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  coordinate: LatLng;
}

export function usePlaceSearch() {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(query);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchPredictions = useCallback(async (input: string) => {
    try {
      const results = await fetchVietMapAutocomplete(input);
      setPredictions(results);
    } catch (err) {
      console.warn("[PlaceSearch] search error:", err);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getPlaceDetail = useCallback(
    async (prediction: PlacePrediction): Promise<PlaceDetail | null> => {
      // If placeId starts with "geo_" coords are embedded
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

      // For VietMap ref_id, fetch place detail
      try {
        const params = new URLSearchParams({
          apikey: VIETMAP_API_KEY,
          refid: prediction.placeId,
        });
        const res = await fetch(
          `https://maps.vietmap.vn/api/place/v3?${params}`
        );
        const data = await res.json();
        if (data.lat && data.lng) {
          return {
            placeId: prediction.placeId,
            name: data.name || prediction.mainText,
            address: data.display || prediction.fullText,
            coordinate: { latitude: data.lat, longitude: data.lng },
          };
        }
      } catch (err) {
        console.warn("[PlaceSearch] VietMap place detail error:", err);
      }

      return null;
    },
    []
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setPredictions([]);
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    predictions,
    isSearching,
    getPlaceDetail,
    clearSearch,
  };
}

// ==================== INTERNAL HELPERS ====================

async function fetchVietMapAutocomplete(
  input: string
): Promise<PlacePrediction[]> {
  const params = new URLSearchParams({
    apikey: VIETMAP_API_KEY,
    text: input,
    "focus.point.lat": String(DANANG_LAT),
    "focus.point.lon": String(DANANG_LNG),
  });

  const res = await fetch(
    `https://maps.vietmap.vn/api/autocomplete/v3?${params}`
  );
  const data = await res.json();

  // VietMap v3 returns an array directly
  if (!Array.isArray(data) || data.length === 0) {
    console.log("[PlaceSearch] VietMap returned 0 results");
    return [];
  }

  console.log("[PlaceSearch] VietMap results:", data.length);

  return data.slice(0, 5).map((item: any) => {
    const name = item.name ?? "";
    const address = item.address ?? "";
    const display = item.display ?? `${name}, ${address}`;
    const refId = item.ref_id ?? "";

    return {
      placeId: refId,
      mainText: name,
      secondaryText: address,
      fullText: display,
    };
  });
}

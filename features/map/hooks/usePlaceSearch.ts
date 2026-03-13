// features/map/hooks/usePlaceSearch.ts
// Location search using expo-location geocoding + Google Places Autocomplete

import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "../types/safe-route.types";

const GOOGLE_MAPS_API_KEY = "AIzaSyB8drKIcdo8Ty_yzkXNBpYsF3w7Oi_r3mU";

// Danang center for biasing results
const DANANG_LAT = 16.0544;
const DANANG_LNG = 108.2022;
const BIAS_RADIUS = 30000; // 30km

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
  const sessionTokenRef = useRef(generateSessionToken());

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
      // Try Google Places Autocomplete first
      const googleResults = await fetchGooglePredictions(input);
      if (googleResults.length > 0) {
        setPredictions(googleResults);
        setIsSearching(false);
        return;
      }

      // Fallback to expo-location geocoding
      const geoResults = await fetchGeocodePredictions(input);
      setPredictions(geoResults);
    } catch (err) {
      console.warn("[PlaceSearch] search error:", err);
      // Try geocode fallback on error
      try {
        const geoResults = await fetchGeocodePredictions(input);
        setPredictions(geoResults);
      } catch {
        setPredictions([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getPlaceDetail = useCallback(
    async (prediction: PlacePrediction): Promise<PlaceDetail | null> => {
      // If placeId starts with "geo_" it's from geocoding, coords are in placeId
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

      // Google Place Details
      try {
        const params = new URLSearchParams({
          place_id: prediction.placeId,
          key: GOOGLE_MAPS_API_KEY,
          sessiontoken: sessionTokenRef.current,
          fields: "geometry,name,formatted_address",
          language: "vi",
        });

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?${params}`
        );
        const data = await res.json();

        if (data.status === "OK" && data.result) {
          const { result } = data;
          sessionTokenRef.current = generateSessionToken();
          return {
            placeId: prediction.placeId,
            name: result.name ?? "",
            address: result.formatted_address ?? "",
            coordinate: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
          };
        }
      } catch (err) {
        console.warn("[PlaceSearch] details error:", err);
      }

      // Fallback: geocode the full text
      try {
        const results = await Location.geocodeAsync(
          prediction.fullText + ", Đà Nẵng, Vietnam"
        );
        if (results.length > 0) {
          return {
            placeId: prediction.placeId,
            name: prediction.mainText,
            address: prediction.fullText,
            coordinate: {
              latitude: results[0].latitude,
              longitude: results[0].longitude,
            },
          };
        }
      } catch {
        // ignored
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

async function fetchGooglePredictions(
  input: string
): Promise<PlacePrediction[]> {
  try {
    const params = new URLSearchParams({
      input,
      key: GOOGLE_MAPS_API_KEY,
      sessiontoken: `${Date.now()}`,
      language: "vi",
      components: "country:vn",
      location: `${DANANG_LAT},${DANANG_LNG}`,
      radius: String(BIAS_RADIUS),
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    );
    const data = await res.json();
    console.log("[PlaceSearch] Google Autocomplete status:", data.status, "count:", data.predictions?.length ?? 0);

    if (data.status === "OK" && data.predictions?.length > 0) {
      return data.predictions.slice(0, 5).map((p: any) => ({
        placeId: p.place_id,
        mainText: p.structured_formatting?.main_text ?? p.description,
        secondaryText: p.structured_formatting?.secondary_text ?? "",
        fullText: p.description,
      }));
    }

    // If Autocomplete returns no results, try Google Geocoding for multiple results
    if (data.status !== "OK" || !data.predictions?.length) {
      console.log("[PlaceSearch] Autocomplete empty, trying Google Geocoding...");
      const geocodeResults = await fetchGoogleGeocode(input);
      if (geocodeResults.length > 0) return geocodeResults;
    }
  } catch (err) {
    console.warn("[PlaceSearch] Google Autocomplete error:", err);
    // Try Google Geocoding as fallback
    try {
      const geocodeResults = await fetchGoogleGeocode(input);
      if (geocodeResults.length > 0) return geocodeResults;
    } catch {
      // will fall through to expo-location
    }
  }
  return [];
}

async function fetchGeocodePredictions(
  input: string
): Promise<PlacePrediction[]> {
  // Use Google Geocoding API for multiple results
  try {
    const googleResults = await fetchGoogleGeocode(input);
    if (googleResults.length > 0) return googleResults;
  } catch (err) {
    console.warn("[PlaceSearch] Google Geocoding error:", err);
  }

  // Fallback to expo-location geocoding (usually returns only 1 result)
  const searchText =
    input.includes("Đà Nẵng") || input.includes("Da Nang")
      ? input
      : `${input}, Đà Nẵng, Vietnam`;

  const results = await Location.geocodeAsync(searchText);
  if (results.length === 0) return [];

  const predictions: PlacePrediction[] = [];
  for (const result of results.slice(0, 5)) {
    let mainText = input;
    let secondaryText = "Đà Nẵng, Vietnam";

    try {
      const reverseResults = await Location.reverseGeocodeAsync({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      if (reverseResults.length > 0) {
        const place = reverseResults[0];
        const parts = [place.street, place.district, place.subregion].filter(
          Boolean
        );
        if (parts.length > 0) {
          mainText = place.street || place.name || input;
          secondaryText = [place.district, place.subregion, place.city]
            .filter(Boolean)
            .join(", ");
        }
      }
    } catch {
      // Use default text
    }

    predictions.push({
      placeId: `geo_${result.latitude},${result.longitude}`,
      mainText,
      secondaryText,
      fullText: `${mainText}, ${secondaryText}`,
    });
  }

  return predictions;
}

async function fetchGoogleGeocode(
  input: string
): Promise<PlacePrediction[]> {
  const searchText =
    input.includes("Đà Nẵng") || input.includes("Da Nang")
      ? input
      : `${input}, Đà Nẵng, Vietnam`;

  const params = new URLSearchParams({
    address: searchText,
    key: GOOGLE_MAPS_API_KEY,
    language: "vi",
    region: "vn",
    bounds: `${DANANG_LAT - 0.15},${DANANG_LNG - 0.15}|${DANANG_LAT + 0.15},${DANANG_LNG + 0.15}`,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`
  );
  const data = await res.json();

  if (data.status === "OK" && data.results?.length > 0) {
    return data.results.slice(0, 5).map((r: any) => {
      const loc = r.geometry.location;
      // Extract short name and area from address components
      const mainText = extractMainText(r);
      const secondaryText = extractSecondaryText(r);

      return {
        placeId: `geo_${loc.lat},${loc.lng}`,
        mainText,
        secondaryText,
        fullText: r.formatted_address ?? `${mainText}, ${secondaryText}`,
      };
    });
  }
  return [];
}

function extractMainText(geocodeResult: any): string {
  const components = geocodeResult.address_components ?? [];
  // Try route (street name) first, then neighborhood, then locality
  for (const type of ["route", "neighborhood", "sublocality_level_1", "locality"]) {
    const comp = components.find((c: any) => c.types.includes(type));
    if (comp) return comp.long_name;
  }
  // Fallback to first part of formatted address
  return geocodeResult.formatted_address?.split(",")[0] ?? "";
}

function extractSecondaryText(geocodeResult: any): string {
  const components = geocodeResult.address_components ?? [];
  const parts: string[] = [];
  for (const type of ["administrative_area_level_2", "administrative_area_level_1"]) {
    const comp = components.find((c: any) => c.types.includes(type));
    if (comp && !parts.includes(comp.long_name)) parts.push(comp.long_name);
  }
  return parts.length > 0 ? parts.join(", ") : "Đà Nẵng, Vietnam";
}

function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

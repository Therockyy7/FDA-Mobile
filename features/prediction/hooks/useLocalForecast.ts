import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import { PredictionService } from "../services/prediction.service";
import type { PredictionResponse } from "../types/prediction.types";
import {
  formatLocationName,
  pickBestArea,
  scoreAreaMatch,
} from "../lib/districts-forecast-helpers";

export interface LocalForecastData {
  areaId: string;
  areaName: string;
  locationLabel: string;
  prediction: PredictionResponse;
}

export type LoadState =
  | "idle"
  | "location"
  | "area"
  | "prediction"
  | "done"
  | "error";

// ─────────────────────────────────────────────────────────────
// Module-level cache — persists across tab switches
// (unlike useState which resets on unmount)
// ─────────────────────────────────────────────────────────────
let _cachedForecast: LocalForecastData | null = null;
let _cacheTimestamp = 0;
/** Minimum ms before allowing a background re-fetch (5 minutes) */
const FORECAST_CACHE_TTL_MS = 5 * 60 * 1000;

export function useLocalForecast() {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [data, setData] = useState<LocalForecastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchForecast = useCallback(async (forceRefresh = false) => {
    try {
      // Cache-first: if cached data is fresh and not a forced refresh, use it
      if (
        !forceRefresh &&
        _cachedForecast &&
        Date.now() - _cacheTimestamp < FORECAST_CACHE_TTL_MS
      ) {
        setData(_cachedForecast);
        setLoadState("done");
        return;
      }

      setErrorMsg(null);
      setData(null);

      // Step 1: Request location permission & get coords
      setLoadState("location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Ứng dụng cần quyền truy cập vị trí");
        setLoadState("error");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;

      // Step 2: Reverse geocode to get ward/district name
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationLabel = geo ? formatLocationName(geo) : "Vị trí hiện tại";

      // Step 3: Find matching ADMINISTRATIVE AREA
      // IMPORTANT: PredictionService requires IDs from /api/v1/admin/administrative-areas
      // NOT from /api/v1/areas/me (user areas). These are completely different systems.
      setLoadState("area");
      let areaId: string | null = null;
      let areaName: string = locationLabel;

      // Build candidate search terms from geocoded address (most-specific first)
      // For Vietnamese addresses: district = ward name, city = district/quan, subregion = city
      const candidateTerms: string[] = [];
      if (geo) {
        if (geo.district) candidateTerms.push(geo.district);
        if (geo.name && geo.name !== geo.district) candidateTerms.push(geo.name);
        if (geo.city) candidateTerms.push(geo.city);
        if (geo.subregion) candidateTerms.push(geo.subregion);
      }

      // Strategy: for each candidate term, fetch up to 20 results and pick the
      // BEST-SCORING match (normalized name similarity), not blindly [0]
      for (const term of candidateTerms) {
        if (areaId) break;
        try {
          const adminRes = await AreaService.getAdminAreas({
            searchTerm: term,
            pageNumber: 1,
            pageSize: 20,
          });
          if (adminRes.administrativeAreas.length > 0) {
            const best = pickBestArea(adminRes.administrativeAreas, term);
            if (best) {
              areaId = best.id;
              areaName = best.name;
            }
          }
        } catch {
          // Skip failed search terms silently
        }
      }

      // Fallback: load ALL wards and score against every candidate term
      if (!areaId) {
        try {
          const allRes = await AreaService.getAdminAreas({
            pageNumber: 1,
            pageSize: 100,
          });
          if (allRes.administrativeAreas.length > 0) {
            let topScore = 0;
            let topArea: { id: string; name: string } | null = null;
            for (const area of allRes.administrativeAreas) {
              for (const term of candidateTerms) {
                const s = scoreAreaMatch(area.name, term);
                if (s > topScore) {
                  topScore = s;
                  topArea = area;
                }
              }
            }
            const chosen = topArea ?? allRes.administrativeAreas[0];
            areaId = chosen.id;
            areaName = chosen.name;
          }
        } catch {
          // Could not fetch admin areas list
        }
      }

      if (!areaId) {
        setErrorMsg("Không tìm thấy khu vực phù hợp");
        setLoadState("error");
        return;
      }

      // Step 4: Fetch prediction
      setLoadState("prediction");
      const prediction = await PredictionService.getFloodRiskPrediction(areaId);

      const newData: LocalForecastData = {
        areaId,
        areaName,
        locationLabel,
        prediction,
      };

      // Save to module-level cache so tab switches don't re-trigger the full pipeline
      _cachedForecast = newData;
      _cacheTimestamp = Date.now();

      setData(newData);
      setLoadState("done");
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Không thể tải dự báo";
      setErrorMsg(errMsg);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { loadState, data, errorMsg, refetch: fetchForecast };
}

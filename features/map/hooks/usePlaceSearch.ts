// features/map/hooks/usePlaceSearch.ts
// Location search using VietMap Autocomplete API (free, optimized for Vietnam)

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlacePrediction, PlaceDetail } from "../types";
import { PlaceSearchService } from "../services";

export type { PlacePrediction, PlaceDetail };

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
      const results = await PlaceSearchService.autocomplete(input);
      setPredictions(results);
    } catch (err) {
      // non-critical
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getPlaceDetail = useCallback(
    async (prediction: PlacePrediction): Promise<PlaceDetail | null> => {
      try {
        return await PlaceSearchService.getPlaceDetail(prediction);
      } catch (err) {
        // non-critical
        return null;
      }
    },
    [],
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

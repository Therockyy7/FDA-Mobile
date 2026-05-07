import { useQuery } from "@tanstack/react-query";
import {
  PredictionRateLimitError,
  PredictionService,
} from "~/features/prediction/services/prediction.service";
import type { PredictionResponse } from "~/features/prediction/types/prediction.types";

export const predictionQueryKey = (areaId: string | null | undefined) =>
  ["prediction", "floodRisk", areaId] as const;

export function usePredictionQuery(areaId: string | null | undefined) {
  return useQuery<PredictionResponse>({
    queryKey: predictionQueryKey(areaId),
    queryFn: () => PredictionService.getFloodRiskPrediction(areaId as string),
    enabled: !!areaId,
    staleTime: 0,
    // Drop the (large) prediction payload from cache as soon as no consumer
    // is mounted. Default gcTime is 5 min, which keeps multi-MB responses
    // alive across screen unmounts and contributes to the Android OOM crash.
    gcTime: 0,
    retry: (failureCount, error) => {
      if (error instanceof PredictionRateLimitError) return false;
      return failureCount < 1;
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import type { PredictionResponse } from "~/features/prediction/types/prediction.types";

export const predictionQueryKey = (areaId: string | null | undefined) =>
  ["prediction", "floodRisk", areaId] as const;

export function usePredictionQuery(areaId: string | null | undefined) {
  return useQuery<PredictionResponse>({
    queryKey: predictionQueryKey(areaId),
    queryFn: () => PredictionService.getFloodRiskPrediction(areaId as string),
    enabled: !!areaId,
    staleTime: 0,
  });
}

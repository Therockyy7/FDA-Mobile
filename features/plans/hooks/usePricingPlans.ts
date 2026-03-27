// features/plans/hooks/usePricingPlans.ts
import { useQuery } from "@tanstack/react-query";
import { planService } from "../services/plan.service";
import { PlansResponse } from "../types/plans-types";

export const usePricingPlans = () => {
  return useQuery<PlansResponse, Error>({
    queryKey: ["plans", "pricing"],
    queryFn: () => planService.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

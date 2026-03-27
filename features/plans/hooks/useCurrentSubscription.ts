// features/plans/hooks/useCurrentSubscription.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { planService } from "../services/plan.service";
import { CurrentSubscriptionResponse } from "../types/plans-types";

export const useCurrentSubscription = () => {
  return useQuery<CurrentSubscriptionResponse, Error>({
    queryKey: ["plans", "subscription", "current"],
    queryFn: () => planService.getCurrentSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // 401 means user is not logged in - treat as no subscription
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
};

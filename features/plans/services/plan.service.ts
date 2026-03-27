// features/plans/services/plan.service.ts
import { apiClient } from "~/lib/api-client";
import { CurrentSubscriptionResponse, PlansResponse } from "../types/plans-types";

class PlanService {
  async getPlans(): Promise<PlansResponse> {
    const response = await apiClient.get<PlansResponse>("/api/v1/plans");
    return response.data;
  }

  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const response = await apiClient.get<CurrentSubscriptionResponse>(
      "/api/v1/plan/subscription/current"
    );
    return response.data;
  }
}

export const planService = new PlanService();

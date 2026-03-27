// features/plans/types/plans-types.ts

export interface PlanFeature {
  featureKey: string;
  featureName: string;
  featureValue: string;
  description: string | null;
}

export interface PricingPlan {
  id: string;
  code: "FREE" | "PREMIUM" | "MONITOR";
  name: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  tier: string;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
}

export interface PlansResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: PricingPlan[];
}

export interface UserSubscription {
  tier: "Free" | "Premium" | "Monitor";
  tierCode: "FREE" | "PREMIUM" | "MONITOR";
  planName: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "cancelled" | "expired" | "free";
  availableChannels: string[];
  dispatchDelay: {
    highPrioritySeconds: number;
    lowPrioritySeconds: number;
  };
  maxRetries: number;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  message: string;
  subscription: UserSubscription | null;
}

export type BillingCycle = "monthly" | "yearly";

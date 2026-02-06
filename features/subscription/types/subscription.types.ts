export type TierCode = "FREE" | "PREMIUM" | "MONITOR";

export interface DispatchDelay {
  highPrioritySeconds: number;
  lowPrioritySeconds: number;
}

export interface Subscription {
  tier: string;
  tierCode: TierCode;
  planName: string;
  description?: string;
  priceMonth?: number;
  priceYear?: number;
  startDate: string;
  endDate: string;
  status: string;
  availableChannels: string[];
  dispatchDelay: DispatchDelay;
  maxRetries: number;
}

export interface PlanItem {
  code: TierCode;
  name: string;
  description?: string;
  monthlyPrice?: number;
  features?: string[];
  highlight?: boolean;
}

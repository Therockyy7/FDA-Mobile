// features/plans/constants/queryKeys.ts
/** React Query key for GET current plan subscription — keep in sync everywhere it is invalidated. */
export const plansSubscriptionCurrentQueryKey = [
  "plans",
  "subscription",
  "current",
] as const;

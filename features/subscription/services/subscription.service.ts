import { apiClient } from "~/lib/api-client";
import type { Subscription, TierCode } from "../types/subscription.types";

export const SubscriptionService = {
  getCurrent: async (): Promise<Subscription | null> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        message?: string;
        subscription?: Subscription;
      }>("/api/v1/plan/subscription/current");

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Không thể tải gói đăng ký");
      }

      return res.data?.subscription ?? null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải gói đăng ký";
      console.error("❌ Failed to fetch subscription:", errorMessage);
      throw new Error(errorMessage);
    }
  },

  subscribe: async (
    planCode: TierCode,
    durationMonths: number
  ): Promise<Subscription | null> => {
    try {
      const res = await apiClient.post<{
        success: boolean;
        message?: string;
        subscription?: Subscription;
      }>("/api/v1/plan/subscription/subscribe", {
        planCode,
        durationMonths,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Không thể đăng ký gói");
      }

      return res.data?.subscription ?? null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đăng ký gói";
      console.error("❌ Failed to subscribe:", errorMessage);
      throw new Error(errorMessage);
    }
  },

  cancel: async (cancelReason?: string): Promise<void> => {
    try {
      if (cancelReason) {
        const res = await apiClient.delete<{
          success: boolean;
          message?: string;
        }>("/api/v1/plan/subscription/cancel", {
          data: { cancelReason },
        });
        if (!res.data?.success) {
          throw new Error(res.data?.message || "Không thể hủy gói đăng ký");
        }
        return;
      }

      const res = await apiClient.delete<{
        success: boolean;
        message?: string;
      }>("/api/v1/plan/subscription/cancel");
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Không thể hủy gói đăng ký");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể hủy gói đăng ký";
      console.error("❌ Failed to cancel subscription:", errorMessage);
      throw new Error(errorMessage);
    }
  },
};

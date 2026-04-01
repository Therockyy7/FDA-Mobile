// features/payment/services/payment.service.ts
import { apiClient } from "~/lib/api-client";
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  DowngradeSubscriptionRequest,
  DowngradeSubscriptionResponse,
  PaymentHistoryResponse,
  PaymentStatusResponse,
} from "../types/payment-types";

class PaymentService {
  /**
   * Create a PayOS payment link for a paid plan upgrade.
   */
  async createPaymentLink(
    payload: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    const response = await apiClient.post<CreatePaymentResponse>(
      "/api/v1/payment/create",
      payload,
    );
    return response.data;
  }

  /**
   * Get payment status by order code (used for polling).
   */
  async getPaymentStatus(orderCode: number): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<PaymentStatusResponse>(
      `/api/v1/payment/status/${orderCode}`,
    );
    return response.data;
  }

  /**
   * Downgrade to the FREE plan (no payment required).
   */
  async downgradeToFree(): Promise<DowngradeSubscriptionResponse> {
    const payload: DowngradeSubscriptionRequest = {
      planCode: "FREE",
      durationMonths: 12,
    };
    console.log(
      "🔽 [PaymentService] downgradeToFree - sending payload:",
      JSON.stringify(payload),
    );
    try {
      const response = await apiClient.post<DowngradeSubscriptionResponse>(
        "/api/v1/plan/subscription/subscribe",
        payload,
      );
      console.log(
        "🔽 [PaymentService] downgradeToFree - response status:",
        response.status,
      );
      console.log(
        "🔽 [PaymentService] downgradeToFree - response data:",
        JSON.stringify(response.data),
      );
      return response.data;
    } catch (err: any) {
      console.error("🔽 [PaymentService] downgradeToFree - ERROR:");
      console.error("  → status:", err?.response?.status);
      console.error("  → statusText:", err?.response?.statusText);
      console.error("  → data:", JSON.stringify(err?.response?.data));
      console.error("  → message:", err?.message);
      console.error("  → request URL:", err?.config?.url);
      console.error("  → request method:", err?.config?.method);
      console.error("  → request body:", err?.config?.data);
      console.error(
        "  → request headers:",
        JSON.stringify(err?.config?.headers),
      );
      throw err;
    }
  }

  /**
   * Get paginated billing/payment history (FE-38).
   */
  async getPaymentHistory(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaymentHistoryResponse> {
    const response = await apiClient.get<PaymentHistoryResponse>(
      `/api/v1/payment/history?page=${page}&pageSize=${pageSize}`,
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();

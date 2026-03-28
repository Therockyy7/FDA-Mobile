// features/payment/types/payment-types.ts

// ─── Enums / Unions ─────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "paid" | "cancelled" | "failed";

export type PlanCode = "FREE" | "PREMIUM" | "MONITOR";

export type DurationMonths = 1 | 3 | 6 | 12;

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreatePaymentRequest {
  planCode: Exclude<PlanCode, "FREE">;
  durationMonths: DurationMonths;
  returnUrl: string;
  cancelUrl: string;
}

export interface DowngradeSubscriptionRequest {
  planCode: "FREE";
  durationMonths: DurationMonths;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface CreatePaymentData {
  paymentUrl: string;
  orderCode: number;
}

export type CreatePaymentResponse = ApiResponse<CreatePaymentData>;

export interface SubscriptionPaymentDto {
  id: string;
  orderCode: number;
  planName: string;
  planCode: PlanCode;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  durationMonths: number;
  description: string;
  paidAt: string | null;
  createdAt: string;
}

export type PaymentStatusResponse = ApiResponse<SubscriptionPaymentDto>;

export interface DowngradeSubscriptionResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

// ─── Deep-link query params from PayOS callback ─────────────────────────────
export interface PaymentQueryParams {
  code?: string;
  id?: string;
  cancel?: string;
  status?: string;
  orderCode?: string;
}

// ─── UI State for success screen ────────────────────────────────────────────
export type PaymentResultState =
  | "loading" // initial loading
  | "pending" // polling, payment not yet confirmed
  | "paid" // payment confirmed
  | "cancelled" // payment was cancelled
  | "failed" // payment failed
  | "timeout"; // polling timed out

// ─── Billing History (FE-38) ─────────────────────────────────────────────────
export interface PaymentRecord {
  id: string;
  orderCode: number;
  planName: string;
  planCode: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "paid" | "pending" | "cancelled";
  durationMonths: number;
  description: string;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  statusCode: number;
  totalCount: number;
  data: PaymentRecord[];
}

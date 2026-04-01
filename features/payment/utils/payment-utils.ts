// features/payment/utils/payment-utils.ts
import { PaymentResultState, PaymentStatus } from "../types/payment-types";

// ─── Deep-link callback constants ───────────────────────────────────────────
export const PAYMENT_RETURN_URL = "fda-mobile://payment/success";
export const PAYMENT_CANCEL_URL = "fda-mobile://payment/cancel";

// ─── Format VND currency ────────────────────────────────────────────────────
export const formatVND = (amount: number): string => {
  if (amount === 0) return "Miễn phí";
  return `${amount.toLocaleString("vi-VN")}đ`;
};

// ─── Calculate total price for a given duration ─────────────────────────────
export const calculateTotalPrice = (
  pricePerMonth: number,
  durationMonths: number
): number => {
  return pricePerMonth * durationMonths;
};

// ─── Map payment status to UI tone ──────────────────────────────────────────
interface StatusUIConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string; // Ionicons name
}

export const getPaymentStatusUI = (
  status: PaymentResultState
): StatusUIConfig => {
  switch (status) {
    case "loading":
    case "pending":
      return {
        label: "Đang xác nhận thanh toán...",
        color: "#0077BE",
        bgColor: "rgba(0, 119, 190, 0.1)",
        icon: "time-outline",
      };
    case "paid":
      return {
        label: "Thanh toán thành công",
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        icon: "checkmark-circle",
      };
    case "cancelled":
      return {
        label: "Thanh toán đã bị hủy",
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
        icon: "close-circle",
      };
    case "failed":
      return {
        label: "Thanh toán thất bại",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        icon: "alert-circle",
      };
    case "timeout":
      return {
        label: "Xác nhận thanh toán đang xử lý",
        color: "#6366F1",
        bgColor: "rgba(99, 102, 241, 0.1)",
        icon: "hourglass-outline",
      };
  }
};

// ─── Map raw API status string to PaymentResultState ────────────────────────
export const mapApiStatusToResultState = (
  status: PaymentStatus
): PaymentResultState => {
  switch (status) {
    case "paid":
      return "paid";
    case "cancelled":
      return "cancelled";
    case "failed":
      return "failed";
    case "pending":
    default:
      return "pending";
  }
};

// ─── Safely parse orderCode from query params ──────────────────────────────
export const parseOrderCode = (
  value: string | string[] | undefined
): number | null => {
  if (!value) return null;
  const str = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? null : parsed;
};

// ─── Duration display helpers ───────────────────────────────────────────────
export interface DurationOption {
  months: 1 | 3 | 6 | 12;
  label: string;
  badge?: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { months: 1, label: "1 tháng" },
  { months: 3, label: "3 tháng", badge: "−5%" },
  { months: 6, label: "6 tháng", badge: "−10%" },
  { months: 12, label: "12 tháng", badge: "−20%" },
];

// ─── Vietnamese status label for raw API status ─────────────────────────────
export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "Đang chờ";
    case "paid":
      return "Đã thanh toán";
    case "cancelled":
      return "Đã hủy";
    case "failed":
      return "Thất bại";
    default:
      return status;
  }
};

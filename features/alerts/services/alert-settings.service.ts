import { apiClient } from "~/lib/api-client";
import type {
  AlertSettingsFormData,
  AlertSeverity,
} from "../types/alert-settings.types";

type ApiAlertSeverity = "caution" | "warning" | "critical";

interface AlertSubscriptionRequest {
  minSeverity: ApiAlertSeverity;
  enablePush: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface AlertSubscriptionResponse {
  success: boolean;
  message: string;
}

const mapSeverityToApi = (severity: AlertSeverity): ApiAlertSeverity =>
  severity.toLowerCase() as ApiAlertSeverity;

export const AlertSettingsService = {
  buildSubscriptionPayload: (
    settings: AlertSettingsFormData,
  ): AlertSubscriptionRequest => ({
    minSeverity: mapSeverityToApi(settings.minimumSeverity),
    enablePush: settings.notificationChannels.push,
    enableEmail: settings.notificationChannels.email,
    enableSms: settings.notificationChannels.sms,
    quietHoursStart: settings.quietHours.startTime,
    quietHoursEnd: settings.quietHours.endTime,
  }),

  updateSubscription: async (
    areaId: string,
    payload: AlertSubscriptionRequest,
  ): Promise<AlertSubscriptionResponse> => {
    try {
      console.log("🔔 Updating alert subscription:", areaId, payload);
      const res = await apiClient.put<AlertSubscriptionResponse>(
        `/api/v1/alerts/subscriptions/${areaId}`,
        payload,
      );
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const details = data?.errors
        ? typeof data.errors === "string"
          ? data.errors
          : JSON.stringify(data.errors)
        : null;
      const errorMessage =
        data?.message || error?.message || "Update failed";
      const combinedMessage = [
        errorMessage,
        status ? `Status ${status}` : null,
        details ? `Details: ${details}` : null,
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("❌ Failed to update alert subscription:", {
        areaId,
        status,
        data,
      });
      throw new Error(combinedMessage);
    }
  },
};

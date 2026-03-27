import { apiClient } from "~/lib/api-client";
import { NotificationHistoryRequest, NotificationHistoryResponse } from "../types/notifications-types";

class NotificationService {
  async getNotificationHistory(params: NotificationHistoryRequest): Promise<NotificationHistoryResponse> {
    const response = await apiClient.get<NotificationHistoryResponse>('/api/v1/notifications/history', {
      params,
    });
    return response.data;
  }
}

export const notificationService = new NotificationService();

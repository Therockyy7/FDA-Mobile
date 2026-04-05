import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import {
  NotificationHistoryRequest,
  NotificationHistoryResponse,
} from "../types/notifications-types";

export const useNotificationHistory = (
  params: NotificationHistoryRequest
) => {
  return useQuery<NotificationHistoryResponse, Error>({
    queryKey: ["notifications", "history", params],
    queryFn: () =>
      notificationService.getNotificationHistory({
        ...params,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
      }),
  });
};

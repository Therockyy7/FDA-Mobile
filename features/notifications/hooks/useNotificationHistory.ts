import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import {
  NotificationHistoryRequest,
  NotificationHistoryResponse,
} from "../types/notifications-types";

export const useNotificationHistory = (
  params: Omit<NotificationHistoryRequest, "pageNumber">
) => {
  return useInfiniteQuery<NotificationHistoryResponse, Error>({
    queryKey: ["notifications", "history", params],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotificationHistory({
        ...params,
        pageNumber: pageParam as number,
        pageSize: params.pageSize || 10,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

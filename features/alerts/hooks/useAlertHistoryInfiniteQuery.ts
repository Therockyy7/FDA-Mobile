import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertHistoryService } from "../services/alert-history.service";
import type { AlertHistoryItem, AlertHistoryResponse } from "../types/alert-history.types";

export const useAlertHistoryInfiniteQuery = ({
  pageSize = 10,
  severity,
}: {
  pageSize?: number;
  severity?: string;
}) => {
  return useInfiniteQuery<AlertHistoryResponse, Error>({
    queryKey: ["alerts", "history", { pageSize, severity }],
    queryFn: ({ pageParam = 1 }) =>
      AlertHistoryService.getHistory({
        pageNumber: pageParam as number,
        pageSize,
        severity,
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

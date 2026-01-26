import { apiClient } from "~/lib/api-client";
import type { AlertHistoryResponse } from "../types/alert-history.types";

interface AlertHistoryQuery {
  pageNumber: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  severity?: string;
  status?: string;
}

const buildQueryString = (params: AlertHistoryQuery) => {
  const query = new URLSearchParams();
  query.append("pageNumber", params.pageNumber.toString());
  query.append("pageSize", params.pageSize.toString());
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.severity) query.append("severity", params.severity);
  if (params.status) query.append("status", params.status);
  return query.toString();
};

export const AlertHistoryService = {
  getHistory: async (params: AlertHistoryQuery): Promise<AlertHistoryResponse> => {
    try {
      const query = buildQueryString(params);
      const res = await apiClient.get<AlertHistoryResponse>(
        `/api/v1/alerts/history?${query}`,
      );
      return res.data;
    } catch (error) {
      console.error("❌ Failed to fetch alert history:", error);
      throw error;
    }
  },
};

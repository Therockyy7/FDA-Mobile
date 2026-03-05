import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertHistoryService } from "../services/alert-history.service";
import type { AlertHistoryItem } from "../types/alert-history.types";

interface UseAlertHistoryDataOptions {
  pageNumber: number;
  pageSize: number;
  severity?: string;
}

export function useAlertHistoryData({
  pageNumber,
  pageSize,
  severity,
}: UseAlertHistoryDataOptions) {
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [allAlerts, setAllAlerts] = useState<AlertHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCountAll, setTotalCountAll] = useState(0);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await AlertHistoryService.getHistory({
        pageNumber,
        pageSize,
        severity,
      });
      setAlerts(res.alerts || []);
      setTotalPages(res.totalPages || 1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, severity]);

  const fetchCounts = useCallback(async () => {
    try {
      const first = await AlertHistoryService.getHistory({
        pageNumber: 1,
        pageSize: 50,
      });
      const total = first.totalPages || 1;
      const all = [...(first.alerts || [])];
      for (let page = 2; page <= total; page += 1) {
        const res = await AlertHistoryService.getHistory({
          pageNumber: page,
          pageSize: 50,
        });
        all.push(...(res.alerts || []));
      }
      setAllAlerts(all);
      setTotalCountAll(first.totalCount || all.length);
    } catch (error) {
      console.warn("⚠️ Failed to build alert counts:", error);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return Promise.all([fetchHistory(), fetchCounts()]).finally(() =>
      setRefreshing(false),
    );
  }, [fetchHistory, fetchCounts]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const severityCounts = useMemo(
    () => ({
      critical: allAlerts.filter((item) => item.severity === "critical").length,
      warning: allAlerts.filter((item) => item.severity === "warning").length,
      caution: allAlerts.filter((item) => item.severity === "caution").length,
    }),
    [allAlerts],
  );

  return {
    alerts,
    allAlerts,
    totalPages,
    totalCountAll,
    severityCounts,
    isLoading,
    refreshing,
    refresh,
  };
}

export default useAlertHistoryData;

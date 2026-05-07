// features/map/hooks/navigation/useNavigationStationMonitor.ts
// Subscribes to nearbyStationIds via SignalR and triggers refetch when severity increases.

import { useCallback, useEffect, useRef } from "react";
import {
  getFloodHubConnection,
  retainFloodHub,
  releaseFloodHub,
} from "~/lib/signalr-client";
import { useFloodRealtimeStore } from "../../stores/useFloodRealtimeStore";
import type { SensorUpdateData, SensorUpdatePayload } from "../../types/map-layers.types";

interface Params {
  nearbyStationIds: string[];
  isActive: boolean; // true khi có route (hasResults), kể cả trước khi navigate
  onSeverityIncreased: (stationName: string, alertLevel: string) => void;
}

export function useNavigationStationMonitor({
  nearbyStationIds,
  isActive,
  onSeverityIncreased,
}: Params) {
  const realtimeUpdatesRef = useRef(useFloodRealtimeStore.getState().updates);
  useEffect(() => {
    return useFloodRealtimeStore.subscribe((s) => {
      realtimeUpdatesRef.current = s.updates;
    });
  }, []);
  const stationSeverityMapRef = useRef(new Map<string, number>());
  const currentIdsRef = useRef<string[]>([]);
  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSeverityIncreasedRef = useRef(onSeverityIncreased);
  onSeverityIncreasedRef.current = onSeverityIncreased;

  const subscribeToStation = useCallback(async (id: string) => {
    try {
      await getFloodHubConnection().invoke("SubscribeToStation", id);
    } catch { /* non-critical */ }
  }, []);

  const unsubscribeFromStation = useCallback(async (id: string) => {
    try {
      await getFloodHubConnection().invoke("UnsubscribeFromStation", id);
    } catch { /* non-critical */ }
  }, []);

  // Retain/release hub independently — không dùng useFloodSignalR để tránh
  // stop hub khi thoát navigation và ảnh hưởng các consumer khác.
  useEffect(() => {
    if (!isActive) return;
    retainFloodHub().catch(() => {});
    return () => { releaseFloodHub().catch(() => {}); };
  }, [isActive]);

  // Re-subscribe khi nearbyStationIds thay đổi
  useEffect(() => {
    if (!isActive) return;

    const prev = currentIdsRef.current;
    prev.forEach((id) => unsubscribeFromStation(id));
    stationSeverityMapRef.current.clear();

    currentIdsRef.current = nearbyStationIds;
    nearbyStationIds.forEach((id) => {
      subscribeToStation(id);
      // Khởi tạo từ severity hiện tại trong store, không reset về 0
      // để tránh re-trigger ngay sau khi subscribe lại route mới
      const currentSeverity = realtimeUpdatesRef.current[id]?.severityLevel ?? 0;
      stationSeverityMapRef.current.set(id, currentSeverity);
    });

    return () => {
      currentIdsRef.current.forEach((id) => unsubscribeFromStation(id));
      stationSeverityMapRef.current.clear();
      currentIdsRef.current = [];
    };
  }, [nearbyStationIds, isActive, subscribeToStation, unsubscribeFromStation]);

  // Listen ReceiveStationUpdate — dùng stable handler ref để .off() hoạt động đúng
  useEffect(() => {
    if (!isActive) return;

    const connection = getFloodHubConnection();

    // Handler được define 1 lần duy nhất trong effect này
    // nên reference ổn định → .off() tìm đúng handler để xóa
    const handleUpdate = (raw: unknown) => {
      const payload = raw as SensorUpdatePayload | SensorUpdateData;
      const data: SensorUpdateData | null =
        "data" in (payload as SensorUpdatePayload) &&
        (payload as SensorUpdatePayload).data?.stationId
          ? (payload as SensorUpdatePayload).data
          : "stationId" in (payload as SensorUpdateData)
            ? (payload as SensorUpdateData)
            : null;

      if (!data) return;
      if (!stationSeverityMapRef.current.has(data.stationId)) return;

      const prevLevel = stationSeverityMapRef.current.get(data.stationId) ?? 0;
      stationSeverityMapRef.current.set(data.stationId, data.severityLevel);

      if (data.severityLevel > prevLevel) {
        if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        refetchTimerRef.current = setTimeout(() => {
          onSeverityIncreasedRef.current(data.stationName, data.alertLevel);
        }, 2500);
      }
    };

    connection.on("ReceiveStationUpdate", handleUpdate);
    connection.on("ReceiveSensorUpdate", handleUpdate);

    return () => {
      connection.off("ReceiveStationUpdate", handleUpdate);
      connection.off("ReceiveSensorUpdate", handleUpdate);
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
  }, [isActive]);
}

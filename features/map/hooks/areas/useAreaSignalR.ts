// features/map/hooks/areas/useAreaSignalR.ts
// Subscribes to SignalR area status updates for a list of area IDs.
// Mirrors the pattern of useFloodSignalR.ts for station updates.

import { useEffect } from "react";
import {
  getFloodHubConnection,
  startFloodHub,
} from "~/lib/signalr-client";
import {
  useAreaRealtimeStore,
  type AreaStatusUpdate,
} from "../../stores/useAreaRealtimeStore";

interface AreaStatusPayload {
  data: {
    areaId: string;
    status: string;
    severityLevel: number;
    summary?: string;
    evaluatedAt?: string;
  };
}

/**
 * Connects to the SignalR flood-data hub, subscribes to each area ID,
 * and writes ReceiveAreaStatusUpdate events into the Zustand area realtime store.
 * Unsubscribes from all areas on cleanup.
 */
export function useAreaSignalR(areaIds: string[]) {
  const applyUpdate = useAreaRealtimeStore((s) => s.applyUpdate);

  // Stable join string as effect dependency — re-runs only when the set of IDs changes
  const areaIdsKey = areaIds.join(",");

  useEffect(() => {
    if (areaIds.length === 0) return;

    const connection = getFloodHubConnection();

    const handleUpdate = (...args: unknown[]) => {
      const payload = args[0] as AreaStatusPayload;
      const d = payload?.data;
      if (d?.areaId) {
        applyUpdate({
          areaId: d.areaId,
          status: d.status as AreaStatusUpdate["status"],
          severityLevel: d.severityLevel,
          summary: d.summary,
          evaluatedAt: d.evaluatedAt,
        });
      }
    };

    connection.on("ReceiveAreaStatusUpdate", handleUpdate);

    startFloodHub()
      .then(() => {
        areaIds.forEach((id) => {
          connection.invoke("SubscribeToArea", id).catch(() => {});
        });
      })
      .catch(() => {});

    return () => {
      connection.off("ReceiveAreaStatusUpdate", handleUpdate);
      areaIds.forEach((id) => {
        connection.invoke("UnsubscribeFromArea", id).catch(() => {});
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaIdsKey, applyUpdate]);
}

// features/map/hooks/areas/useAreaSignalR.ts
// Subscribes to SignalR area status updates for a list of area IDs.
// Mirrors the pattern of useFloodSignalR.ts for station updates.

import { HubConnectionState } from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";
import {
  getFloodHubConnection,
  releaseFloodHub,
  retainFloodHub,
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
  // Keep applyUpdate stable in the handler via ref — avoids re-registering listener
  const applyUpdateRef = useRef(applyUpdate);
  applyUpdateRef.current = applyUpdate;

  // Stable handler ref — same function object across renders so .off() removes the right one
  const handleUpdate = useCallback((...args: unknown[]) => {
    console.log(
      "📡 [AreaSignalR] ReceiveAreaStatusUpdate received:",
      JSON.stringify(args[0]),
    );
    const payload = args[0] as AreaStatusPayload;
    const d = payload?.data;
    if (d?.areaId) {
      console.log(
        `🔄 [AreaSignalR] Applying update: areaId=${d.areaId} status=${d.status} level=${d.severityLevel}`,
      );
      applyUpdateRef.current({
        areaId: d.areaId,
        status: d.status as AreaStatusUpdate["status"],
        severityLevel: d.severityLevel,
        summary: d.summary,
        evaluatedAt: d.evaluatedAt,
      });
    } else {
      console.warn(
        "⚠️ [AreaSignalR] Unexpected payload shape:",
        JSON.stringify(args[0]),
      );
    }
  }, []); // empty deps — stable for the lifetime of the component

  // Stable join string as effect dependency — re-runs only when the set of IDs changes
  const areaIdsKey = areaIds.join(",");

  useEffect(() => {
    if (areaIds.length === 0) return;

    let cleaned = false;

    // retainFloodHub() increments the shared consumer count and starts the hub.
    // This prevents stopFloodHub() from running while this hook is still alive,
    // which was causing the connection to be torn down before SubscribeToArea could invoke.
    // retainFloodHub increments consumer count (prevents premature stop) and starts hub.
    // startFloodHub returns the live HubConnection — use it directly to avoid stale ref.
    retainFloodHub().then(() => startFloodHub()).then((conn) => {
        if (cleaned) return;

        conn.off("ReceiveAreaStatusUpdate", handleUpdate);
        conn.on("ReceiveAreaStatusUpdate", handleUpdate);
        console.log(
          `🔌 [AreaSignalR] Registered listener for ${areaIds.length} area(s):`,
          areaIds,
        );

        areaIds.forEach((id) => {
          conn
            .invoke("SubscribeToArea", id)
            .then(() =>
              console.log(`✅ [AreaSignalR] SubscribeToArea OK: ${id}`),
            )
            .catch((err) =>
              console.error(
                `❌ [AreaSignalR] SubscribeToArea failed: ${id}`,
                err,
              ),
            );
        });
      })
      .catch(() => {});

    return () => {
      cleaned = true;
      const conn = getFloodHubConnection();
      conn.off("ReceiveAreaStatusUpdate", handleUpdate);
      if (conn.state === HubConnectionState.Connected) {
        areaIds.forEach((id) => {
          conn.invoke("UnsubscribeFromArea", id).catch(() => {});
        });
      }
      releaseFloodHub().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaIdsKey, handleUpdate]);
}

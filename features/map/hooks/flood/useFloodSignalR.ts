// features/map/hooks/flood/useFloodSignalR.ts
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  getFloodHubConnection,
  releaseFloodHub,
  retainFloodHub,
  startFloodHub,
  stopFloodHub,
} from "~/lib/signalr-client";
import { useFloodRealtimeStore } from "../../stores/useFloodRealtimeStore";
import type {
  SensorUpdateData,
  SensorUpdatePayload,
} from "../../types/map-layers.types";

/**
 * Connects to the SignalR flood-data hub and writes real-time sensor updates
 * into the Zustand flood realtime store (replaces Redux dispatch).
 */
export function useFloodSignalR(enabled: boolean) {
  const applyUpdate = useFloodRealtimeStore((s) => s.applyUpdate);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const handleSensorUpdate = useCallback(
    (payload: SensorUpdatePayload | SensorUpdateData) => {
      const data =
        "data" in payload && payload.data?.stationId
          ? (payload as SensorUpdatePayload).data
          : "stationId" in payload
            ? (payload as SensorUpdateData)
            : null;

      if (data?.stationId) {
        // console.log(`🔄 [FloodSignalR] Applying update: stationId=${data.stationId}`);
        applyUpdate(data);
      }
    },
    [applyUpdate],
  );

  useEffect(() => {
    if (!enabled) return;

    const connection = getFloodHubConnection();

    connection.on("ReceiveSensorUpdate", (...args: unknown[]) => {
      // console.log("📡 [FloodSignalR] ReceiveSensorUpdate received:", JSON.stringify(args[0]));
      handleSensorUpdate(args[0] as SensorUpdatePayload | SensorUpdateData);
    });
    connection.on("ReceiveStationUpdate", (...args: unknown[]) => {
      // console.log("📡 [FloodSignalR] ReceiveStationUpdate received:", JSON.stringify(args[0]));
      handleSensorUpdate(args[0] as SensorUpdatePayload | SensorUpdateData);
    });

    connection.onreconnecting(() => {
      console.log("🔄 [FloodSignalR] Reconnecting...");
    });
    connection.onreconnected(() => {
      console.log("✅ [FloodSignalR] Reconnected");
    });
    connection.onclose(() => {
      console.log("⏹️ [FloodSignalR] Connection closed");
    });

    retainFloodHub()
      .then(() =>
        console.log("🔌 [FloodSignalR] Hub retained, listening for updates"),
      )
      .catch(() => {});

    return () => {
      connection.off("ReceiveSensorUpdate");
      connection.off("ReceiveStationUpdate");
      console.log("🔌 [FloodSignalR] Releasing hub");
      releaseFloodHub().catch(() => {});
    };
  }, [enabled, handleSensorUpdate]);

  // Handle app foreground/background transitions
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const prevState = appStateRef.current;
        appStateRef.current = nextState;

        if (!enabledRef.current) return;

        if (prevState.match(/inactive|background/) && nextState === "active") {
          startFloodHub().catch(() => {});
        }
        if (nextState.match(/inactive|background/) && prevState === "active") {
          stopFloodHub().catch(() => {});
        }
      },
    );
    return () => subscription.remove();
  }, []);

  const subscribeToStation = useCallback(async (stationId: string) => {
    try {
      const connection = getFloodHubConnection();
      await connection.invoke("SubscribeToStation", stationId);
    } catch {
      // non-critical
    }
  }, []);

  const unsubscribeFromStation = useCallback(async (stationId: string) => {
    try {
      const connection = getFloodHubConnection();
      await connection.invoke("UnsubscribeFromStation", stationId);
    } catch {
      // non-critical
    }
  }, []);

  return { subscribeToStation, unsubscribeFromStation };
}

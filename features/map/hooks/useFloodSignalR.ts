// features/map/hooks/useFloodSignalR.ts
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "~/app/store";
import {
  getFloodHubConnection,
  startFloodHub,
  stopFloodHub,
} from "~/lib/signalr-client";
import { applyRealtimeUpdate } from "../stores/map.slice";
import type { SensorUpdateData, SensorUpdatePayload } from "../types/map-layers.types";

// Track if the primary connection (MapScreen) is active
// to prevent [stationId] from stopping the shared connection on unmount
let activeConnectionCount = 0;

/**
 * Hook that connects to the SignalR flood-data hub and dispatches
 * real-time sensor updates into the Redux store.
 *
 * @param enabled - Whether the connection should be active (tied to flood overlay toggle)
 */
export function useFloodSignalR(enabled: boolean) {
  const dispatch = useDispatch<AppDispatch>();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const enabledRef = useRef(enabled);
  const wasEnabledRef = useRef(false);
  enabledRef.current = enabled;

  // Handler for incoming sensor updates
  // SignalR may send either wrapped { type, data } or flat { stationId, ... }
  const handleSensorUpdate = useCallback(
    (payload: SensorUpdatePayload | SensorUpdateData) => {
      // console.log("📡 SignalR: Received sensor update", JSON.stringify(payload).slice(0, 200));

      // Extract data: support both wrapped and flat formats
      const data = "data" in payload && payload.data?.stationId
        ? (payload as SensorUpdatePayload).data
        : "stationId" in payload
          ? (payload as SensorUpdateData)
          : null;

      if (data?.stationId) {
        // console.log(`📡 SignalR: Updating station ${data.stationId} - waterLevel: ${data.waterLevel}, severity: ${data.severity}`);
        dispatch(applyRealtimeUpdate(data));
      } else {
        console.warn("⚠️ SignalR: Received update with unknown format", payload);
      }
    },
    [dispatch],
  );

  // Connect / disconnect based on enabled flag
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const connection = getFloodHubConnection();

    // Register event handlers before starting
    connection.on("ReceiveSensorUpdate", (...args: unknown[]) => {
      //console.log("📡 RAW ReceiveSensorUpdate args:", JSON.stringify(args));
      handleSensorUpdate(args[0] as any);
    });
    connection.on("ReceiveStationUpdate", (...args: unknown[]) => {
     // console.log("📡 RAW ReceiveStationUpdate args:", JSON.stringify(args));
      handleSensorUpdate(args[0] as any);
    });

    activeConnectionCount++;
    wasEnabledRef.current = true;

    // Log connection state changes for debugging
    connection.onreconnecting((error) => {
      console.log("🔄 SignalR: Reconnecting...", error?.message);
    });
    connection.onreconnected((connectionId) => {
      console.log("✅ SignalR: Reconnected with ID:", connectionId);
    });
    connection.onclose((error) => {
      console.log("⏹️ SignalR: Connection closed", error?.message);
    });

    startFloodHub().catch((err) => {
      console.error("❌ useFloodSignalR: connection failed", err);
    });

    return () => {
      connection.off("ReceiveSensorUpdate");
      connection.off("ReceiveStationUpdate");
      activeConnectionCount--;

      // Only stop if no other hook instances need the connection
      if (activeConnectionCount <= 0) {
        activeConnectionCount = 0;
        stopFloodHub().catch(console.error);
      }
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

        // App came to foreground → reconnect
        if (prevState.match(/inactive|background/) && nextState === "active") {
          startFloodHub().catch(console.error);
        }

        // App went to background → disconnect to save battery
        if (nextState.match(/inactive|background/) && prevState === "active") {
          stopFloodHub().catch(console.error);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // Expose subscribe/unsubscribe for per-station updates
  const subscribeToStation = useCallback(async (stationId: string) => {
    try {
      const connection = getFloodHubConnection();
      await connection.invoke("SubscribeToStation", stationId);
      console.log(`📡 SignalR: Subscribed to station ${stationId}`);
    } catch (err) {
      console.error("❌ SignalR: subscribe failed", err);
    }
  }, []);

  const unsubscribeFromStation = useCallback(async (stationId: string) => {
    try {
      const connection = getFloodHubConnection();
      await connection.invoke("UnsubscribeFromStation", stationId);
      console.log(`📡 SignalR: Unsubscribed from station ${stationId}`);
    } catch (err) {
      console.error("❌ SignalR: unsubscribe failed", err);
    }
  }, []);

  return { subscribeToStation, unsubscribeFromStation };
}

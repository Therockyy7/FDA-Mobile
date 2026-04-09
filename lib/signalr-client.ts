// lib/signalr-client.ts
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SIGNALR_HUB_URL = process.env.EXPO_PUBLIC_SIGNALR_HUB_URL ?? "https://uat.fda.id.vn/hubs/flood-data";

let connection: HubConnection | null = null;
let startingPromise: Promise<void> | null = null;
let consumerCount = 0;

/**
 * Increment consumer count and start the hub.
 * Call this in useEffect on mount — prevents stopFloodHub() from running
 * while any consumer (flood or area) is still alive.
 */
export async function retainFloodHub(): Promise<void> {
  consumerCount++;
  await startFloodHub();
}

/**
 * Decrement consumer count. Stops the hub only when the last consumer releases.
 */
export async function releaseFloodHub(): Promise<void> {
  consumerCount = Math.max(0, consumerCount - 1);
  if (consumerCount === 0) {
    await stopFloodHub();
  }
}

/**
 * Get or create the SignalR hub connection singleton.
 * Uses the same access_token from AsyncStorage as the REST API client.
 */
export function getFloodHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        transport: HttpTransportType.LongPolling,
        accessTokenFactory: async () => {
          const token = await AsyncStorage.getItem("access_token");
          return token ?? "";
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      // .configureLogging(LogLevel.Warning)
      .build();
  }
  return connection;
}

/**
 * Start the connection if not already connected.
 * Returns the HubConnection that is (or will be) Connected — callers must
 * use this returned reference, NOT getFloodHubConnection(), because the
 * singleton may be replaced by stopFloodHub() between start and invoke.
 */
export async function startFloodHub(): Promise<HubConnection> {
  const conn = getFloodHubConnection();

  if (conn.state === HubConnectionState.Connected) return conn;

  // Another caller already started — wait for the same promise
  if (startingPromise) {
    await startingPromise;
    // Return the connection that was connected (may differ from current singleton)
    return conn;
  }

  if (conn.state === HubConnectionState.Disconnected) {
    startingPromise = conn.start()
      .then(() => { console.log("✅ SignalR: Connected to flood-data hub"); })
      .catch((err) => { console.warn("⚠️ SignalR: Failed to connect (will auto-retry)", err); })
      .finally(() => { startingPromise = null; });

    await startingPromise;
  }

  return conn;
}

/**
 * Stop the connection and destroy the singleton so a fresh one is created next time.
 * Skips stop if connection is currently in the middle of connecting (Connecting/Reconnecting)
 * to avoid "connection was stopped during negotiation" error from React Strict Mode double-effect.
 */
export async function stopFloodHub(): Promise<void> {
  if (connection) {
    const state = connection.state;
    if (
      state === HubConnectionState.Connected ||
      state === HubConnectionState.Reconnecting
    ) {
      await connection.stop();
      console.log("⏹️ SignalR: Disconnected from flood-data hub");
    }
    connection = null;
  }
}

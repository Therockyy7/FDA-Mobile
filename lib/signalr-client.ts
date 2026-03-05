// lib/signalr-client.ts
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SIGNALR_HUB_URL = "https://uat.fda.id.vn/hubs/flood-data";

let connection: HubConnection | null = null;

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
      .configureLogging(LogLevel.Warning)
      .build();
  }
  return connection;
}

/**
 * Start the connection if not already connected.
 */
export async function startFloodHub(): Promise<void> {
  const conn = getFloodHubConnection();
  if (conn.state === HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log("✅ SignalR: Connected to flood-data hub");
    } catch (err) {
      // Don't throw — let withAutomaticReconnect handle retries
      console.warn("⚠️ SignalR: Failed to connect (will auto-retry)", err);
    }
  }
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

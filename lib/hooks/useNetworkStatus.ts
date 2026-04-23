import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "~/lib/stores/useNetworkStore";

export interface NetworkStatus {
  isOnline: boolean;
  justReconnected: boolean;
  offlineSince: number;
}

export function useNetworkStatus(): NetworkStatus {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const justReconnected = useNetworkStore((s) => s.justReconnected);
  const offlineSince = useNetworkStore((s) => s.offlineSince);
  return { isOnline, justReconnected, offlineSince };
}

export function onReconnect(callback: () => void): () => void {
  let wasOnline: boolean | null = null;
  return NetInfo.addEventListener(({ isConnected }) => {
    const nowOnline = isConnected === true;
    if (wasOnline === false && nowOnline) callback();
    wasOnline = nowOnline;
  });
}

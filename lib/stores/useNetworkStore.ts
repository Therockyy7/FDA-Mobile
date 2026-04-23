import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

interface NetworkStore {
  isOnline: boolean;
  justReconnected: boolean;
}

export const useNetworkStore = create<NetworkStore>(() => ({
  isOnline: true,
  justReconnected: false,
}));

// Offline = isConnected:false (1 event, immediate, reliable)
// Online  = isConnected:true AND isInternetReachable:true
//           (Android fires isConnected:true + isInternetReachable:false first — ignore it)
function resolveOnline(isConnected: boolean | null, isInternetReachable: boolean | null): boolean {
  if (isConnected !== true) return false;
  if (isInternetReachable === true) return true;
  // isInternetReachable:false while isConnected:true = transient Android state, stay as-is
  return false;
}

NetInfo.addEventListener(({ isConnected, isInternetReachable }) => {
  const online = resolveOnline(isConnected, isInternetReachable);
  const prev = useNetworkStore.getState().isOnline;
  if (prev === online) return;

  if (online) {
    useNetworkStore.setState({ isOnline: true, justReconnected: true });
    setTimeout(() => useNetworkStore.setState({ justReconnected: false }), 0);
  } else {
    // Only go offline when isConnected:false — not during transient reconnect events
    if (isConnected === false) {
      useNetworkStore.setState({ isOnline: false });
    }
  }
});

// Sync real initial state — addEventListener only fires on changes, not on mount.
NetInfo.fetch().then(({ isConnected, isInternetReachable }) => {
  const online = resolveOnline(isConnected, isInternetReachable);
  const current = useNetworkStore.getState().isOnline;
  if (current !== online) {
    useNetworkStore.setState({ isOnline: online });
  }
});

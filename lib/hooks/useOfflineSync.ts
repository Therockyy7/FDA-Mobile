import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNetworkStatus } from "./useNetworkStatus";

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const { justReconnected } = useNetworkStatus();

  useEffect(() => {
    if (!justReconnected) return;
    queryClient.invalidateQueries();
  }, [justReconnected, queryClient]);
}

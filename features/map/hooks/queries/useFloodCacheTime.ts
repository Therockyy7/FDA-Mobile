import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FLOOD_SEVERITY_QUERY_KEY } from "./useFloodSeverityQuery";

// Subscribes to QueryClient cache so dataUpdatedAt updates reactively
// without needing a tab switch to trigger re-render.
export function useFloodCacheTime(): number {
  const queryClient = useQueryClient();

  const getLatest = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.findAll({ queryKey: [FLOOD_SEVERITY_QUERY_KEY] });
    return queries.reduce((max, q) => Math.max(max, q.state.dataUpdatedAt ?? 0), 0);
  };

  const [dataUpdatedAt, setDataUpdatedAt] = useState(getLatest);

  useEffect(() => {
    return queryClient.getQueryCache().subscribe(() => {
      setDataUpdatedAt(getLatest());
    });
  }, [queryClient]);

  return dataUpdatedAt;
}

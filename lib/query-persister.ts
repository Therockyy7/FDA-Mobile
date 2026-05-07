import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

export const QUERY_GC_TIME = 1000 * 60 * 60 * 24; // 24h

export const persistOptions = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
  }),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: QUERY_GC_TIME,
      networkMode: "offlineFirst",
    },
  },
});

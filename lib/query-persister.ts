import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const QUERY_GC_TIME = 1000 * 60 * 60 * 24; // 24h

export const persistOptions = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
  }),
};

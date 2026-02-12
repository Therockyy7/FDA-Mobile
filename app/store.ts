import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

import subscriptionReducer from "../features/subscription/stores/subscription.slice";
import adminAreaReducer from "../features/areas/stores/admin-area.slice";
import authReducer, { AuthState } from "../features/auth/stores/auth.slice";
import mapReducer, { MapState } from "../features/map/stores/map.slice";

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["user", "session"],
};

const mapPersistConfig = {
  key: "map",
  storage: AsyncStorage,
  whitelist: ["settings"], // Only persist settings, not flood data
};

const rootReducer = combineReducers({
  auth: persistReducer<AuthState>(authPersistConfig, authReducer),
  map: persistReducer<MapState>(mapPersistConfig, mapReducer),
  subscription: subscriptionReducer,
  adminAreas: adminAreaReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

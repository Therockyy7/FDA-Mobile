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

import authReducer, { AuthState } from "../features/auth/stores/auth.slice";

// Reactotron - chỉ dùng trong dev
let reactotronEnhancer: any;
if (__DEV__) {
  const reactotron = require("../reactotron.config").default;
  reactotronEnhancer = reactotron.createEnhancer?.();
}

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["user", "session"],
};

const rootReducer = combineReducers({
  auth: persistReducer<AuthState>(authPersistConfig, authReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  enhancers: (getDefault) =>
    reactotronEnhancer
      ? getDefault().concat(reactotronEnhancer)
      : getDefault(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

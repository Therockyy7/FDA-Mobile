import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "../types";

export const DEFAULT_LOCALE: Locale = "vi";

export interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set({ locale: get().locale === "vi" ? "en" : "vi" }),
    }),
    {
      name: "fda_language",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useLocale = () => useLanguageStore((s) => s.locale);
export const useSetLocale = () => useLanguageStore((s) => s.setLocale);
export const useToggleLocale = () => useLanguageStore((s) => s.toggleLocale);

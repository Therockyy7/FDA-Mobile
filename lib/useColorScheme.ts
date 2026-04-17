import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useCallback, useEffect } from "react";

const THEME_STORAGE_KEY = "@app_theme";

let isThemeLoaded = false;

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativewindColorScheme();

  // Load theme from storage on mount (run only ONCE per app lifecycle)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
          setColorScheme(savedTheme);
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      }
    };
    if (!isThemeLoaded) {
      isThemeLoaded = true;
      loadTheme();
    }
  }, []);

  // Wrapped setColorScheme that also persists to storage
  const setColorSchemeWithPersist = useCallback(
    (scheme: "dark" | "light" | "system") => {
      // Synchronously update the theme for instant UI feedback
      setColorScheme(scheme);
      
      // Persist to storage asynchronously without blocking
      if (scheme !== "system") {
        AsyncStorage.setItem(THEME_STORAGE_KEY, scheme).catch(err => console.log("Error saving theme:", err));
      } else {
        AsyncStorage.removeItem(THEME_STORAGE_KEY).catch(err => console.log("Error removing theme:", err));
      }
    },
    [setColorScheme]
  );

  // Wrapped toggleColorScheme that persists
  const toggleColorSchemeWithPersist = useCallback(() => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    setColorSchemeWithPersist(newScheme);
  }, [colorScheme, setColorSchemeWithPersist]);

  return {
    colorScheme: colorScheme ?? "light",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme: setColorSchemeWithPersist,
    toggleColorScheme: toggleColorSchemeWithPersist,
  };
}

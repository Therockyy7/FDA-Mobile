import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useCallback, useEffect } from "react";

const THEME_STORAGE_KEY = "@app_theme";

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativewindColorScheme();

  // Load theme from storage on mount
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
    loadTheme();
  }, []);

  // Wrapped setColorScheme that also persists to storage
  const setColorSchemeWithPersist = useCallback(
    async (scheme: "dark" | "light" | "system") => {
      try {
        setColorScheme(scheme);
        if (scheme !== "system") {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
        } else {
          await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        }
      } catch (error) {
        console.log("Error saving theme:", error);
      }
    },
    [setColorScheme]
  );

  // Wrapped toggleColorScheme that persists
  const toggleColorSchemeWithPersist = useCallback(async () => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    await setColorSchemeWithPersist(newScheme);
  }, [colorScheme, setColorSchemeWithPersist]);

  return {
    colorScheme: colorScheme ?? "light",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme: setColorSchemeWithPersist,
    toggleColorScheme: toggleColorSchemeWithPersist,
  };
}

// app/alerts/_layout.tsx
import { Stack } from "expo-router";

export default function AlertsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          headerShown: false,
            presentation: "modal",
        }}
      />
    </Stack>
  );
}
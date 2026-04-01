// app/payment/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function PaymentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="processing" />
      <Stack.Screen name="success" />
      <Stack.Screen name="cancel" />
    </Stack>
  );
}

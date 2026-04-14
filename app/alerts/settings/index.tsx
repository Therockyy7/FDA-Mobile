// app/alerts/settings/index.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { AlertSettings } from "~/features/alerts/components/AlertSettings";

export default function AlertSettingsScreen() {
  const params = useLocalSearchParams();
  const areaId = params.areaId as string;
  const areaName = params.areaName as string;

  // Validate params are not empty strings (type assertion allows empty string)
  if (!areaId?.trim() || !areaName?.trim()) return null;

  return (
    <AlertSettings
      areaId={areaId}
      areaName={areaName}
    />
  );
}

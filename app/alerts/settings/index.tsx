// app/alerts/settings/index.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { AlertSettings } from "~/features/alerts/components/AlertSettings";

export default function AlertSettingsScreen() {
  const params = useLocalSearchParams();
  const areaId = params.areaId as string;
  const areaName = params.areaName as string;

  if (!areaId || !areaName) {
    return null; // Or show an error
  }

  return (
    <AlertSettings
      areaId={areaId}
      areaName={areaName}
      // TODO: Load initial settings from API/service
      // initialSettings={loadedSettings}
      // onSave={handleSaveSettings}
    />
  );
}
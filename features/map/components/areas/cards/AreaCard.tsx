// features/map/components/areas/cards/AreaCard.tsx
import React from "react";
import { View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  AREA_STATUS_COLORS,
  AREA_STATUS_ICONS,
  AREA_STATUS_LABELS,
  type AreaWithStatus,
} from "../../../types/map-layers.types";
import { AreaHeader } from "./AreaHeader";
import { AreaGauge } from "./AreaGauge";
import { AreaStats } from "./AreaStats";
import { AreaStationChips } from "./AreaStationChips";
import { AreaActionBar } from "./AreaActionBar";

interface AreaCardProps {
  area: AreaWithStatus;
  onClose: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AreaCard({
  area,
  onClose,
  onViewDetails,
  onEdit,
  onDelete,
}: AreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  const statusColor = AREA_STATUS_COLORS[area.status] || AREA_STATUS_COLORS.Unknown;
  const statusLabel = AREA_STATUS_LABELS[area.status] || AREA_STATUS_LABELS.Unknown;
  const statusIcon = AREA_STATUS_ICONS[area.status] || AREA_STATUS_ICONS.Unknown;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  const maxWaterLevel = area.contributingStations?.reduce(
    (max, station) => (station.waterLevel > max ? station.waterLevel : max),
    0,
  ) ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <AreaHeader
        name={area.name}
        addressText={area.addressText}
        statusColor={statusColor}
        statusLabel={statusLabel}
        statusIcon={statusIcon}
        onClose={onClose}
      />

      <View style={{ padding: 16 }}>
        {maxWaterLevel > 0 && (
          <AreaGauge maxWaterLevel={maxWaterLevel} colors={colors} />
        )}

        <AreaStats
          radiusMeters={area.radiusMeters}
          stationCount={area.contributingStations.length}
          evaluatedAt={area.evaluatedAt}
          colors={colors}
        />

        <AreaStationChips
          stations={area.contributingStations}
          colors={colors}
        />

        <AreaActionBar
          statusColor={statusColor}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      </View>
    </View>
  );
}

export default React.memo(AreaCard, (prevProps, nextProps) => {
  return prevProps.area?.id === nextProps.area?.id;
});

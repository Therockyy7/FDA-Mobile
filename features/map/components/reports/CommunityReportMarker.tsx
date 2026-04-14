// features/map/components/reports/CommunityReportMarker.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { NearbyFloodReport } from "~/features/community/services/community.service";
import { SHADOW, FLOOD_COLORS } from "~/lib/design-tokens";

interface CommunityReportMarkerProps {
  report: NearbyFloodReport;
  mapRef: React.RefObject<any>;
  onPress: (report: NearbyFloodReport) => void;
  isSelected?: boolean;
}

const LATITUDE_OFFSET = 0.008;

function getSeverityColor(severity: string): string {
  if (severity === "high") return FLOOD_COLORS.danger;
  if (severity === "medium") return FLOOD_COLORS.warning;
  return FLOOD_COLORS.safe;
}

export const CommunityReportMarker = React.memo(function CommunityReportMarker({
  report,
  mapRef,
  onPress,
}: CommunityReportMarkerProps) {
  const severityColor = getSeverityColor(report.severity);

  return (
    <Marker
      key={`community-report-${report.id}`}
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      onPress={() => {
        onPress(report);
        mapRef.current?.animateToRegion(
          {
            latitude: report.latitude - LATITUDE_OFFSET,
            longitude: report.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.02,
          },
          400,
        );
      }}
      testID="map-report-marker"
    >
      {/* Marker child — SHADOW.sm replaces inline shadow; borderColor "white" is react-native-maps exception */}
      <View style={{ alignItems: "center" }}>
        <View
          style={[
            SHADOW.sm,
            {
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: severityColor,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "white",
            },
          ]}
        >
          <Ionicons name="megaphone" size={18} color="white" />
        </View>
        {/* Pin tail — borderTopColor is react-native-maps Marker child (exception) */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "white",
            marginTop: -2,
          }}
        />
      </View>
    </Marker>
  );
});

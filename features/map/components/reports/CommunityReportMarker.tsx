import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { NearbyFloodReport } from "~/features/community/services/community.service";

interface CommunityReportMarkerProps {
  report: NearbyFloodReport;
  mapRef: React.RefObject<any>;
  onPress: (report: NearbyFloodReport) => void;
}

const LATITUDE_OFFSET = 0.008;

function getSeverityColor(severity: string): string {
  if (severity === "high") return "#DC2626";
  if (severity === "medium") return "#EA580C";
  return "#059669";
}

export function CommunityReportMarker({
  report,
  mapRef,
  onPress,
}: CommunityReportMarkerProps) {
  const severityColor = getSeverityColor(report.severity);

  return (
    <Marker
      key={`community-report-${report.id}`}
      coordinate={{
        latitude: report.latitude,
        longitude: report.longitude,
      }}
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
    >
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: severityColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }}
        >
          <Ionicons name="megaphone" size={18} color="white" />
        </View>
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
}

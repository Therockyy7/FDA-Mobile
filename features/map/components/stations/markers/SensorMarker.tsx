// features/map/components/stations/markers/SensorMarker.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { Sensor } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import { useMapColors } from "~/features/map/lib/map-ui-utils";
import { SHADOW } from "~/lib/design-tokens";

interface SensorMarkerProps {
  sensor: Sensor;
  onPress?: () => void;
}

export function SensorMarker({ sensor, onPress }: SensorMarkerProps) {
  const color = getStatusColor(sensor.status);
  const colors = useMapColors();

  return (
    <Marker
      coordinate={{
        latitude: sensor.latitude,
        longitude: sensor.longitude,
      }}
      title={sensor.name}
      description={`Mực nước: ${sensor.waterLevel}cm - ${sensor.statusText}`}
      onPress={onPress}
      testID={`map-station-marker-${sensor.name}`}
    >
      <View style={styles.container}>
        {/* Compact Bubble */}
        <View style={[SHADOW.sm, styles.bubble, { backgroundColor: "white" }]}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: color.main },
            ]}
          />
          <Text style={[styles.waterLevelText, { color: colors.text }]}>
            {sensor.waterLevel}cm
          </Text>
        </View>

        {/* Arrow pointer */}
        <View style={styles.arrow} />

        {/* Dot */}
        <View
          style={[
            styles.markerDot,
            { backgroundColor: color.main },
          ]}
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  bubble: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  waterLevelText: {
    fontSize: 11,
    fontWeight: "700",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 1,
  },
});

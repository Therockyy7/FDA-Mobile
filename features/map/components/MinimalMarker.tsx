import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { getStatusColor } from "../lib/map-utils";
import { Sensor } from "../constants/map-data";


interface MinimalMarkerProps {
  sensor: Sensor;
  isSelected: boolean;
}

export function MinimalMarker({ sensor, isSelected }: MinimalMarkerProps) {
  const colors = getStatusColor(sensor.status);

  return (
    <View style={{ alignItems: "center" }}>
      {/* Pulse animation for selected */}
      {isSelected && (
        <View
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.main,
            opacity: 0.2,
          }}
        />
      )}

      {/* Simple Icon Marker */}
      <View
        style={{
          width: isSelected ? 44 : 38,
          height: isSelected ? 44 : 38,
          borderRadius: isSelected ? 22 : 19,
          backgroundColor: colors.main,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="water" size={isSelected ? 24 : 20} color="white" />
      </View>

      {/* Small badge with level */}
      <View
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          backgroundColor: "white",
          borderRadius: 10,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderWidth: 2,
          borderColor: colors.main,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 9, fontWeight: "900", color: colors.main }}>
          {sensor.waterLevel}
        </Text>
      </View>
    </View>
  );
}

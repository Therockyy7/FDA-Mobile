import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Sensor } from "../constants/map-data";
import { getStatusColor } from "../lib/map-utils";


interface CleanCalloutProps {
  sensor: Sensor;
}

export function CleanCallout({ sensor }: CleanCalloutProps) {
  const colors = getStatusColor(sensor.status);

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        minWidth: 280,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937" }}>
            {sensor.name}
          </Text>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: colors.text }}>
              {sensor.statusText}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: "#6B7280" }}>{sensor.location}</Text>
      </View>

      {/* Water Level */}
      <View
        style={{
          backgroundColor: colors.bg,
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: "900",
              color: colors.main,
              lineHeight: 36,
            }}
          >
            {sensor.waterLevel}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginLeft: 4,
            }}
          >
            cm
          </Text>
        </View>
        <View
          style={{
            height: 4,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 2,
            marginTop: 8,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${(sensor.waterLevel / sensor.maxLevel) * 100}%`,
              height: "100%",
              backgroundColor: colors.main,
            }}
          />
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>
            Nhiệt độ
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937" }}>
            {sensor.temperature}°
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>
            Độ ẩm
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937" }}>
            {sensor.humidity}%
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>
            Cập nhật
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#1F2937" }}>
            {sensor.lastUpdate}
          </Text>
        </View>
      </View>
    </View>
  );
}

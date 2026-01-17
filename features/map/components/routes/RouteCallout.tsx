// components/RouteCallout.tsx
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodRoute } from "../../constants/map-data";
import { getStatusColor } from "../../lib/map-utils";

interface RouteCalloutProps {
  route: FloodRoute;
}

export function RouteCallout({ route }: RouteCalloutProps) {
  const colors = getStatusColor(route.status);

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        minWidth: 260,
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
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1F2937" }}>
            {route.name}
          </Text>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text
              style={{ fontSize: 10, fontWeight: "700", color: colors.text }}
            >
              {route.status === "safe"
                ? "An toàn"
                : route.status === "warning"
                  ? "Cảnh báo"
                  : "Nguy hiểm"}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: "#6B7280" }}>
          {route.description}
        </Text>
      </View>

      {/* Water Level */}
      <View
        style={{
          backgroundColor: colors.bg,
          padding: 12,
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: "#6B7280",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Mực nước trung bình
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: colors.main,
              lineHeight: 32,
            }}
          >
            {route.waterLevel}
          </Text>
          <Text
            style={{
              fontSize: 14,
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
              width: `${Math.min((route.waterLevel / route.maxLevel) * 100, 100)}%`,
              height: "100%",
              backgroundColor: colors.main,
            }}
          />
        </View>
      </View>

      {/* Info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
          Ngưỡng an toàn: {route.maxLevel}cm
        </Text>
        <Text style={{ fontSize: 11, fontWeight: "600", color: "#3B82F6" }}>
          Chi tiết →
        </Text>
      </View>
    </View>
  );
}

// features/map/components/RouteDetailCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodRoute } from "../../constants/map-data";
import { getStatusColor } from "../../lib/map-utils";

interface RouteDetailCardProps {
  route: FloodRoute;
  onClose: () => void;
}

export function RouteDetailCard({
  route,
  onClose,
}: RouteDetailCardProps) {
  const colors = getStatusColor(route.status);

  const getDirectionIcon = () => {
    switch (route.direction) {
      case "north":
        return "arrow-up";
      case "south":
        return "arrow-down";
      case "east":
        return "arrow-forward";
      case "west":
        return "arrow-back";
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient Header */}
        <LinearGradient
          colors={[colors.main, colors.text]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 20,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <MaterialCommunityIcons
                  name="road-variant"
                  size={24}
                  color="white"
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "white",
                    marginLeft: 8,
                  }}
                >
                  {route.name}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {route.description}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Water Level Display */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "rgba(255,255,255,0.9)",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              ĐỘ SÂU NƯỚC TRUNG BÌNH
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
                  fontSize: 48,
                  fontWeight: "900",
                  color: "white",
                  lineHeight: 48,
                }}
              >
                {route.waterLevel}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "white",
                  marginLeft: 6,
                }}
              >
                cm
              </Text>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                height: 6,
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 3,
                marginTop: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min((route.waterLevel / route.maxLevel) * 100, 100)}%`,
                  height: "100%",
                  backgroundColor: "white",
                }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Status Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.bg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: colors.main,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: colors.main,
              }}
            >
              {route.status === "safe"
                ? "✓ AN TOÀN"
                : route.status === "warning"
                  ? "⚠ CẢNH BÁO"
                  : "⛔ NGUY HIỂM"}
            </Text>
          </View>

          {/* Info Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: "#F9FAFB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Ionicons name="resize-outline" size={18} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  Chiều dài
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                {route.length} km
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: "#F9FAFB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <MaterialCommunityIcons name="waves" size={18} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  Tốc độ dòng
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                {route.flowSpeed} m/s
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: "#F9FAFB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Ionicons name={getDirectionIcon()} size={18} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  Hướng chảy
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                {route.direction === "north"
                  ? "Bắc"
                  : route.direction === "south"
                    ? "Nam"
                    : route.direction === "east"
                      ? "Đông"
                      : "Tây"}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: "#F9FAFB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  Cập nhật
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#1F2937",
                }}
              >
                2 phút trước
              </Text>
            </View>
          </View>
        </View>
    </View>
  );
}

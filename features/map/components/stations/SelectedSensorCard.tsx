import { Ionicons } from "@expo/vector-icons";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Sensor } from "../../constants/map-data";
import { getStatusColor } from "../../lib/map-utils";


interface SelectedSensorCardProps {
  sensor: Sensor;
  slideAnim: Animated.Value;
  onClose: () => void;
}

export function SelectedSensorCard({ sensor, slideAnim, onClose }: SelectedSensorCardProps) {
  const colors = getStatusColor(sensor.status);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {/* Top strip */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: colors.main,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 2,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 2,
              }}
            >
              {sensor.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              {sensor.location}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#F3F4F6",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.bg,
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: colors.main,
              }}
            >
              {sensor.waterLevel}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.text,
                marginTop: 2,
              }}
            >
              cm
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View>
                <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Nhiệt độ</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {sensor.temperature}°C
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Độ ẩm</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {sensor.humidity}%
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: "#E5E7EB",
                borderRadius: 3,
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
        </View>
      </View>
    </Animated.View>
  );
}

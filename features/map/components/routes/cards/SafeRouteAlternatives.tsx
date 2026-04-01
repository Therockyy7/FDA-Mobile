// features/map/components/routes/SafeRouteAlternatives.tsx

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatDistance, formatDuration } from "../..//../lib/polyline-utils";
import type { DecodedRoute } from "../..//../types/safe-route.types";
import {
  SAFETY_STATUS_COLORS,
  SAFETY_STATUS_LABELS,
} from "../..//../types/safe-route.types";

interface SafeRouteAlternativesProps {
  routes: DecodedRoute[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
  onExitRouting: () => void;
}

export function SafeRouteAlternatives({
  routes,
  selectedIndex,
  onSelectRoute,
  onExitRouting,
}: SafeRouteAlternativesProps) {
  if (routes.length <= 1) return null;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        {/* Close button */}
        <TouchableOpacity
          onPress={onExitRouting}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#F1F5F9",
            borderRadius: 14,
            padding: 10,
            minWidth: 44,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={20} color="#64748B" />
          <Text style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
            Đóng
          </Text>
        </TouchableOpacity>
        {routes.map((route, index) => {
          const isSelected = index === selectedIndex;
          const color = SAFETY_STATUS_COLORS[route.safetyStatus];
          const label = SAFETY_STATUS_LABELS[route.safetyStatus];

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectRoute(index)}
              activeOpacity={0.8}
              style={{
                backgroundColor: isSelected ? "white" : "#F8FAFC",
                borderRadius: 14,
                padding: 10,
                minWidth: 130,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? color : "#E2E8F0",
                shadowColor: isSelected ? color : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.2 : 0,
                shadowRadius: 4,
                elevation: isSelected ? 4 : 0,
              }}
            >
              {/* Route label */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#1E293B",
                  }}
                >
                  {index === 0 ? "Tuyến chính" : `Tuyến ${index + 1}`}
                </Text>
              </View>

              {/* Distance & Time */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Ionicons
                    name="speedometer-outline"
                    size={12}
                    color="#64748B"
                  />
                  <Text style={{ fontSize: 11, color: "#64748B" }}>
                    {formatDistance(route.distance)}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Ionicons name="time-outline" size={12} color="#64748B" />
                  <Text style={{ fontSize: 11, color: "#64748B" }}>
                    {formatDuration(route.time)}
                  </Text>
                </View>
              </View>

              {/* Safety Badge */}
              <View
                style={{
                  marginTop: 6,
                  backgroundColor: color + "20",
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: color,
                  }}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// features/map/components/controls/MapHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Platform, StatusBar, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { CreateAreaButton } from "./CreateAreaButton";
import { LayersToggleButton } from "./LayersToggleButton";

interface MapHeaderProps {
  stats?: {
    safe: number;
    caution: number;
    warning: number;
    critical: number;
  };
  mapType?: string;
  onMapTypeChange?: () => void;
  onShowLayers: () => void;
  onCreateArea?: () => void;
  showCreateAreaButton?: boolean;
}

export function MapHeader({
  onShowLayers,
  onCreateArea,
  showCreateAreaButton = false,
}: MapHeaderProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View
      className="bg-white dark:bg-[#0B1A33] border-b border-border dark:border-[#334155]"
      style={{
        paddingTop:
          Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 54,
        paddingBottom: 12,
        paddingHorizontal: 16,
      }}
      testID="map-header"
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            {/* Logo */}
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: "#007AFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                marginLeft: 12,
              }}
            >
              <Ionicons name="water" size={16} color="white" />
            </View>

            {/* Location + Status */}
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="location"
                  size={12}
                  color={isDarkColorScheme ? "#94A3B8" : "#64748B"}
                />
                <Text
                  className="text-foreground dark:text-[#F1F5F9] font-semibold"
                  style={{ fontSize: 13, marginLeft: 4 }}
                >
                  Đà Nẵng
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                  marginLeft: 4,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: "#22C55E",
                    }}
                  />
                  <Text
                    className="font-semibold"
                    style={{ fontSize: 11, color: "#22C55E", marginLeft: 4 }}
                  >
                    Đang cập nhật
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {showCreateAreaButton && onCreateArea && (
            <CreateAreaButton onPress={onCreateArea} />
          )}
          <LayersToggleButton onPress={onShowLayers} testID="map-header-layers-btn" />
        </View>
      </View>
    </View>
  );
}

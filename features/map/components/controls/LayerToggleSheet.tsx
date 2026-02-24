// features/map/components/LayerToggleSheet.tsx
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useCallback } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { useMapLayerSettings } from "../../hooks/useMapLayerSettings";
import type { BaseMapType, MapLayerSettings } from "../../types/map-layers.types";

interface LayerToggleSheetProps {
  visible: boolean;
  onClose: () => void;
  areaDisplayMode?: "user" | "admin";
  onAreaDisplayModeChange?: (mode: "user" | "admin") => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Inner component that uses Redux hook - only mounted when visible
function LayerToggleSheetContent({ 
  onClose, 
  areaDisplayMode = "user",
  onAreaDisplayModeChange,
}: { 
  onClose: () => void;
  areaDisplayMode?: "user" | "admin";
  onAreaDisplayModeChange?: (mode: "user" | "admin") => void;
}) {
  const { isDarkColorScheme } = useColorScheme();
  const {
    settings,
    toggleOverlay,
    setBaseMap,
    setOpacity,
  } = useMapLayerSettings();

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    accent: "#3B82F6",
    overlay: "rgba(0, 0, 0, 0.5)",
  };

  const handleBaseMapChange = useCallback(
    (mapType: BaseMapType) => {
      setBaseMap(mapType);
    },
    [setBaseMap]
  );

  const handleOpacityChange = useCallback(
    (layer: keyof MapLayerSettings["opacity"], value: number) => {
      setOpacity(layer, Math.round(value));
    },
    [setOpacity]
  );

  return (
    <>
      <Pressable
        style={{ flex: 1, backgroundColor: colors.overlay }}
        onPress={onClose}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: SCREEN_HEIGHT * 0.7,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Handle Bar */}
        <View style={{ alignItems: "center", paddingTop: 12 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${colors.accent}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="layers" size={22} color={colors.accent} />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                Lớp bản đồ
              </Text>
              <Text style={{ fontSize: 12, color: colors.subtext }}>
                Tùy chỉnh hiển thị
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.cardBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Base Map Section */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              LOẠI BẢN ĐỒ
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Standard Map */}
              <TouchableOpacity
                onPress={() => handleBaseMapChange("standard")}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardBg,
                  borderWidth: 2,
                  borderColor:
                    settings.baseMap === "standard" ? colors.accent : colors.border,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor:
                      settings.baseMap === "standard"
                        ? `${colors.accent}20`
                        : isDarkColorScheme
                        ? "#475569"
                        : "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="map-outline"
                    size={24}
                    color={
                      settings.baseMap === "standard"
                        ? colors.accent
                        : colors.subtext
                    }
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      settings.baseMap === "standard"
                        ? colors.accent
                        : colors.text,
                  }}
                >
                  Tiêu chuẩn
                </Text>
              </TouchableOpacity>

              {/* Satellite Map */}
              <TouchableOpacity
                onPress={() => handleBaseMapChange("satellite")}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardBg,
                  borderWidth: 2,
                  borderColor:
                    settings.baseMap === "satellite" ? colors.accent : colors.border,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor:
                      settings.baseMap === "satellite"
                        ? `${colors.accent}20`
                        : isDarkColorScheme
                        ? "#475569"
                        : "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="earth"
                    size={24}
                    color={
                      settings.baseMap === "satellite"
                        ? colors.accent
                        : colors.subtext
                    }
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      settings.baseMap === "satellite"
                        ? colors.accent
                        : colors.text,
                  }}
                >
                  Vệ tinh
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Area Display Mode Section */}
          {onAreaDisplayModeChange && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.subtext,
                  marginBottom: 12,
                  letterSpacing: 0.5,
                }}
              >
                CHẾ ĐỘ KHU VỰC
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* User Areas */}
                <TouchableOpacity
                  onPress={() => onAreaDisplayModeChange("user")}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.cardBg,
                    borderWidth: 2,
                    borderColor:
                      areaDisplayMode === "user" ? colors.accent : colors.border,
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor:
                        areaDisplayMode === "user"
                          ? `${colors.accent}20`
                          : isDarkColorScheme
                          ? "#475569"
                          : "#E2E8F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="person-circle"
                      size={24}
                      color={
                        areaDisplayMode === "user"
                          ? colors.accent
                          : colors.subtext
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color:
                        areaDisplayMode === "user"
                          ? colors.accent
                          : colors.text,
                      textAlign: "center",
                    }}
                  >
                    Khu vực của tôi
                  </Text>
                </TouchableOpacity>

                {/* Admin Areas */}
                <TouchableOpacity
                  onPress={() => onAreaDisplayModeChange("admin")}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.cardBg,
                    borderWidth: 2,
                    borderColor:
                      areaDisplayMode === "admin" ? colors.accent : colors.border,
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor:
                        areaDisplayMode === "admin"
                          ? `${colors.accent}20`
                          : isDarkColorScheme
                          ? "#475569"
                          : "#E2E8F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="shield-crown"
                      size={24}
                      color={
                        areaDisplayMode === "admin"
                          ? colors.accent
                          : colors.subtext
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color:
                        areaDisplayMode === "admin"
                          ? colors.accent
                          : colors.text,
                      textAlign: "center",
                    }}
                  >
                    Dự báo AI
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: `${colors.accent}10`,
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Ionicons name="information-circle" size={16} color={colors.accent} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: colors.subtext,
                    lineHeight: 16,
                  }}
                >
                  {areaDisplayMode === "user"
                    ? "Hiển thị các khu vực bạn đã tạo"
                    : "Hiển thị các khu vực được Admin phân tích sẵn với AI"}
                </Text>
              </View>
            </View>
          )}

          {/* Overlay Layers Section */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              LỚP HIỂN THỊ
            </Text>

            <View style={{ gap: 12 }}>
              {/* Flood Layer */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardBg,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#3B82F620",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="water" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                      Mức ngập
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>
                      Hiển thị vùng ngập lụt
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.overlays.flood}
                  onValueChange={() => toggleOverlay("flood")}
                  trackColor={{ false: colors.border, true: `${colors.accent}80` }}
                  thumbColor={settings.overlays.flood ? colors.accent : "#f4f3f4"}
                />
              </View>

              {/* Flood Opacity Slider */}
              {settings.overlays.flood && (
                <View
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.cardBg,
                    marginTop: -4,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.subtext }}>
                      Độ trong suốt
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                      {settings.opacity.flood}%
                    </Text>
                  </View>
                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={settings.opacity.flood}
                    onSlidingComplete={(value) => handleOpacityChange("flood", value)}
                    minimumTrackTintColor={colors.accent}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.accent}
                  />
                </View>
              )}

              {/* Traffic Layer */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardBg,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#F9731620",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="car" size={20} color="#F97316" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                      Giao thông
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>
                      Tình trạng đường
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.overlays.traffic}
                  onValueChange={() => toggleOverlay("traffic")}
                  trackColor={{ false: colors.border, true: "#F9731680" }}
                  thumbColor={settings.overlays.traffic ? "#F97316" : "#f4f3f4"}
                />
              </View>

              {/* Weather Layer */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardBg,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#8B5CF620",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="rainy" size={20} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                      Thời tiết
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>
                      Radar mưa
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.overlays.weather}
                  onValueChange={() => toggleOverlay("weather")}
                  trackColor={{ false: colors.border, true: "#8B5CF680" }}
                  thumbColor={settings.overlays.weather ? "#8B5CF6" : "#f4f3f4"}
                />
              </View>

              {/* Weather Opacity Slider */}
              {settings.overlays.weather && (
                <View
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.cardBg,
                    marginTop: -4,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.subtext }}>
                      Độ trong suốt
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                      {settings.opacity.weather}%
                    </Text>
                  </View>
                  <Slider
                    style={{ width: "100%", height: 30 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={settings.opacity.weather}
                    onSlidingComplete={(value) => handleOpacityChange("weather", value)}
                    minimumTrackTintColor="#8B5CF6"
                    maximumTrackTintColor={colors.border}
                    thumbTintColor="#8B5CF6"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Info Note */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 14,
              borderRadius: 12,
              backgroundColor: `${colors.accent}10`,
              gap: 10,
              marginBottom: 30,
            }}
          >
            <Ionicons name="information-circle" size={18} color={colors.accent} />
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                color: colors.subtext,
                lineHeight: 18,
              }}
            >
              Cài đặt sẽ được lưu tự động và đồng bộ khi bạn đăng nhập.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

// Main export - modal wrapper that only renders content when visible
export function LayerToggleSheet({ 
  visible, 
  onClose, 
  areaDisplayMode,
  onAreaDisplayModeChange 
}: LayerToggleSheetProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <LayerToggleSheetContent 
        onClose={onClose} 
        areaDisplayMode={areaDisplayMode}
        onAreaDisplayModeChange={onAreaDisplayModeChange}
      />
    </Modal>
  );
}

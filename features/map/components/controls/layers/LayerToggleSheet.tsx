// features/map/components/controls/layers/LayerToggleSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { useFloodLayerSettings } from "~/features/map/hooks/flood";
import type { BaseMapType, MapLayerSettings } from "~/features/map/types/map-layers.types";
import { LayerSheetHeader } from "./LayerSheetHeader";
import { BaseMapSelector } from "./BaseMapSelector";
import { AreaDisplayModeSelector } from "./AreaDisplayModeSelector";
import { OverlayLayerItem } from "./OverlayLayerItem";
import { OpacitySlider } from "./OpacitySlider";
import { useCurrentSubscription } from "~/features/plans/hooks/useCurrentSubscription";

interface LayerToggleSheetProps {
  visible: boolean;
  onClose: () => void;
  areaDisplayMode?: "user" | "admin";
  onAreaDisplayModeChange?: (mode: "user" | "admin") => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const { settings, toggleOverlay, setBaseMap, setOpacity } = useFloodLayerSettings();
  const { data: subscriptionData } = useCurrentSubscription();
  const tierCode = subscriptionData?.subscription?.tierCode;
  const isFreePlan = !tierCode || tierCode === "FREE";

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    accent: "#007AFF",
    overlay: "rgba(0, 0, 0, 0.5)",
  };

  const handleBaseMapChange = useCallback(
    (mapType: BaseMapType) => setBaseMap(mapType),
    [setBaseMap]
  );

  const handleOpacityChange = useCallback(
    (layer: keyof MapLayerSettings["opacity"], value: number) =>
      setOpacity(layer, Math.round(value)),
    [setOpacity]
  );

  return (
    <>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          maxHeight: SCREEN_HEIGHT * 0.7,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Handle Bar */}
        <View style={{ alignItems: "center", paddingTop: 12 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        </View>

        {/* Header */}
        <LayerSheetHeader
          onClose={onClose}
          accentColor={colors.accent}
          textColor={colors.text}
          subtextColor={colors.subtext}
          cardBg={colors.cardBg}
          borderColor={colors.border}
        />

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Base Map */}
          <BaseMapSelector
            selectedMap={settings?.baseMap ?? "standard"}
            onChange={handleBaseMapChange}
            accentColor={colors.accent}
            textColor={colors.text}
            subtextColor={colors.subtext}
            cardBg={colors.cardBg}
            borderColor={colors.border}
            isDarkColorScheme={isDarkColorScheme}
          />

          {/* Area Display Mode */}
          {onAreaDisplayModeChange && (
            <AreaDisplayModeSelector
              selectedMode={areaDisplayMode}
              onChange={onAreaDisplayModeChange}
              accentColor={colors.accent}
              textColor={colors.text}
              subtextColor={colors.subtext}
              cardBg={colors.cardBg}
              borderColor={colors.border}
              isDarkColorScheme={isDarkColorScheme}
              isFreePlan={isFreePlan}
            />
          )}

          {/* Overlay Layers */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.subtext, marginBottom: 12, letterSpacing: 0.5 }}>
              LỚP HIỂN THỊ
            </Text>

            <View style={{ gap: 12 }}>
              {/* Flood */}
              <View>
                <OverlayLayerItem
                  label="Mức ngập"
                  description="Hiển thị vùng ngập lụt"
                  value={settings?.overlays?.flood ?? true}
                  color="#007AFF"
                  iconName="water"
                  onToggle={() => toggleOverlay("flood")}
                  accentColor={colors.accent}
                  textColor={colors.text}
                  subtextColor={colors.subtext}
                  cardBg={colors.cardBg}
                  borderColor={colors.border}
                />
                {settings?.overlays?.flood && (
                  <View style={{ padding: 16, backgroundColor: colors.cardBg, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginTop: -4 }}>
                    <OpacitySlider
                      label="Độ trong suốt"
                      value={settings?.opacity?.flood ?? 80}
                      color={colors.accent}
                      subtextColor={colors.subtext}
                      textColor={colors.text}
                      borderColor={colors.border}
                      onChange={(v) => handleOpacityChange("flood", v)}
                    />
                  </View>
                )}
              </View>

              {/* Traffic */}
              <OverlayLayerItem
                label="Giao thông"
                description="Tình trạng đường"
                value={settings?.overlays?.traffic ?? false}
                color="#F97316"
                iconName="car"
                onToggle={() => toggleOverlay("traffic")}
                accentColor={colors.accent}
                textColor={colors.text}
                subtextColor={colors.subtext}
                cardBg={colors.cardBg}
                borderColor={colors.border}
              />

              {/* Weather */}
              <View>
                <OverlayLayerItem
                  label="Thời tiết"
                  description="Radar mưa"
                  value={settings?.overlays?.weather ?? false}
                  color="#8B5CF6"
                  iconName="rainy"
                  onToggle={() => toggleOverlay("weather")}
                  accentColor={colors.accent}
                  textColor={colors.text}
                  subtextColor={colors.subtext}
                  cardBg={colors.cardBg}
                  borderColor={colors.border}
                />
                {settings?.overlays?.weather && (
                  <View style={{ padding: 16, backgroundColor: colors.cardBg, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginTop: -4 }}>
                    <OpacitySlider
                      label="Độ trong suốt"
                      value={settings?.opacity?.weather ?? 70}
                      color="#8B5CF6"
                      subtextColor={colors.subtext}
                      textColor={colors.text}
                      borderColor={colors.border}
                      onChange={(v) => handleOpacityChange("weather", v)}
                    />
                  </View>
                )}
              </View>

              {/* Community Reports */}
              <OverlayLayerItem
                label="Báo cáo cộng đồng"
                description="Phản ánh từ người dân"
                value={settings?.overlays?.communityReports ?? true}
                color="#10B981"
                iconName="people"
                onToggle={() => toggleOverlay("communityReports")}
                accentColor={colors.accent}
                textColor={colors.text}
                subtextColor={colors.subtext}
                cardBg={colors.cardBg}
                borderColor={colors.border}
              />
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
            <Text style={{ flex: 1, fontSize: 12, color: colors.subtext, lineHeight: 18 }}>
              Cài đặt sẽ được lưu tự động và đồng bộ khi bạn đăng nhập.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

export function LayerToggleSheet({
  visible,
  onClose,
  areaDisplayMode,
  onAreaDisplayModeChange,
}: LayerToggleSheetProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <LayerToggleSheetContent
        onClose={onClose}
        areaDisplayMode={areaDisplayMode}
        onAreaDisplayModeChange={onAreaDisplayModeChange}
      />
    </Modal>
  );
}

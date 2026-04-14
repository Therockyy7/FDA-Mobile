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
import { SHADOW } from "~/lib/design-tokens";
import { useFloodLayerSettings } from "~/features/map/hooks/flood";
import type { BaseMapType, MapLayerSettings } from "~/features/map/types/map-layers.types";
import { LayerSheetHeader } from "./LayerSheetHeader";
import { BaseMapSelector } from "./BaseMapSelector";
import { AreaDisplayModeSelector } from "./AreaDisplayModeSelector";
import { OverlayLayerItem } from "./OverlayLayerItem";
import { OpacitySlider } from "./OpacitySlider";

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
  const { settings, toggleOverlay, setBaseMap, setOpacity } = useFloodLayerSettings();

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
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
        testID="map-layer-sheet-backdrop"
      />

      <View
        className="absolute bottom-0 left-0 right-0 bg-card dark:bg-card"
        style={{
          maxHeight: SCREEN_HEIGHT * 0.7,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          ...SHADOW.lg,
        }}
      >
        {/* Handle Bar */}
        <View className="items-center pt-3">
          <View className="w-10 h-1 rounded-full bg-border" />
        </View>

        {/* Header */}
        <LayerSheetHeader
          onClose={onClose}
        />

        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Base Map */}
          <BaseMapSelector
            selectedMap={settings?.baseMap ?? "standard"}
            onChange={handleBaseMapChange}
          />

          {/* Area Display Mode */}
          {onAreaDisplayModeChange && (
            <AreaDisplayModeSelector
              selectedMode={areaDisplayMode}
              onChange={onAreaDisplayModeChange}
            />
          )}

          {/* Overlay Layers */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide">
              LỚP HIỂN THỊ
            </Text>

            <View className="gap-3">
              {/* Flood */}
              <View>
                <OverlayLayerItem
                  label="Mức ngập"
                  description="Hiển thị vùng ngập lụt"
                  value={settings?.overlays?.flood ?? true}
                  colorToken="primary"
                  iconName="water"
                  onToggle={() => toggleOverlay("flood")}
                  testID="map-layer-toggle-item-flood"
                />
                {settings?.overlays?.flood && (
                  <View className="p-4 bg-muted dark:bg-muted rounded-b-2xl -mt-1">
                    <OpacitySlider
                      label="Độ trong suốt"
                      value={settings?.opacity?.flood ?? 80}
                      onChange={(v) => handleOpacityChange("flood", v)}
                      testID="map-layer-opacity-slider-flood"
                    />
                  </View>
                )}
              </View>

              {/* Traffic */}
              <OverlayLayerItem
                label="Giao thông"
                description="Tình trạng đường"
                value={settings?.overlays?.traffic ?? false}
                colorToken="warning"
                iconName="car"
                onToggle={() => toggleOverlay("traffic")}
                testID="map-layer-toggle-item-traffic"
              />

              {/* Weather */}
              <View>
                <OverlayLayerItem
                  label="Thời tiết"
                  description="Radar mưa"
                  value={settings?.overlays?.weather ?? false}
                  colorToken="purple"
                  iconName="rainy"
                  onToggle={() => toggleOverlay("weather")}
                  testID="map-layer-toggle-item-weather"
                />
                {settings?.overlays?.weather && (
                  <View className="p-4 bg-muted dark:bg-muted rounded-b-2xl -mt-1">
                    <OpacitySlider
                      label="Độ trong suốt"
                      value={settings?.opacity?.weather ?? 70}
                      onChange={(v) => handleOpacityChange("weather", v)}
                      testID="map-layer-opacity-slider-weather"
                    />
                  </View>
                )}
              </View>

              {/* Community Reports */}
              <OverlayLayerItem
                label="Báo cáo cộng đồng"
                description="Phản ánh từ người dân"
                value={settings?.overlays?.communityReports ?? true}
                colorToken="success"
                iconName="people"
                onToggle={() => toggleOverlay("communityReports")}
                testID="map-layer-toggle-item-community"
              />
            </View>
          </View>

          {/* Info Note */}
          <View className="flex-row items-start p-3.5 rounded-xl bg-primary/10 gap-2.5 mb-8">
            <Ionicons name="information-circle" size={18} className="text-primary" color="#007AFF" />
            <Text className="flex-1 text-xs text-muted-foreground leading-[18px]">
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

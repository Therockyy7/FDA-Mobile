// features/map/components/areas/sheets/AreaCreationOptionSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { CreationOption } from "~/features/map/types/area.types";
import { RADIUS } from "~/features/map/lib/map-ui-utils";

export type { CreationOption };
const { height: _SCREEN_HEIGHT } = Dimensions.get("window");

interface AreaCreationOptionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: CreationOption) => void;
  isLoadingGps?: boolean;
  isLoadingSearch?: boolean;
}

interface OptionItemProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  colors: {
    card: string;
    text: string;
    subtext: string;
    border: string;
    muted: string;
  };
}

function OptionItem({ icon, iconBg, iconColor, title, description, onPress, isLoading, isDisabled, colors }: OptionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      disabled={isLoading || isDisabled}
      style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: iconBg }]}>
        {isLoading
          ? <ActivityIndicator size="small" color={iconColor} />
          : <Ionicons name={icon as any} size={22} color={iconColor} />}
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.optionDesc, { color: colors.muted }]} numberOfLines={2}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

export function AreaCreationOptionSheet({
  visible,
  onClose,
  onSelectOption,
  isLoadingGps = false,
  isLoadingSearch = false,
}: AreaCreationOptionSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const c = {
    card: isDark ? "rgba(51,65,85,0.95)" : "rgba(255,255,255,0.98)",
    surface: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1E293B",
    subtext: isDark ? "#94A3B8" : "#64748B",
    muted: isDark ? "#64748B" : "#9CA3AF",
    border: isDark ? "#334155" : "#E2E8F0",
    accent: "#10B981",
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)" }]} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: insets.bottom + 20 }]}>
        {/* Drag handle */}
        <View style={styles.handleArea}>
          <View style={[styles.handleBar, { backgroundColor: c.border }]} />
        </View>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.headerIconWrap, { backgroundColor: `${c.accent}18` }]}>
            <Ionicons name="add-circle" size={22} color={c.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: c.text }]}>Tạo vùng theo dõi</Text>
            <Text style={[styles.headerSub, { color: c.muted }]}>Chọn cách xác định vị trí</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={c.muted} />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          <OptionItem
            icon="navigate"
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            title="Vị trí hiện tại"
            description="Sử dụng GPS làm tâm vùng"
            onPress={() => onSelectOption("gps")}
            isLoading={isLoadingGps}
            isDisabled={isLoadingSearch}
            colors={c}
          />
          <OptionItem
            icon="map"
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
            title="Tự chọn vùng"
            description="Chọn vị trí trung tâm bản đồ"
            onPress={() => onSelectOption("map_center")}
            isDisabled={isLoadingGps || isLoadingSearch}
            colors={c}
          />
          <OptionItem
            icon="search"
            iconBg="#FFF7ED"
            iconColor="#F97316"
            title="Tìm kiếm địa chỉ"
            description="Nhập địa chỉ để tạo vùng"
            onPress={() => onSelectOption("search")}
            isLoading={isLoadingSearch}
            isDisabled={isLoadingGps}
            colors={c}
          />
        </View>

        {/* Hint */}
        <Text style={[styles.hint, { color: c.muted }]}>
          Bạn có thể điều chỉnh bán kính sau khi chọn vị trí
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 18,
    paddingHorizontal: 16,
  },
  handleArea: { alignItems: "center", paddingTop: 12, paddingBottom: 6 },
  handleBar: { width: 42, height: 5, borderRadius: 3 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsWrap: { gap: 8, marginTop: 4 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  optionDesc: { fontSize: 12, lineHeight: 17 },
  hint: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 16,
  },
});
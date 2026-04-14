// features/map/components/areas/sheets/AreaNameInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { RADIUS } from "~/lib/design-tokens";

interface AreaNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

const AREA_TAGS = [
  { id: "home", label: "Nhà", icon: "home", color: "#10B981" },
  { id: "office", label: "Công ty", icon: "business", color: "#3B82F6" },
  { id: "school", label: "Trường", icon: "school", color: "#F59E0B" },
  { id: "market", label: "Chợ", icon: "cart", color: "#EF4444" },
] as const;

export function AreaNameInput({ value, onChangeText, disabled }: AreaNameInputProps) {
  const { isDarkColorScheme } = useColorScheme();
  const c = {
    inputBg: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    muted: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.label, { color: c.muted }]}>TÊN VÙNG</Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {AREA_TAGS.map((tag) => {
          const sel = value === tag.label;
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => onChangeText(sel ? "" : tag.label)}
              activeOpacity={0.7}
              style={[styles.tag, { backgroundColor: sel ? tag.color : `${tag.color}15`, borderColor: sel ? tag.color : `${tag.color}40` }]}
            >
              <Ionicons name={tag.icon as any} size={12} color={sel ? "white" : tag.color} />
              <Text style={[styles.tagText, { color: sel ? "white" : tag.color }]}>{tag.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: c.inputBg, borderColor: c.border }]}>
        <Ionicons name="bookmark-outline" size={16} color={c.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Hoặc nhập tên tùy chỉnh..."
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
          maxLength={255}
          editable={!disabled}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={16} color={c.muted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  tagText: { fontSize: 12, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
});
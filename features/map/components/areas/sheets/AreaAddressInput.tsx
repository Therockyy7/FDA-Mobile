// features/map/components/areas/sheets/AreaAddressInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { RADIUS } from "~/features/map/lib/map-ui-utils";

interface AreaAddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

export function AreaAddressInput({ value, onChangeText, disabled }: AreaAddressInputProps) {
  const { isDarkColorScheme } = useColorScheme();
  const c = {
    inputBg: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    muted: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: c.muted }]}>ĐỊA CHỈ (Tùy chọn)</Text>
      <View style={[styles.inputRow, { backgroundColor: c.inputBg, borderColor: c.border }]}>
        <Ionicons name="location-outline" size={16} color={c.muted} style={{ marginTop: 2 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
          maxLength={500}
          multiline
          numberOfLines={2}
          editable={!disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, minHeight: 52, textAlignVertical: "top" },
});
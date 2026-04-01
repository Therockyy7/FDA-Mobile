// features/map/components/areas/sheets/AreaAddressInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface AreaAddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

export function AreaAddressInput({ value, onChangeText, disabled }: AreaAddressInputProps) {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    inputBg: isDarkColorScheme ? "#0B1A33" : "#F1F5F9",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  return (
    <View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.subtext,
          marginBottom: 8,
          letterSpacing: 0.5,
        }}
      >
        ĐỊA CHỈ (Tùy chọn)
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          backgroundColor: colors.inputBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          paddingVertical: 4,
          marginBottom: 20,
        }}
      >
        <Ionicons
          name="location"
          size={18}
          color={colors.subtext}
          style={{ marginTop: 14 }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
          placeholderTextColor={colors.subtext}
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            fontSize: 15,
            color: colors.text,
            minHeight: 60,
            textAlignVertical: "top",
          }}
          maxLength={500}
          multiline
          numberOfLines={2}
          editable={!disabled}
        />
      </View>
    </View>
  );
}

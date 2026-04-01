// features/map/components/areas/sheets/AreaNameInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface AreaNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

// Quick select tags for area names
const AREA_TAGS = [
  { id: "home", label: "Nhà", icon: "home", color: "#10B981" },
  { id: "office", label: "Công ty", icon: "business", color: "#007AFF" },
  { id: "school", label: "Trường học", icon: "school", color: "#F59E0B" },
  { id: "market", label: "Chợ", icon: "cart", color: "#EF4444" },
  { id: "hospital", label: "Bệnh viện", icon: "medkit", color: "#EC4899" },
  { id: "warehouse", label: "Kho hàng", icon: "cube", color: "#8B5CF6" },
] as const;

export function AreaNameInput({ value, onChangeText, disabled }: AreaNameInputProps) {
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
        TÊN VÙNG *
      </Text>

      {/* Quick Select Tags */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {AREA_TAGS.map((tag) => {
          const isSelected = value === tag.label;
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => onChangeText(isSelected ? "" : tag.label)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected
                  ? tag.color
                  : `${tag.color}15`,
                borderWidth: 1.5,
                borderColor: isSelected ? tag.color : `${tag.color}40`,
              }}
            >
              <Ionicons
                name={tag.icon as any}
                size={16}
                color={isSelected ? "white" : tag.color}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isSelected ? "white" : tag.color,
                }}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Text Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.inputBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          marginBottom: 16,
        }}
      >
        <Ionicons name="bookmark" size={18} color={colors.subtext} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Hoặc nhập tên tùy chỉnh..."
          placeholderTextColor={colors.subtext}
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            fontSize: 15,
            color: colors.text,
          }}
          maxLength={255}
          editable={!disabled}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.subtext}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

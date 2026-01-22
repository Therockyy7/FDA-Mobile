// features/alerts/components/alert-history/AlertHistorySearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

interface AlertHistorySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  colors: {
    text: string;
    subtext: string;
    inputBg: string;
  };
}

export function AlertHistorySearchBar({
  value,
  onChange,
  placeholder,
  colors,
}: AlertHistorySearchBarProps) {
  return (
    <View style={{ position: "relative", marginBottom: 12 }}>
      <View
        style={{
          position: "absolute",
          left: 12,
          top: 0,
          bottom: 0,
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Ionicons name="search" size={16} color={colors.subtext} />
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        style={{
          backgroundColor: colors.inputBg,
          borderRadius: 14,
          paddingVertical: 10,
          paddingLeft: 38,
          paddingRight: 12,
          fontSize: 14,
          color: colors.text,
        }}
      />
    </View>
  );
}

export default AlertHistorySearchBar;

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
    <View testID="alerts-history-search-bar" className="relative mb-3">
      <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
        <Ionicons name="search" size={16} color={colors.subtext} />
      </View>

      <TextInput
        testID="alerts-history-search-input"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={{
          backgroundColor: colors.inputBg,
          borderRadius: 12,
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

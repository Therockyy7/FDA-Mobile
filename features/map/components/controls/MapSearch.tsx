// features/map/components/controls/MapSearch.tsx
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { SHADOW } from "~/lib/design-tokens";

interface MapSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function MapSearch({ value, onChangeText, onClear }: MapSearchProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <View
      className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]"
      style={[
        SHADOW.sm,
        {
          flexDirection: "row",
          alignItems: "center",
          height: 44,
          borderRadius: 12,
          paddingHorizontal: 12,
        },
      ]}
      testID="map-header-search"
    >
      <Ionicons name="search" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Tìm kiếm..."
        placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        testID="map-header-search-input"
        style={{
          flex: 1,
          height: "100%",
          paddingHorizontal: 10,
          fontSize: 14,
          color: isDark ? "#F1F5F9" : "#1F2937",
        }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} testID="map-header-search-clear-btn">
          <Ionicons name="close-circle" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// features/map/components/controls/MapSearch.tsx
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";

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
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 44,
        backgroundColor: isDark ? "#1E293B" : "white",
        borderRadius: 12,
        paddingHorizontal: 12,
        ...CARD_SHADOW,
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#E2E8F0",
      }}
    >
      <Ionicons name="search" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Tìm kiếm..."
        placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        style={{
          flex: 1,
          height: "100%",
          paddingHorizontal: 10,
          fontSize: 14,
          color: isDark ? "#F1F5F9" : "#1F2937",
        }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
        </TouchableOpacity>
      )}
    </View>
  );
}

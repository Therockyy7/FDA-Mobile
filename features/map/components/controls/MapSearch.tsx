import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

interface MapSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function MapSearch({ value, onChangeText, onClear }: MapSearchProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 44,
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Ionicons name="search" size={18} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search sensors..."
        placeholderTextColor="#9CA3AF"
        style={{
          flex: 1,
          height: "100%",
          paddingHorizontal: 10,
          fontSize: 14,
          color: "#1F2937",
        }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

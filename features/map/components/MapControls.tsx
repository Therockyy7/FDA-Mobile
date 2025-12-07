import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onMyLocation }: MapControlsProps) {
  return (
    <View style={{ gap: 10 }}>
      {/* Zoom Controls */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <TouchableOpacity
          onPress={onZoomIn}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onZoomOut}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* My Location */}
      <TouchableOpacity
        onPress={onMyLocation}
        style={{
          width: 40,
          height: 40,
          backgroundColor: "white",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons name="my-location" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
}

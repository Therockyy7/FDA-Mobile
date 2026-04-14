// features/notifications/components/NotificationMapPreview.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { SHADOW, MAP_COLORS } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";

interface NotificationMapPreviewProps {
  stationId: string;
  stationName?: string;
}

export function NotificationMapPreview({
  stationId,
  stationName,
}: NotificationMapPreviewProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const c = isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;

  return (
    <TouchableOpacity
      testID="notification-detail-map-preview"
      onPress={() =>
        router.push({
          pathname: "/map",
          params: { stationId },
        } as any)
      }
      activeOpacity={0.8}
      style={{
        marginHorizontal: 20,
        height: 160,
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: isDarkColorScheme ? 1 : 0,
        borderColor: c.border,
        position: "relative",
      }}
      className="bg-white dark:bg-slate-800"
    >
      <View
        pointerEvents="none"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ width: "100%", height: "100%", opacity: isDarkColorScheme ? 0.6 : 0.4 }}
          initialRegion={{
            latitude: 16.0544,
            longitude: 108.2022,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          cacheEnabled
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkColorScheme
              ? "rgba(11,26,51,0.4)"
              : "rgba(241,245,249,0.3)",
          }}
        />
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            backgroundColor: isDarkColorScheme
              ? "rgba(30,41,59,0.9)"
              : "rgba(255,255,255,0.9)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            ...SHADOW.md,
          }}
        >
          <Ionicons name="map" size={28} color="#007AFF" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            textShadowColor: isDarkColorScheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
          className="text-slate-900 dark:text-slate-100"
        >
          Xem trên bản đồ
        </Text>
        {stationName && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              marginTop: 4,
              textShadowColor: isDarkColorScheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
            className="text-slate-500 dark:text-slate-400"
          >
            {stationName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

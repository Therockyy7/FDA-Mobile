import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { NOTIFICATION_TOKENS, SHADOW } from "~/lib/design-tokens";

interface NotificationWaterLevelCardProps {
  waterLevel: number;
  stationCode?: string;
}

const getRiskColor = (level: number): string => {
  if (level >= 40) return NOTIFICATION_TOKENS.riskColors.critical;
  if (level >= 20 && level < 40) return NOTIFICATION_TOKENS.riskColors.warning;
  if (level >= 10 && level < 20) return NOTIFICATION_TOKENS.riskColors.caution;
  return NOTIFICATION_TOKENS.riskColors.normal;
};

export function NotificationWaterLevelCard({
  waterLevel,
  stationCode,
}: NotificationWaterLevelCardProps) {
  return (
    <View
      testID="notification-detail-water-level-card"
      style={{
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        ...SHADOW.sm,
        borderWidth: 1,
      }}
      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Ionicons name="water" size={16} color="#0EA5E9" />
        <Text
          style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}
          className="text-slate-500 dark:text-slate-400"
        >
          Mực nước hiện tại
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 12 }}>
        <Text
          style={{ fontSize: 40, fontWeight: "800", lineHeight: 48, letterSpacing: -1 }}
          className="text-slate-900 dark:text-slate-100"
        >
          {waterLevel}
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: "600", marginLeft: 6 }}
          className="text-slate-500 dark:text-slate-400"
        >
          cm
        </Text>
      </View>

      {/* Level Indicator */}
      <View
        style={{
          height: 4,
          borderRadius: 2,
          marginBottom: 16,
          overflow: "hidden",
        }}
        className="bg-slate-900/4 dark:bg-white/5"
      >
        <View
          style={{
            width: `${Math.min(waterLevel * 2, 100)}%`,
            height: "100%",
            backgroundColor: getRiskColor(waterLevel),
            borderRadius: 2,
          }}
        />
      </View>

      {/* Supporting Stats */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          paddingTop: 12,
        }}
        className="border-t-slate-900/4 dark:border-t-white/5"
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 12, fontWeight: "500", marginBottom: 4 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Hiện tại
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: "700" }}
            className="text-slate-900 dark:text-slate-100"
          >
            {waterLevel} cm
          </Text>
        </View>

        <View
          style={{
            width: 1,
            height: 24,
            marginHorizontal: 16,
          }}
          className="bg-slate-900/4 dark:bg-white/5"
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 12, fontWeight: "500", marginBottom: 4 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Mã trạm
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: "700" }}
            className="text-slate-900 dark:text-slate-100"
          >
            {stationCode ?? "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

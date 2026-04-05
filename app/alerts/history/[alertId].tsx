// app/alerts/history/[alertId].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

export default function AlertHistoryDetailScreen() {
  const router = useRouter();
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const colors = useMemo(
    () => ({
      primary: "#137fec",
      background: isDarkColorScheme ? "#101922" : "#f6f7f8",
      card: isDarkColorScheme ? "rgba(30,41,59,0.4)" : "#FFFFFF",
      text: isDarkColorScheme ? "#FFFFFF" : "#0B1A33",
      subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
      border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    }),
    [isDarkColorScheme],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: isDarkColorScheme
              ? "rgba(148,163,184,0.15)"
              : "rgba(15,23,42,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            flex: 1,
          }}
        >
          Chi tiết cảnh báo
        </Text>
      </View>

      {/* Placeholder content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: isDarkColorScheme
              ? "rgba(19,127,236,0.15)"
              : "rgba(19,127,236,0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="document-text-outline" size={32} color={colors.primary} />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
          }}
        >
          Alert #{alertId}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "400",
            color: colors.subtext,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Chi tiết cảnh báo sẽ được hiển thị đầy đủ tại đây bao gồm mực nước,
          kênh thông báo, và timeline xử lý.
        </Text>
      </View>
    </SafeAreaView>
  );
}

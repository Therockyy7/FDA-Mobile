// features/alerts/components/alert-history/AlertHistoryHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AlertHistoryHeaderProps {
  title: string;
  onBack: () => void;
  onFilter?: () => void;
  colors: {
    text: string;
    primary: string;
    border: string;
    backgroundOverlay: string;
  };
  topInset: number;
}

export function AlertHistoryHeader({
  title,
  onBack,
  onFilter,
  colors,
  topInset,
}: AlertHistoryHeaderProps) {
  return (
    <View
      testID="alerts-history-header"
      className="absolute top-0 left-0 right-0 z-10 px-4 bg-slate-50 dark:bg-slate-950"
      style={{ paddingTop: topInset + 8, paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            testID="alerts-history-header-back"
            activeOpacity={0.8}
            onPress={onBack}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
          </TouchableOpacity>

          <Text testID="alerts-history-header-title" className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </Text>
        </View>

        {onFilter && (
          <TouchableOpacity
            testID="alerts-history-header-filter"
            activeOpacity={0.8}
            onPress={onFilter}
            className="w-10 h-10 rounded-lg items-center justify-center bg-primary/10 dark:bg-primary/20"
          >
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default AlertHistoryHeader;

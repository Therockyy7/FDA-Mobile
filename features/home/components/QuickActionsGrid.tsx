
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { QuickAction } from "../types/home-types";

interface QuickActionsGridProps {
  actions: QuickAction[];
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const router = useRouter();

  return (
    <View className="px-4 pb-4">
      <View className="flex-row gap-3">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(action.route as any)}
            className="flex-1"
            activeOpacity={0.7}
          >
            <View
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 items-center gap-2"
              style={{
                shadowColor: action.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <MaterialIcons
                  name={action.icon as any}
                  size={26}
                  color={action.color}
                />
              </View>
              <Text className="text-slate-800 dark:text-slate-200 text-[11px] font-semibold text-center leading-tight">
                {action.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  testID?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, rightAction, testID, className }: SectionHeaderProps) {
  return (
    <View testID={testID} className={cn("flex-row items-center justify-between", className)}>
      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}

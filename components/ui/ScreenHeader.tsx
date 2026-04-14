import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  testID?: string;
  className?: string;
}

export function ScreenHeader({ title, subtitle, leftAction, rightAction, testID, className }: ScreenHeaderProps) {
  return (
    <View
      testID={testID}
      className={cn("flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900", className)}
    >
      {leftAction ? <View>{leftAction}</View> : <View className="w-10" />}
      <View className="flex-1 items-center">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction ? <View>{rightAction}</View> : <View className="w-10" />}
    </View>
  );
}

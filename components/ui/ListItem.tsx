import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface ListItemProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
  className?: string;
}

export function ListItem({ leading, title, subtitle, trailing, onPress, testID, className }: ListItemProps) {
  const content = (
    <>
      {leading && <View>{leading}</View>}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {trailing && <View>{trailing}</View>}
    </>
  );

  const baseClass = cn("flex-row items-center min-h-[56px] px-4 gap-3", className);

  if (onPress) {
    return (
      <Pressable testID={testID} onPress={onPress} className={baseClass}>
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} className={baseClass}>
      {content}
    </View>
  );
}

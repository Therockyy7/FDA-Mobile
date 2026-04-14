import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const pillVariants = cva(
  "rounded-full flex-row items-center justify-center px-3 py-1 gap-1",
  {
    variants: {
      variant: {
        filled: "bg-primary",
        outline: "border border-border-light dark:border-border-dark",
      },
    },
    defaultVariants: { variant: "filled" },
  }
);

interface PillProps extends VariantProps<typeof pillVariants> {
  label: string;
  leftIcon?: ReactNode;
  onRemove?: () => void;
  testID?: string;
  className?: string;
}

export function Pill({ variant, label, leftIcon, onRemove, testID, className }: PillProps) {
  const isOutline = variant === "outline";
  const textClass = isOutline
    ? "text-caption font-semibold text-slate-700 dark:text-slate-200"
    : "text-caption font-semibold text-white";
  return (
    <View testID={testID} className={cn(pillVariants({ variant }), className)}>
      {leftIcon && <View>{leftIcon}</View>}
      <Text className={textClass}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-0.5">
          <Text className={textClass}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

import { Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "rounded-full flex-row items-center justify-center",
  {
    variants: {
      variant: {
        safe: "bg-flood-safe",
        warning: "bg-flood-warning",
        danger: "bg-flood-danger",
        critical: "bg-flood-critical",
        info: "bg-flood-info",
        default: "bg-flood-default",
      },
      size: {
        sm: "px-2 py-0.5",
        md: "px-3 py-1",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  testID?: string;
  className?: string;
}

export function Badge({ variant, size, label, testID, className }: BadgeProps) {
  return (
    <View
      testID={testID}
      className={cn(badgeVariants({ variant, size }), className)}
    >
      <Text className="text-white text-caption font-semibold">{label}</Text>
    </View>
  );
}

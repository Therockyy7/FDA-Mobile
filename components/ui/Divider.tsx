import { View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const dividerVariants = cva(
  "bg-border-light dark:bg-border-dark",
  {
    variants: {
      orientation: {
        horizontal: "w-full h-px",
        vertical: "h-full w-px",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }
);

interface DividerProps extends VariantProps<typeof dividerVariants> {
  testID?: string;
  className?: string;
}

/**
 * A 1px visual separator.
 *
 * **Note:** When `orientation="vertical"`, the parent View must have an explicit
 * height or `flex: 1` within a bounded ancestor — otherwise `h-full` collapses to 0.
 */
export function Divider({ orientation, testID, className }: DividerProps) {
  return (
    <View
      testID={testID}
      className={cn(dividerVariants({ orientation }), className)}
    />
  );
}

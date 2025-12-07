import * as React from "react";
import { Text as RNText, TextProps } from "react-native";
import { cn } from "~/lib/utils";

export const Text = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={cn("text-slate-900 dark:text-white", className)}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

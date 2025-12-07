import * as React from "react";
import { Pressable, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "",
        link: "",
      },
      size: {
        default: "h-14 px-6",
        sm: "h-9 px-3",
        lg: "h-16 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  withShadow?: boolean;
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, withShadow = false, ...props }, ref) => {
  const buttonContent = (
    <Pressable
      className={cn(
        buttonVariants({ variant, size, className }),
        props.disabled && "opacity-50"
      )}
      ref={ref}
      {...props}
    />
  );

  if (withShadow) {
    return (
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {buttonContent}
      </View>
    );
  }

  return buttonContent;
});

Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { Pressable } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const iconButtonVariants = cva(
  "items-center justify-center rounded-lg disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary",
        ghost: "bg-transparent",
        outline: "border border-border-light dark:border-border-dark bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface IconButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof iconButtonVariants> {
  children: React.ReactNode;
  className?: string;
}

export function IconButton({
  variant,
  size,
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Pressable>
  );
}

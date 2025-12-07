import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  type ControllerRenderProps,
  type ControllerFieldState,
  type UseFormStateReturn,
} from "react-hook-form";
import { View } from "react-native";
import { cn } from "~/lib/utils";
import { Text } from "./text";

// Generic Form Control following React Hook Form documentation
interface FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  rules?: RegisterOptions<TFieldValues, TName>;
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
}

function FormControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, rules, render }: FormControlProps<TFieldValues, TName>) {
  return (
    <Controller control={control} name={name} rules={rules} render={render} />
  );
}

// Form Group for organizing form fields
interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

function FormGroup({ children, className }: FormGroupProps) {
  return <View className={cn("space-y-4", className)}>{children}</View>;
}

// Form Field wrapper with label and error handling
interface FormFieldWrapperProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormFieldWrapper({
  label,
  error,
  description,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <View className={cn("space-y-2", className)}>
      {label && (
        <Text className="text-sm font-medium mb-1">
          {label}
          {required && <Text className="text-destructive ml-1">*</Text>}
        </Text>
      )}
      {children}
      {error && <Text className="text-sm text-destructive">{error}</Text>}
      {description && !error && (
        <Text className="text-sm text-muted-foreground">{description}</Text>
      )}
    </View>
  );
}

export { FormControl, FormFieldWrapper, FormGroup };

export type { FormControlProps, FormFieldWrapperProps, FormGroupProps };

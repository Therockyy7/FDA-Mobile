import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import { cn } from '~/lib/utils';
import { Input, type InputProps } from './input';
import { Label } from './label';
import { Text } from './text';

// Form Field Container
interface FormFieldProps extends ViewProps {
  children: React.ReactNode;
}

function FormField({ className, children, ...props }: FormFieldProps) {
  return (
    <View className={cn('space-y-2', className)} {...props}>
      {children}
    </View>
  );
}

// Form Label component
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

function FormLabel({ children, required }: FormLabelProps) {
  return (
    <Label>
      {children}
      {required && <Text className="text-destructive ml-1">*</Text>}
    </Label>
  );
}

// Form Description component
interface FormDescriptionProps {
  children: React.ReactNode;
}

function FormDescription({ children }: FormDescriptionProps) {
  return (
    <Text className="text-sm text-muted-foreground">
      {children}
    </Text>
  );
}

// Form Item following React Hook Form Controller pattern
interface FormItemProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  rules?: RegisterOptions<TFieldValues, TName>;
}

function FormItem<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  rules,
  className,
  ...inputProps
}: FormItemProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormField>
          {label && <FormLabel>{label}</FormLabel>}
          <Input
            {...inputProps}
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            className={cn(error && 'border-destructive', className)}
          />
          {error && (
            <Text className="text-sm text-destructive">{error.message}</Text>
          )}
          {description && !error && (
            <FormDescription>{description}</FormDescription>
          )}
        </FormField>
      )}
    />
  );
}

// Standalone Form Error Message component
interface FormErrorProps {
  message?: string;
}

function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <Text className="text-sm text-destructive font-medium">
      {message}
    </Text>
  );
}

export {
  FormField,
  FormItem,
  FormError,
  FormLabel,
  FormDescription,
};

export type {
  FormItemProps,
  FormFieldProps,
  FormErrorProps,
};
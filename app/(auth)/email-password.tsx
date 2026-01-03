import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {  TouchableOpacity, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

import { signIn, verifyLogin } from "~/features/auth/stores/auth.slice";
import { cn } from "~/lib/utils";
import { useAppDispatch } from "../hooks";
import { SafeAreaView } from "react-native-safe-area-context";

type FormData = {
  password: string;
};

export default function EmailPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { identifier, isNewUser } = useLocalSearchParams<{
    identifier: string;
    isNewUser: string;
  }>();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: FormData) => {
    const password = data.password?.trim();
    if (!password) {
      setError("password", { message: "Vui lòng nhập mật khẩu" });
      return;
    }

    try {
      // dùng thunk signIn (email + password)
      const resultAction = await dispatch(
        verifyLogin({ email: identifier as string, password, otpCode: null, deviceInfo: null })
      );

      if (verifyLogin.rejected.match(resultAction)) {
        const payload = resultAction.payload as { message?: string } | undefined;
        setError("password", {
          message:
            payload?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
        });
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      setError("password", {
        message: err?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      });
    }
  };

  const isNew = isNewUser === "true";

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 justify-center px-6">
        {/* Title */}
        <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold text-center mb-2">
          {isNew ? "Tạo mật khẩu" : "Đăng nhập bằng mật khẩu"}
        </Text>

        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base text-center mb-8">
          Email:{" "}
          <Text className="font-semibold text-text-primary-light dark:text-text-primary-dark">
            {identifier}
          </Text>
        </Text>

        {/* Password input */}
        <View className="gap-2 mb-6">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
            Mật khẩu {isNew && "(tạo mới)"}
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <View className="flex-row items-center">
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={isNew ? "Tạo mật khẩu mới" : "Nhập mật khẩu"}
                    secureTextEntry={!showPassword}
                    className={cn(
                      "flex-1 h-14 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
                      error && "border-red-500",
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="h-14 px-4 bg-input-light dark:bg-input-dark items-center justify-center rounded-r-lg"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {error && (
                  <Text className="text-red-500 text-sm mt-1">
                    {error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        {/* Submit */}
        <Button
          onPress={handleSubmit(onSubmit)}
          className="h-14 mb-4"
          disabled={isSubmitting}
        >
          <Text className="text-white font-semibold">
            {isSubmitting
              ? isNew
                ? "Đang tạo tài khoản..."
                : "Đang đăng nhập..."
              : isNew
              ? "Tạo tài khoản"
              : "Đăng nhập"}
          </Text>
        </Button>

        {/* Quay lại */}
        <Button
          onPress={() => router.back()}
          variant="outline"
          className="h-12"
        >
          <Text className="text-primary font-medium">Quay lại</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

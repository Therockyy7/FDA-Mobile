import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {  TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { AuthService } from "~/features/auth/services/auth.service";
import { cn } from "~/lib/utils";
import { useAppDispatch } from "../hooks";
import { verifyLogin } from "~/features/auth/stores/auth.slice";

type FormData = {
  password: string;
};

export default function PhonePasswordScreen() {
  const router = useRouter();
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const [showPassword, setShowPassword] = useState(false);
const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { password: "" },
  });

  const handleLogin = async (data: FormData) => {
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

  const handleSwitchToOTP = () => {
    router.push({
      pathname: "/(auth)/phone-otp",
      params: { identifier },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 justify-center px-6">
        <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold text-center mb-4">
          Đăng nhập bằng mật khẩu
        </Text>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base text-center mb-8">
          Số điện thoại: <Text className="font-semibold">{identifier}</Text>
        </Text>

        {/* Password Input */}
        <View className="gap-2 mb-6">
          <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
            Mật khẩu
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
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={!showPassword}
                    className={cn(
                      "flex-1 h-14 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border-transparent",
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
                  <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
                )}
              </>
            )}
          />
        </View>

        {/* Error */}
        {errors?.root && (
          <Text className="text-red-500 text-center mb-6">{errors.root.message}</Text>
        )}

        {/* Submit */}
        <Button onPress={handleSubmit(handleLogin)} className="h-14 mb-4">
          <Text className="text-white font-semibold">Đăng nhập</Text>
        </Button>

        {/* Switch to OTP */}
        <TouchableOpacity onPress={handleSwitchToOTP} activeOpacity={0.7}>
          <Text className="text-primary font-medium text-center">
            Đăng nhập bằng mã OTP
          </Text>
        </TouchableOpacity>

        <Button
          onPress={() => router.back()}
          variant="outline"
          className="mt-8"
        >
          <Text className="text-primary font-medium">Quay lại</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

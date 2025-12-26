import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAuthLoading, useSignUp } from "~/features/auth/stores/hooks";
import { mapAuthError } from "~/features/auth/utils/auth-errors";
import { cn } from "~/lib/utils";
import { signUpSchema, type SignUpFormData } from "~/lib/validations";

export default function SignUpScreen() {
  const signUp = useSignUp();
  const loading = useAuthLoading();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignUpPress = async (data: SignUpFormData) => {
    const { error } = await signUp(data.emailAddress, data.password);

    if (error) {
      const errorInfo = mapAuthError(error);
      setError("root", {
        message: errorInfo.message,
      });
    } else {
      router.replace("/");
    }
  };

  const handleSignInNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.back();
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log(`Sign up with ${provider}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View className="p-4">
            <TouchableOpacity
              onPress={handleSignInNavigation}
              className="mt-5 w-10 h-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/5"
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                className="text-text-light dark:text-text-dark"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-6 pt-4 pb-8">
            {/* Header */}
            <View>
              <Text className="text-3xl font-bold text-text-light dark:text-text-dark">
                Tạo tài khoản
              </Text>
              <Text className="mt-2 text-base text-text-light/80 dark:text-text-dark/80">
                Chào mừng bạn! Vui lòng nhập thông tin để bắt đầu.
              </Text>
            </View>

            {/* Form Fields */}
            <View className="mt-10 gap-6">
              {/* Email Field */}
              <View>
                <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="emailAddress"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Nhập email của bạn"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className={cn(
                          "h-14 rounded-lg bg-white dark:bg-black/20 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-placeholder focus:border-primary dark:focus:border-primary",
                          error && "border-red-500"
                        )}
                        style={
                          error
                            ? {}
                            : {
                                shadowColor: "#3A86FF",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0,
                                shadowRadius: 0,
                              }
                        }
                      />
                      {error && (
                        <Text className="text-red-500 text-sm mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Password Field */}
              <View>
                <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">
                  Mật khẩu
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View className="relative">
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Nhập mật khẩu"
                          secureTextEntry={!showPassword}
                          className={cn(
                            "h-14 rounded-lg bg-white dark:bg-black/20 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-placeholder focus:border-primary dark:focus:border-primary pr-12",
                            error && "border-red-500"
                          )}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-14 px-4 items-center justify-center"
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#6B7280"
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

              {/* Confirm Password Field */}
              <View>
                <Text className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">
                  Xác nhận mật khẩu
                </Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View className="relative">
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Nhập lại mật khẩu"
                          secureTextEntry={!showConfirmPassword}
                          className={cn(
                            "h-14 rounded-lg bg-white dark:bg-black/20 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-placeholder focus:border-primary dark:focus:border-primary pr-12",
                            error && "border-red-500"
                          )}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-0 top-0 h-14 px-4 items-center justify-center"
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#6B7280"
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
            </View>

            {/* Error Message */}
            {errors?.root && (
              <Text className="text-red-500 text-center mt-4">
                {errors.root.message}
              </Text>
            )}

            {/* Sign Up Button */}
            <View className="mt-8">
              <View
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.07,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <Button
                  onPress={handleSubmit(onSignUpPress)}
                  disabled={loading || isSubmitting}
                  className="w-full h-14 rounded-lg bg-primary active:opacity-90"
                >
                  <Text className="text-white text-base font-bold">
                    {isSubmitting || loading ? "Đang đăng ký..." : "Đăng ký"}
                  </Text>
                </Button>
              </View>
            </View>

            {/* Divider */}
            <View className="relative mt-8 flex items-center justify-center">
              <View className="absolute inset-x-0 h-[1px] bg-border-light dark:bg-border-dark" />
              <Text className="bg-background-light dark:bg-background-dark px-4 text-sm text-text-light/80 dark:text-text-dark/80">
                Hoặc đăng ký bằng
              </Text>
            </View>

            {/* Social Login Buttons */}
            <View className="mt-6 flex-row gap-4">
              {/* Google */}
              <TouchableOpacity
                onPress={() => handleSocialLogin("google")}
                className="flex-1 h-12 flex-row items-center justify-center gap-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-transparent active:bg-black/5 dark:active:bg-white/5"
                activeOpacity={0.7}
              >
                <AntDesign name="google" size={24} color="#DB4437" />
                <Text className="text-sm font-medium text-text-light dark:text-text-dark">
                  Google
                </Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                onPress={() => handleSocialLogin("facebook")}
                className="flex-1 h-12 flex-row items-center justify-center gap-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-transparent active:bg-black/5 dark:active:bg-white/5"
                activeOpacity={0.7}
              >
                <FontAwesome name="facebook" size={24} color="#1877F2" />
                <Text className="text-sm font-medium text-text-light dark:text-text-dark">
                  Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="mt-auto pt-8 items-center">
              <Text className="text-sm text-text-light dark:text-text-dark">
                Đã có tài khoản?{" "}
                <Text
                  onPress={handleSignInNavigation}
                  className="font-bold text-primary"
                >
                  Đăng nhập
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

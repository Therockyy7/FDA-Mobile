import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { FacebookLogo, GoogleLogo } from "~/components/icons/SocialLogos";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAuthLoading, useSignIn } from "~/features/auth/stores/hooks";
import { cn } from "~/lib/utils";
import { signInSchema, type SignInFormData } from "~/lib/validations";

type AuthMode = "login" | "register";

export default function SignInScreen() {
  const signIn = useSignIn();
  const loading = useAuthLoading();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

const onSignInPress = async (data: SignInFormData) => {
    try {
      
      await signIn(data.emailAddress, data.password);

      
      router.replace("/(tabs)");
    } catch (err: any) {
     
      const message =
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
      setError("root", { message });

      
      // const errorInfo = mapAuthError(err);
      // setError("root", { message: errorInfo.message });
    }
  };

  const handleSignUpNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/sign-up");
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleSocialLogin = (provider: "google" | "facebook" | "apple") => {
    // Implement social login logic here
    console.log(`Login with ${provider}`);
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
          {/* Logo & Title */}
          <View className="items-center pt-16 pb-8 px-6">
            <View className="items-center gap-2">
              <View className="h-16 w-16 bg-primary rounded-full items-center justify-center">
                <Ionicons name="water" size={32} color="white" />
              </View>
              <Text className="text-text-primary-light dark:text-text-primary-dark text-[32px] font-bold text-center">
                Lũ An Toàn
              </Text>
            </View>
          </View>

          <View className="px-6 gap-6">
            {/* Auth Mode Toggle */}
            <View className="px-1 py-1">
              <View className="h-12 flex-row items-center justify-center rounded-lg bg-input-light dark:bg-input-dark p-1">
                <Pressable
                  onPress={() => setAuthMode("login")}
                  className={cn(
                    "flex-1 h-full items-center justify-center rounded-lg px-2",
                    authMode === "login" &&
                      "bg-background-light dark:bg-background-dark"
                  )}
                  style={
                    authMode === "login"
                      ? {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      : {}
                  }
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      authMode === "login"
                        ? "text-text-primary-light dark:text-text-primary-dark"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    )}
                  >
                    Đăng nhập
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSignUpNavigation}
                  className={cn(
                    "flex-1 h-full items-center justify-center rounded-lg px-2",
                    authMode === "register" &&
                      "bg-background-light dark:bg-background-dark"
                  )}
                  style={
                    authMode === "register"
                      ? {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      : {}
                  }
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      authMode === "register"
                        ? "text-text-primary-light dark:text-text-primary-dark"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    )}
                  >
                    Đăng ký
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Welcome Text */}
            <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold">
              Chào mừng!
            </Text>

            {/* Form Fields */}
            <View className="gap-4">
              {/* Email Field */}
              <View className="gap-2">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
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
                          "h-14 rounded-lg bg-input-light dark:bg-input-dark border-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
                          error && "border-red-500"
                        )}
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
              <View className="gap-2">
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
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
                      <View className="flex-row items-center">
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Nhập mật khẩu của bạn"
                          secureTextEntry={!showPassword}
                          className={cn(
                            "flex-1 h-14 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark pr-2",
                            error && "border-red-500"
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
            </View>

            {/* Error Message */}
            {errors?.root && (
              <Text className="text-red-500 text-center">
                {errors.root.message}
              </Text>
            )}

            {/* Sign In Button & Forgot Password */}
            <View className="items-center gap-4">
              <View
                style={{
                  width: "100%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Button
                  onPress={handleSubmit(onSignInPress)}
                  disabled={loading || isSubmitting}
                  className="w-full h-14 rounded-lg bg-primary active:opacity-90"
                >
                  <Text className="text-white text-base font-semibold">
                    {isSubmitting || loading
                      ? "Đang đăng nhập..."
                      : "Đăng nhập"}
                  </Text>
                </Button>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/forgot-password")}
              >
                <Text className="text-primary dark:text-accent text-sm font-medium">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-4 py-2">
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Hoặc tiếp tục với
              </Text>
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
            </View>

            {/* Social Login Buttons */}
            <View className="gap-3">
              {/* Google Login */}
              <TouchableOpacity
                onPress={() => handleSocialLogin("google")}
                className="w-full h-14 rounded-lg bg-background-light dark:bg-input-dark border border-border-light dark:border-border-dark flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <View className="mr-3">
                  <GoogleLogo />
                </View>
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                  Đăng nhập bằng Google
                </Text>
              </TouchableOpacity>

              {/* Facebook Login */}
              <TouchableOpacity
                onPress={() => handleSocialLogin("facebook")}
                className="w-full h-14 rounded-lg bg-background-light dark:bg-input-dark border border-border-light dark:border-border-dark flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <View className="mr-3">
                  <FacebookLogo />
                </View>
                <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                  Đăng nhập bằng Facebook
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

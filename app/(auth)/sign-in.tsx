import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import { GoogleLogo } from "~/components/icons/SocialLogos";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import ModalVerifyOTP from "~/features/auth/components/ModalVerifyOTP";
import { AuthService } from "~/features/auth/services/auth.service";
import {
  useAuthLoading,
  useSignIn,
  useVerifyPhoneLogin,
} from "~/features/auth/stores/hooks";
import { cn } from "~/lib/utils";
import { useAppDispatch } from "../hooks";

type LoginMode = "phone" | "email";

type FormData = {
  phone?: string;
  emailAddress?: string;
  password?: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useSignIn(); // email+password (Admin/Gov)
  const loading = useAuthLoading();
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<LoginMode>("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const verifyPhoneLoginFn = useVerifyPhoneLogin();
  const loginByEmailFn = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormData>({
    // Có thể dùng 2 schema khác nhau cho phone/email nếu muốn
    defaultValues: {
      phone: "",
      emailAddress: "",
      password: "",
    },
  });

  const handleSendOTP = async (data: FormData) => {
    const phone = data.phone?.trim();
    if (!phone) {
      setError("phone", { message: "Vui lòng nhập số điện thoại" });
      return;
    }

    try {
      // Gửi OTP – BE sẽ auto đăng ký USER nếu là số mới
      await AuthService.sendOTP(phone);

      setCurrentPhone(phone);
      setOtp("");
      setShowOtpModal(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.";
      setError("root", { message });
    }
  };

  const handleVerifyOtp = async () => {
    if (!currentPhone || otp.length < 4) {
      setOtpError("Vui lòng nhập đủ mã OTP");
      return;
    }

    try {
      setOtpLoading(true);
      await verifyPhoneLoginFn(currentPhone, otp);

      setShowOtpModal(false);
      setOtp("");
      router.replace("/(tabs)");
    } catch (err: any) {
      const message =
        err?.message || "Xác thực OTP thất bại. Vui lòng thử lại.";
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEmailLogin = async (data: FormData) => {
    const email = data.emailAddress?.trim() || "";
    const password = data.password || "";

    if (!email) {
      setError("emailAddress", { message: "Vui lòng nhập email" });
      return;
    }
    if (!password) {
      setError("password", { message: "Vui lòng nhập mật khẩu" });
      return;
    }

    try {
      await signIn(email, password); // hook auth cũ của bạn
      router.replace("/(tabs)");
    } catch (err: any) {
      const message =
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
      setError("root", { message });
    }
  };

  const onSubmit = (data: FormData) => {
    if (mode === "phone") {
      return handleSendOTP(data);
    }
    return handleEmailLogin(data);
  };

 const handleSocialLogin = async () => {
  try {
    const res = await AuthService.getGoogleAuthUrl();
    const { authorizationUrl } = res.data; // /api/v1/auth/google trả về
console.log("authorizationUrl:", res.data.authorizationUrl);

    await WebBrowser.openAuthSessionAsync(
      authorizationUrl,
      "fda-mobile://auth/google/callback" // redirect URI của app
    );
  } catch (e) {
    console.log("Google login error", e);
  }
};

  const isBusy = loading || isSubmitting;

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
              <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Đăng nhập để nhận cảnh báo ngập lụt
              </Text>
            </View>
          </View>

          <View className="px-6 gap-6">
            {/* Mode Toggle: Phone / Email */}
            <View className="px-1 py-1">
              <View className="h-12 flex-row items-center justify-center rounded-lg bg-input-light dark:bg-input-dark p-1">
                <Pressable
                  onPress={() => setMode("phone")}
                  className={cn(
                    "flex-1 h-full items-center justify-center rounded-lg px-2",
                    mode === "phone" &&
                      "bg-background-light dark:bg-background-dark"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      mode === "phone"
                        ? "text-text-primary-light dark:text-text-primary-dark"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    )}
                  >
                    Số điện thoại
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setMode("email")}
                  className={cn(
                    "flex-1 h-full items-center justify-center rounded-lg px-2",
                    mode === "email" &&
                      "bg-background-light dark:bg-background-dark"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      mode === "email"
                        ? "text-text-primary-light dark:text-text-primary-dark"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    )}
                  >
                    Email
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Welcome Text */}
            <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold">
              {mode === "phone"
                ? "Đăng nhập bằng số điện thoại"
                : "Đăng nhập bằng email"}
            </Text>

            {/* Form Fields */}
            <View className="gap-4">
              {mode === "phone" ? (
                // PHONE MODE
                <View className="gap-2">
                  <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                    Số điện thoại
                  </Text>
                  <Controller
                    control={control}
                    name="phone"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Ví dụ: 0912345678"
                          keyboardType="phone-pad"
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
                  <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Hệ thống sẽ gửi mã OTP để xác thực và tự tạo tài khoản USER
                    nếu bạn là người dùng mới.
                  </Text>
                </View>
              ) : (
                // EMAIL MODE (Admin/Gov)
                <>
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
                            placeholder="admin@fda.gov.vn"
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
                              placeholder="Nhập mật khẩu"
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
                </>
              )}
            </View>

            {/* Error Message */}
            {errors?.root && (
              <Text className="text-red-500 text-center">
                {errors.root.message}
              </Text>
            )}

            {/* Submit Button & Forgot Password (only email mode) */}
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
                  onPress={handleSubmit(onSubmit)}
                  disabled={isBusy}
                  className="w-full h-14 rounded-lg bg-primary active:opacity-90"
                >
                  <Text className="text-white text-base font-semibold">
                    {isBusy
                      ? mode === "phone"
                        ? "Đang gửi OTP..."
                        : "Đang đăng nhập..."
                      : mode === "phone"
                        ? "Gửi mã OTP"
                        : "Đăng nhập"}
                  </Text>
                </Button>
              </View>

              {mode === "email" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text className="text-primary dark:text-accent text-sm font-medium">
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-4 py-2">
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Hoặc tiếp tục với
              </Text>
              <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
            </View>

            {/* Social Login */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => handleSocialLogin()}
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
            </View>
          </View>

          <ModalVerifyOTP
            visible={showOtpModal}
            phone={currentPhone}
            otp={otp}
            onChangeOtp={setOtp}
            loading={otpLoading}
            onConfirm={handleVerifyOtp}
            onClose={() => {
              setShowOtpModal(false);
              setOtp("");
            }}
            error={otpError}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

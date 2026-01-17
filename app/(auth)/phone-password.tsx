// app/(auth)/phone-password.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { verifyLogin } from "~/features/auth/stores/auth.slice";
import { useColorScheme } from "~/lib/useColorScheme";
import { useAppDispatch } from "../hooks";

type FormData = {
  password: string;
};

export default function PhonePasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isDarkColorScheme } = useColorScheme();
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FormData>({
    defaultValues: { password: "" },
  });

  const handleLogin = async (data: FormData) => {
    const password = data.password?.trim();
    if (!password) {
      setError("password", { message: "Vui lòng nhập mật khẩu" });
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyLogin({ email: identifier as string, password, otpCode: null, deviceInfo: null })
      );

      if (verifyLogin.rejected.match(resultAction)) {
        const payload = resultAction.payload as { message?: string } | undefined;
        setError("password", { message: payload?.message || "Đăng nhập thất bại." });
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      setError("password", { message: err?.message || "Đăng nhập thất bại." });
    }
  };

  const handleSwitchToOTP = () => {
    router.push({
      pathname: "/(auth)/phone-otp",
      params: { identifier },
    });
  };

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    inputBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkColorScheme ? "light-content" : "dark-content"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDarkColorScheme ? ["#1E3A5F", "#0F172A"] : ["#8B5CF6", "#6366F1"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280 }}
      />

      {/* Lottie Background */}
      <LottieView
        source={require("../../assets/animations/rain-storm.json")}
        autoPlay
        loop
        speed={0.3}
        style={{
          position: "absolute",
          top: 0,
          width: "200%",
          height: 280,
          left: "-50%",
          opacity: 0.15,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          
          {/* Back Button */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={{ alignItems: "center", paddingTop: 30, paddingBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Ionicons name="phone-portrait" size={36} color="white" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "white", textAlign: "center" }}>
              Xác thực bằng mật khẩu
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
              <Ionicons name="call" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
                {identifier}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 32,
            }}
          >
            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.subtext, marginBottom: 8, marginLeft: 4 }}>
                MẬT KHẨU
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: colors.inputBg,
                        borderWidth: 1.5,
                        borderColor: error ? "#EF4444" : colors.border,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color={error ? "#EF4444" : colors.subtext} />
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={colors.subtext}
                        secureTextEntry={!showPassword}
                        style={{
                          flex: 1,
                          height: "100%",
                          marginLeft: 12,
                          fontSize: 16,
                          color: colors.text,
                          borderWidth: 0,
                          backgroundColor: "transparent",
                        }}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.subtext} />
                      </TouchableOpacity>
                    </View>
                    {error && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginLeft: 4 }}>
                        <Ionicons name="alert-circle" size={14} color="#EF4444" />
                        <Text style={{ color: "#EF4444", fontSize: 13, marginLeft: 6, fontWeight: "500" }}>{error.message}</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleLogin)}
              disabled={isSubmitting}
              activeOpacity={0.9}
              style={{
                height: 56,
                borderRadius: 16,
                overflow: "hidden",
                opacity: isSubmitting ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Ionicons name="log-in" size={20} color="white" />
                <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>
                  {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ color: colors.subtext, marginHorizontal: 12, fontSize: 13, fontWeight: "500" }}>hoặc</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            {/* Switch to OTP Button */}
            <TouchableOpacity
              onPress={handleSwitchToOTP}
              activeOpacity={0.8}
              style={{
                height: 52,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: "#8B5CF6",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                backgroundColor: isDarkColorScheme ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
              }}
            >
              <Ionicons name="keypad" size={18} color="#8B5CF6" />
              <Text style={{ color: "#8B5CF6", fontSize: 15, fontWeight: "700" }}>
                Đăng nhập bằng mã OTP
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

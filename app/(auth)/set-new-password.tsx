import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { AuthService } from "~/features/auth/services/auth.service";
import { useColorScheme } from "~/lib/useColorScheme";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ in hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await AuthService.setPassWord({
        email: email as string,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      Alert.alert("Thành công", "Mật khẩu đã được thiết lập thành công!", [
        {
          text: "Tiếp tục",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (err: any) {
      console.log(err);
      const message =
        err?.response?.data?.message ||
        "Không thể đặt mật khẩu. Vui lòng thử lại.";
      setError("root", { message });
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Bỏ qua thiết lập mật khẩu?",
      "Bạn có thể thiết lập mật khẩu sau trong phần Cài đặt.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Bỏ qua", onPress: () => router.replace("/(tabs)") },
      ],
    );
  };

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme
      ? "rgba(30, 58, 95, 0.5)"
      : "rgba(255, 255, 255, 0.9)",
    inputBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDarkColorScheme ? ["#1E3A5F", "#0F172A"] : ["#10B981", "#059669"]
        }
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Skip Button */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={handleSkip}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View
            style={{ alignItems: "center", paddingTop: 20, paddingBottom: 40 }}
          >
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
              <Ionicons name="key" size={36} color="white" />
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "white",
                textAlign: "center",
              }}
            >
              Thiết lập mật khẩu
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 6,
                fontWeight: "500",
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              Thiết lập mật khẩu để đăng nhập nhanh hơn trong những lần sau
            </Text>
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
            {/* Password Requirements Info */}
            <View
              style={{
                backgroundColor: isDarkColorScheme ? "#1E293B" : "#F0FDF4",
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "#334155" : "#BBF7D0",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkColorScheme ? "#94A3B8" : "#166534",
                  lineHeight: 18,
                }}
              >
                💡 Mật khẩu phải có ít nhất 8 ký tự, bao gồm: chữ hoa, chữ
                thường, số và ký tự đặc biệt.
              </Text>
            </View>

            {/* New Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.subtext,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                MẬT KHẨU MỚI
              </Text>
              <Controller
                control={control}
                name="newPassword"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                      <Ionicons
                        name="key-outline"
                        size={20}
                        color={error ? "#EF4444" : colors.subtext}
                      />
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor={colors.subtext}
                        secureTextEntry={!showNewPassword}
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
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name={
                            showNewPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={22}
                          color={colors.subtext}
                        />
                      </TouchableOpacity>
                    </View>
                    {error && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 8,
                          marginLeft: 4,
                        }}
                      >
                        <Ionicons
                          name="alert-circle"
                          size={14}
                          color="#EF4444"
                        />
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 13,
                            marginLeft: 6,
                            fontWeight: "500",
                          }}
                        >
                          {error.message}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.subtext,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                XÁC NHẬN MẬT KHẨU
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={error ? "#EF4444" : colors.subtext}
                      />
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor={colors.subtext}
                        secureTextEntry={!showConfirmPassword}
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
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={22}
                          color={colors.subtext}
                        />
                      </TouchableOpacity>
                    </View>
                    {error && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 8,
                          marginLeft: 4,
                        }}
                      >
                        <Ionicons
                          name="alert-circle"
                          size={14}
                          color="#EF4444"
                        />
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 13,
                            marginLeft: 6,
                            fontWeight: "500",
                          }}
                        >
                          {error.message}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Root Error */}
            {errors?.root && (
              <View
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: "#FCA5A5",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {errors.root.message}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.9}
              style={{
                height: 56,
                borderRadius: 16,
                overflow: "hidden",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
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
                <Ionicons name="shield-checkmark" size={20} color="white" />
                <Text
                  style={{ color: "white", fontSize: 17, fontWeight: "700" }}
                >
                  {isSubmitting ? "Đang xử lý..." : "Thiết lập mật khẩu"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

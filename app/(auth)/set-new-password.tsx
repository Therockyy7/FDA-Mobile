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
import { useTranslation } from "~/features/i18n";

const createPasswordSchema = (t: any) => z
  .object({
    newPassword: z
      .string()
      .min(8, t("auth.error.passwordLength"))
      .regex(/[A-Z]/, t("auth.error.passwordUpper"))
      .regex(/[a-z]/, t("auth.error.passwordLower"))
      .regex(/[0-9]/, t("auth.error.passwordNumber"))
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        t("auth.error.passwordSpecial"),
      ),
    confirmPassword: z.string().min(1, t("auth.error.confirmRequired")),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t("auth.error.confirmMismatch"),
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>;

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const passwordSchema = React.useMemo(() => createPasswordSchema(t), [t]);

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

      Alert.alert(t("common.success"), t("auth.success.passwordSet"), [
        {
          text: t("common.continue"),
          onPress: () => router.replace("/(tabs)/map"),
        },
      ]);
    } catch (err: any) {
      console.log(err);
      const message =
        err?.response?.data?.message ||
        t("auth.error.setPassword");
      setError("root", { message });
    }
  };

  const handleSkip = () => {
    Alert.alert(
      t("auth.skipPassword.title"),
      t("auth.skipPassword.desc"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.skip"), onPress: () => router.replace("/(tabs)/map") },
      ],
    );
  };

  const colors = {
    background: isDarkColorScheme ? "#0B1A33" : "#F8FAFC",
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
          isDarkColorScheme ? ["#1E3A5F", "#0B1A33"] : ["#10B981", "#059669"]
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
              <Text style={{ color: "white", fontWeight: "600" }}>{t("common.skip")}</Text>
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
              {t("auth.setPassword.title")}
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
              {t("auth.setPassword.subtitle")}
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
                {t("auth.setPassword.hint")}
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
                {t("auth.newPasswordLabel")}
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
                        placeholder={t("auth.newPasswordPlaceholder")}
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
                {t("auth.confirmPasswordLabel")}
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
                        placeholder={t("auth.confirmPasswordPlaceholder")}
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
                  {isSubmitting ? t("common.processing") : t("auth.setPassword.title")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

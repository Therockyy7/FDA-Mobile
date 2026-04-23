import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { AuthService } from "~/features/auth/services/auth.service";
import { signInByGoogle } from "~/features/auth/stores/auth.slice";
import { useAuthLoading } from "~/features/auth/stores/hooks";
import { useTranslation } from "~/features/i18n";
import { useAppDispatch } from "../hooks";

type FormData = {
  identifier: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAuthLoading();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { identifier: "" },
  });

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      // signOut() trước signIn() để force hiện picker chọn tài khoản
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      if (!tokens.idToken) throw new Error("No idToken");

      const res = await AuthService.googleMobileLogin({
        idToken: tokens.idToken,
      });
      const { accessToken, refreshToken, expiresAt, user } = res.data;

      await dispatch(
        signInByGoogle({ accessToken, refreshToken, expiresAt, user }),
      ).unwrap();
      router.replace("/(tabs)/map");
    } catch (error: any) {
      console.error("Google Login Error:", error);
      Alert.alert(t("common.error"), t("auth.googleLoginFail"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmitIdentifier = async (data: FormData) => {
    const identifier = data.identifier?.trim();
    if (!identifier) {
      setError("identifier", {
        message: t("auth.error.identifierRequired"),
      });
      return;
    }
    try {
      const res = await AuthService.checkIdentifier(identifier);
      const responseData = res.data;

      if (!responseData.success) {
        setError("root", { message: responseData.message });
        return;
      }

      if (responseData.identifierType === "phone") {
        if (responseData.requiredMethod === "otp") {
          router.push({
            pathname: "/(auth)/phone-otp",
            params: {
              identifier,
              isNewUser: (!responseData.accountExists).toString(),
            },
          });
        } else {
          router.push({
            pathname: "/(auth)/phone-password",
            params: { identifier },
          });
        }
      } else if (responseData.identifierType === "email") {
        if (!responseData.accountExists) {
          router.push({
            pathname: "/(auth)/email-otp",
            params: { identifier, isNewUser: "true" },
          });
        } else {
          router.push({
            pathname: "/(auth)/email-password",
            params: { identifier, isNewUser: "false" },
          });
        }
      }
    } catch (err: any) {
      setError("root", {
        message: err?.response?.data?.message || t("auth.error.checkAccount"),
      });
    }
  };

  const isBusy = loading || isSubmitting;

  return (
    <View style={{ flex: 1, backgroundColor: "#0B1A33" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Dark Storm Background Gradient */}
      <LinearGradient
        colors={["#0B1A33", "#1E3A5F", "#0B1A33"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View
              style={{
                alignItems: "center",
                paddingTop: 40,
                paddingBottom: 32,
              }}
            >
              {/* App Icon */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Ionicons name="water" size={40} color="#38BDF8" />
              </View>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                {t("app.name")}
              </Text>
              <Text
                style={{
                  color: "#94A3B8",
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 15,
                }}
              >
                {t("app.tagline")}
              </Text>
            </View>

            {/* Form Container */}
            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                backgroundColor: "rgba(30, 41, 59, 0.9)",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                paddingTop: 32,
                paddingBottom: 32,
              }}
            >
              {/* Title */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginBottom: 24,
                }}
              >
                {t("auth.signIn")}
              </Text>

              {/* Account Input - Pill Style */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#94A3B8",
                    marginBottom: 10,
                    marginLeft: 4,
                  }}
                >
                  {t("auth.emailOrPhone")}
                </Text>

                <Controller
                  control={control}
                  name="identifier"
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#1E293B",
                          borderRadius: 28,
                          borderWidth: 1.5,
                          borderColor: error ? "#EF4444" : "#334155",
                          paddingHorizontal: 20,
                        }}
                      >
                        <MaterialIcons
                          name="person-outline"
                          size={22}
                          color={error ? "#EF4444" : "#64748B"}
                        />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder={t("auth.emailOrPhone.placeholder")}
                          placeholderTextColor="#64748B"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={{
                            flex: 1,
                            height: 56,
                            marginLeft: 12,
                            fontSize: 16,
                            color: "#F1F5F9",
                          }}
                        />
                      </View>
                      {error && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 12,
                            marginTop: 8,
                            marginLeft: 8,
                          }}
                        >
                          {error.message}
                        </Text>
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
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#FCA5A5",
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    {errors.root.message}
                  </Text>
                </View>
              )}

              {/* Continue Button - Full Width Pill */}
              <Pressable
                onPress={handleSubmit(onSubmitIdentifier)}
                disabled={isBusy}
                style={{
                  backgroundColor: isBusy ? "#1E40AF" : "#3B82F6",
                  borderRadius: 28,
                  paddingVertical: 18,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text
                      style={{ color: "white", fontSize: 17, fontWeight: "600" }}
                    >
                      {t("common.continue")}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </Pressable>

              {/* Divider */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 24,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: "#334155" }} />
                <Text
                  style={{
                    marginHorizontal: 16,
                    color: "#64748B",
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {t("auth.orSignInWith")}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "#334155" }} />
              </View>

              {/* Google Login - Full Width Pill Button */}
              <Pressable
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 28,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  opacity: isGoogleLoading ? 0.6 : 1,
                }}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#4285F4" />
                ) : (
                  <>
                    <AntDesign name="google" size={22} color="#4285F4" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1F2937",
                        marginLeft: 12,
                      }}
                    >
                      {t("auth.continueWithGoogle")}
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Terms */}
              <View style={{ marginTop: 32, alignItems: "center" }}>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {t("auth.terms.prefix")}{" "}
                  <Text style={{ color: "#38BDF8" }}>{t("auth.terms.tos")}</Text>{" "}
                  {t("auth.terms.and")}{" "}
                  <Text style={{ color: "#38BDF8" }}>{t("auth.terms.privacy")}</Text>.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient"; // ✅ Import Gradient
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { AuthService } from "~/features/auth/services/auth.service";
import { signInByGoogle, User } from "~/features/auth/stores/auth.slice";
import { useAuthLoading } from "~/features/auth/stores/hooks";
import { cn } from "~/lib/utils";
import { useAppDispatch } from "../hooks";

type FormData = {
  identifier: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const loading = useAuthLoading();
  const dispatch = useAppDispatch();

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
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      if (!tokens.idToken) throw new Error("No idToken");

      const res = await AuthService.googleMobileLogin({ idToken: tokens.idToken });
      const { accessToken, refreshToken, expiresAt, user } = res.data;

      await dispatch(signInByGoogle({ accessToken, refreshToken, expiresAt, user })).unwrap();
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google Login Error:", error);
      Alert.alert("Lỗi", "Đăng nhập Google thất bại.");
      try { await GoogleSignin.signOut(); } catch {}
    }
  };

  const onSubmitIdentifier = async (data: FormData) => {
    const identifier = data.identifier?.trim();
    if (!identifier) {
      setError("identifier", { message: "Vui lòng nhập email hoặc số điện thoại" });
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
          router.push({ pathname: "/(auth)/phone-otp", params: { identifier, isNewUser: (!responseData.accountExists).toString() } });
        } else {
          router.push({ pathname: "/(auth)/phone-password", params: { identifier } });
        }
      } else if (responseData.identifierType === "email") {
        if (!responseData.accountExists) {
          router.push({ pathname: "/(auth)/email-otp", params: { identifier, isNewUser: "true" } });
        } else {
          router.push({ pathname: "/(auth)/email-password", params: { identifier, isNewUser: "false" } });
        }
      }
    } catch (err: any) {
      setError("root", { message: err?.response?.data?.message || "Lỗi kiểm tra tài khoản." });
    }
  };

  const isBusy = loading || isSubmitting;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Vivid Gradient */}
      <LinearGradient
        colors={["#2563EB", "#60A5FA", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '100%' }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            {/* Header Section */}
            <View className="flex-[0.4] items-center justify-center pt-8 pb-4">
              <View className="w-24 h-24 bg-white/20 rounded-[32px] items-center justify-center border border-white/30 backdrop-blur-md mb-4 shadow-xl">
                 <Ionicons name="water" size={48} color="#FFFFFF" />
              </View>
              <Text className="text-4xl font-black text-white text-center tracking-tight shadow-sm">
                Lũ An Toàn
              </Text>
              <Text className="text-blue-50 mt-2 text-center text-lg font-medium opacity-90">
                Kết nối - Cứu trợ - An toàn
              </Text>
            </View>

            {/* Form Container (Glassmorphism Card) */}
            <View className="flex-1 px-6 pt-10 pb-8 bg-white rounded-t-[40px] shadow-2xl">
              
              <View className="gap-6">
                <View>
                  <Text className="text-sm font-bold text-slate-700 ml-2 mb-2 uppercase tracking-wider">
                    Tài khoản
                  </Text>
                  
                  <Controller
                    control={control}
                    name="identifier"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <View>
                        <View className={cn(
                          "flex-row items-center h-16 rounded-2xl bg-slate-50 border border-slate-200 px-5 shadow-sm",
                          error && "border-red-500 bg-red-50"
                        )}>
                          <Ionicons name="person" size={20} color={error ? "#EF4444" : "#3B82F6"} />
                          <Input
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="SĐT hoặc Email của bạn"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 h-full ml-3 text-lg text-slate-900 font-medium border-0 bg-transparent"
                          />
                        </View>
                        {error && (
                          <Text className="text-red-500 text-sm mt-2 ml-2 font-semibold">
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                {errors?.root && (
                  <View className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <Text className="text-red-600 text-center font-medium">
                      {errors.root.message}
                    </Text>
                  </View>
                )}

                <Button
                  onPress={handleSubmit(onSubmitIdentifier)}
                  disabled={isBusy}
                  className="w-full h-16 rounded-2xl bg-primary shadow-lg shadow-blue-500/40 mt-2 flex-row justify-center items-center"
                >
                  <Text className="text-white text-xl font-bold">
                    {isBusy ? "Đang xử lý..." : "Tiếp tục"}
                  </Text>
                  {!isBusy && <Ionicons name="arrow-forward-circle" size={24} color="white" style={{ marginLeft: 8 }} />}
                </Button>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-[1px] bg-slate-200" />
                <Text className="mx-4 text-slate-400 text-sm font-semibold uppercase">Hoặc đăng nhập</Text>
                <View className="flex-1 h-[1px] bg-slate-200" />
              </View>

              {/* Social Login */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={loading}
                className="flex-row items-center justify-center h-16 rounded-2xl border border-slate-200 bg-white shadow-sm active:bg-slate-50"
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }}
                  style={{ width: 26, height: 26, marginRight: 12 }}
                  resizeMode="contain"
                />
                <Text className="text-slate-700 text-lg font-bold">
                  Tiếp tục với Google
                </Text>
              </TouchableOpacity>

              <View className="mt-8 items-center">
                 <Text className="text-slate-400 text-xs text-center px-8">
                    Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                 </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Dimensions,
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
import { signInByGoogle } from "~/features/auth/stores/auth.slice";
import { useAuthLoading } from "~/features/auth/stores/hooks";
import { useAppDispatch } from "../hooks";

const { width, height } = Dimensions.get("window");

type FormData = {
  identifier: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const loading = useAuthLoading();
  const dispatch = useAppDispatch();
  const lottieRef = useRef<LottieView>(null);

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
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dark Storm Background Gradient */}
      <LinearGradient
        colors={["#0F172A", "#1E3A5F", "#0F172A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Rain Animation Background */}
      <LottieView
        ref={lottieRef}
        source={require("../../assets/animations/rain-storm.json")}
        autoPlay
        loop
        speed={0.8}
        style={{
          position: 'absolute',
          width: width * 2,
          height: height,
          left: -width * 0.5,
          top: 0,
          opacity: 0.6,
        }}
      />

      {/* Dark Overlay for readability */}
      <View 
        style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          top: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.3)' 
        }} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            {/* Header Section */}
            <View style={{ flex: 0.35, alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingBottom: 16 }}>
              {/* App Icon with Glow Effect */}
              <View style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 30,
                elevation: 20,
              }}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 32,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  marginBottom: 16,
                }}>
                  <Ionicons name="water" size={52} color="#60A5FA" />
                </View>
              </View>
              
              <Text style={{
                fontSize: 36,
                fontWeight: '900',
                color: '#FFFFFF',
                textAlign: 'center',
                letterSpacing: -1,
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 10,
              }}>
                Lũ An Toàn
              </Text>
              <Text style={{
                color: '#94A3B8',
                marginTop: 8,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
              }}>
                Kết nối • Cứu trợ • An toàn
              </Text>
            </View>

            {/* Form Container - Glassmorphism Card */}
            <View style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 24,
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderWidth: 1,
              borderColor: 'rgba(71, 85, 105, 0.5)',
              borderBottomWidth: 0,
            }}>
              
              <View style={{ gap: 24 }}>
                {/* Account Input */}
                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#94A3B8',
                    marginLeft: 8,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                  }}>
                    Tài khoản
                  </Text>
                  
                  <Controller
                    control={control}
                    name="identifier"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <View>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: 60,
                          borderRadius: 16,
                          backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(51, 65, 85, 0.5)',
                          borderWidth: 1.5,
                          borderColor: error ? '#EF4444' : 'rgba(71, 85, 105, 0.5)',
                          paddingHorizontal: 16,
                        }}>
                          <Ionicons name="person" size={20} color={error ? "#EF4444" : "#60A5FA"} />
                          <Input
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="SĐT hoặc Email của bạn"
                            placeholderTextColor="#64748B"
                            style={{
                              flex: 1,
                              height: '100%',
                              marginLeft: 12,
                              fontSize: 16,
                              color: '#F1F5F9',
                              fontWeight: '500',
                              backgroundColor: 'transparent',
                              borderWidth: 0,
                            }}
                          />
                        </View>
                        {error && (
                          <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 8, marginLeft: 8, fontWeight: '600' }}>
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                {errors?.root && (
                  <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}>
                    <Text style={{ color: '#FCA5A5', textAlign: 'center', fontWeight: '500' }}>
                      {errors.root.message}
                    </Text>
                  </View>
                )}

                {/* Continue Button */}
                <Button
                  onPress={handleSubmit(onSubmitIdentifier)}
                  disabled={isBusy}
                  style={{
                    width: '100%',
                    height: 60,
                    borderRadius: 16,
                    backgroundColor: '#3B82F6',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
                    {isBusy ? "Đang xử lý..." : "Tiếp tục"}
                  </Text>
                  {!isBusy && <Ionicons name="arrow-forward-circle" size={24} color="white" style={{ marginLeft: 8 }} />}
                </Button>
              </View>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(71, 85, 105, 0.5)' }} />
                <Text style={{ marginHorizontal: 16, color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>
                  Hoặc
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(71, 85, 105, 0.5)' }} />
              </View>

              {/* Social Login - Icon Only */}
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  <AntDesign name="google" size={30} color="#EA4335" />
                </TouchableOpacity>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 12, fontWeight: '500' }}>
                  Đăng nhập với Google
                </Text>
              </View>

              {/* Terms */}
              <View style={{ marginTop: 32, alignItems: 'center' }}>
                <Text style={{ color: '#475569', fontSize: 11, textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 }}>
                  Bằng việc tiếp tục, bạn đồng ý với{' '}
                  <Text style={{ color: '#60A5FA' }}>Điều khoản dịch vụ</Text>
                  {' '}và{' '}
                  <Text style={{ color: '#60A5FA' }}>Chính sách bảo mật</Text>
                  {' '}của chúng tôi.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
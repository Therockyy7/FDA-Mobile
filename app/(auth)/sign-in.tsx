import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type CheckIdentifierResponse = {
  success: boolean;
  message: string;
  identifierType: "phone" | "email";
  accountExists: boolean;
  hasPassword: boolean;
  requiredMethod: "otp" | "password";
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
    watch,
  } = useForm<FormData>({
    defaultValues: {
      identifier: "",
    },
  });

  const handleGoogleLogin = async () => {
  try {
    // Check Play Services
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Sign in
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    
    if (!tokens.idToken) {
      throw new Error("Không lấy được idToken từ Google");
    }

    // Gọi API backend
    const res = await AuthService.googleMobileLogin({ 
      idToken: tokens.idToken 
    });
    
    console.log("✅ GOOGLE LOGIN SUCCESS:", res.data);

    const {
      accessToken,
      refreshToken,
      expiresAt,
      user,
    }: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: User;
    } = res.data;

    // Dispatch vào Redux store
    await dispatch(
      signInByGoogle({ 
        accessToken, 
        refreshToken, 
        expiresAt, 
        user 
      })
    ).unwrap();

    // Navigate
    router.replace("/(tabs)");
    
  } catch (error: any) {
    console.error("❌ GOOGLE LOGIN ERROR:", error);
    
    // Handle specific errors
    if (error.code === 'DEVELOPER_ERROR') {
      Alert.alert("Lỗi cấu hình", "Vui lòng kiểm tra Google Sign-In config");
    } else if (error.code === 'SIGN_IN_CANCELLED') {
      // User cancelled
    } else {
      Alert.alert("Lỗi", "Không thể đăng nhập Google. Vui lòng thử lại.");
    }
    
    // Sign out nếu cần
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore signout error
    }
  }
};

//  const handleSocialLogin = async () => {
//     try {
//       await GoogleSignin.hasPlayServices({
//         showPlayServicesUpdateDialog: true,
//       });


//       await GoogleSignin.signIn();


//       const tokens = await GoogleSignin.getTokens();
//       console.log("Google tokens:", tokens);
//       const idToken = tokens.idToken;
//       if (!idToken) {
//         throw new Error("Không lấy được idToken từ Google");
//       }


//       const res = await AuthService.googleMobileLogin({ idToken });
//       console.log("Google mobile login response:", res.data);


//       const {
//         accessToken,
//         refreshToken,
//         expiresAt,
//         user,
//       }: {
//         accessToken: string;
//         refreshToken: string;
//         expiresAt: string;
//         user: User;
//       } = res.data;


//       await dispatch(
//         signInByGoogle({ accessToken, refreshToken, expiresAt, user }),
//       ).unwrap();


//       router.replace("/(tabs)");
//     } catch (err: any) {
//       console.log("Google mobile login error", err);
//       // TODO: toast/snackbar
//     }
//   };

  const onSubmitIdentifier = async (data: FormData) => {
  const identifier = data.identifier?.trim();
  if (!identifier) {
    setError("identifier", {
      message: "Vui lòng nhập email hoặc số điện thoại",
    });
    return;
  }

  try {
    const res = await AuthService.checkIdentifier(identifier);
    const responseData = res.data as CheckIdentifierResponse;

    console.log("✅ CHECK IDENTIFIER:", responseData);
    console.log("IDENTIFIER:", identifier);

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
    // ✅ User mới: OTP qua email
    router.push({
      pathname: "/(auth)/email-otp",
      params: {
        identifier,
        isNewUser: "true",
      },
    });
  } else {
    // ✅ User cũ: password
    router.push({
      pathname: "/(auth)/email-password",
      params: {
        identifier,
        isNewUser: "false",
      },
    });
  }
}
  } catch (err: any) {
    console.error("❌ CHECK IDENTIFIER ERROR:", err);
    const message =
      err?.response?.data?.message ||
      "Không thể kiểm tra tài khoản. Vui lòng thử lại.";
    setError("root", { message });
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
                Nhập email hoặc số điện thoại để đăng nhập
              </Text>
            </View>
          </View>

          <View className="px-6 gap-6">
            {/* Identifier Input */}
            <View className="gap-2">
              <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                Email hoặc số điện thoại
              </Text>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="0912345678 hoặc email@gmail.com"
                      className={cn(
                        "h-14 rounded-lg bg-input-light dark:bg-input-dark border-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
                        error && "border-red-500",
                      )}
                    />
                    {error && (
                      <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
                    )}
                  </>
                )}
              />
              <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Hệ thống sẽ tự động gửi mã OTP hoặc yêu cầu mật khẩu tùy theo tài khoản
              </Text>
            </View>

            {/* Error chung */}
            {errors?.root && (
              <Text className="text-red-500 text-center">{errors.root.message}</Text>
            )}

            {/* Submit Button */}
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
                onPress={handleSubmit(onSubmitIdentifier)}
                disabled={isBusy}
                className="w-full h-14 rounded-lg bg-primary active:opacity-90"
              >
                <Text className="text-white text-base font-semibold">
                  {isBusy ? "Đang kiểm tra..." : "Tiếp tục"}
                </Text>
              </Button>
            </View>

            {/* Google Login */}
            <TouchableOpacity
            className="w-full h-14 rounded-lg bg-background-light dark:bg-input-dark border border-border-light dark:border-border-dark flex-row items-center justify-center gap-3"
            activeOpacity={0.7}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {/* Icon Google */}
            <View className="w-6 h-6 bg-white rounded items-center justify-center shadow-sm">
              <Ionicons name="logo-google" size={20} color="#4285F4" />
            </View>
            
            <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
              Đăng nhập bằng Google
            </Text>
          </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

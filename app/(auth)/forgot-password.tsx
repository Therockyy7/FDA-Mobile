import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { AuthService } from "~/features/auth/services/auth.service";
import { cn } from "~/lib/utils";

const forgotSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSending, setIsSending] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setIsSending(true);
      // Gọi API gửi OTP
      await AuthService.sendOTP(data.email);
      // Chuyển sang màn hình xác thực OTP
      router.push({
        pathname: "/(auth)/reset-password-otp" as any,
        params: { email: data.email },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Không thể gửi mã OTP. Vui lòng thử lại sau.";
      setError("email", { message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View className="pt-4 items-start">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                className="text-slate-900 dark:text-white"
              />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="flex-1 justify-center items-center pb-20">
            {/* Visual Icon */}
            <View className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-3xl items-center justify-center mb-8 shadow-sm">
              <Ionicons name="lock-closed" size={48} color="#3B82F6" />
            </View>

            <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Khôi phục mật khẩu
            </Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 text-center mb-10 px-4">
              Nhập email đã đăng ký. Hệ thống sẽ gửi mã OTP để xác thực cho bạn.
            </Text>

            {/* Form */}
            <View className="w-full gap-6">
              <View>
                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <View>
                      <View
                        className={cn(
                          "flex-row items-center h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4",
                          error &&
                            "border-red-500 bg-red-50 dark:bg-red-900/10",
                        )}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={22}
                          color={error ? "#EF4444" : "#64748B"}
                        />
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Nhập email của bạn"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className="flex-1 h-full ml-3 text-base text-slate-900 dark:text-white border-0 bg-transparent"
                        />
                      </View>
                      {error && (
                        <Text className="text-red-500 text-sm mt-1.5 ml-1">
                          {error.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={isSending}
                className="w-full h-14 rounded-xl bg-primary shadow-lg shadow-blue-500/30"
              >
                <Text className="text-white text-lg font-bold">
                  {isSending ? "Đang gửi..." : "Gửi mã OTP"}
                </Text>
              </Button>

              <TouchableOpacity
                onPress={() => router.back()}
                className="items-center py-2"
              >
                <Text className="text-primary font-semibold text-base">
                  Quay lại đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

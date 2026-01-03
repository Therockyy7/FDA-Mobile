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
import { cn } from "~/lib/utils";

const forgotSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Vui lòng nhập email"),
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
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setIsSending(true);

      // TODO: gọi API gửi email reset
      
      await new Promise((r) => setTimeout(r, 1000));

      router.back();
    } catch (err: any) {
      setError("email", {
        message: "Không thể gửi email khôi phục. Thử lại sau.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 mt-5"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center px-4 pt-4 pb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={8}
              className="w-9 h-9 rounded-full items-center justify-center bg-input-light dark:bg-input-dark"
            >
              <Ionicons name="chevron-back" size={20} color="#4B5563" />
            </TouchableOpacity>
            <Text className="ml-3 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Quên mật khẩu
            </Text>
          </View>

          {/* Icon + Title */}
          <View className="items-center pt-8 pb-6 px-6">
            <View className="h-16 w-16 bg-primary rounded-full items-center justify-center">
              <Ionicons name="lock-closed-outline" size={32} color="white" />
            </View>
            <Text className="mt-4 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark text-center">
              Khôi phục mật khẩu
            </Text>
            <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
              Nhập email bạn đã đăng ký. Hệ thống sẽ gửi đường dẫn để đặt lại mật khẩu.
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 mt-4 gap-4">
            <View className="gap-2">
              <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-medium">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Nhập email đã đăng ký"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className={cn(
                        "h-14 rounded-lg bg-input-light dark:bg-input-dark border-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
                        error && "border-red-500",
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

            {/* Button */}
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
                disabled={isSending}
                className="w-full h-14 rounded-lg bg-primary active:opacity-90"
              >
                <Text className="text-white text-base font-semibold">
                  {isSending ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
                </Text>
              </Button>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="mt-3 items-center"
            >
              <Text className="text-primary dark:text-accent text-sm font-medium">
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

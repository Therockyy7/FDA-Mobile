import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { verifyLogin } from "~/features/auth/stores/auth.slice";
import { cn } from "~/lib/utils";
import { useAppDispatch } from "../hooks";
import { SafeAreaView } from "react-native-safe-area-context";

type FormData = {
  password: string;
};

export default function EmailPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { identifier, isNewUser } = useLocalSearchParams<{ identifier: string; isNewUser: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FormData>({
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: FormData) => {
    const password = data.password?.trim();
    if (!password) {
      setError("password", { message: "Vui lòng nhập mật khẩu" });
      return;
    }
    try {
      const resultAction = await dispatch(verifyLogin({ email: identifier as string, password, otpCode: null, deviceInfo: null }));
      if (verifyLogin.rejected.match(resultAction)) {
        const payload = resultAction.payload as { message?: string } | undefined;
        setError("password", { message: payload?.message || "Sai mật khẩu." });
        return;
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      setError("password", { message: err?.message || "Lỗi đăng nhập." });
    }
  };

  const isNew = isNewUser === "true";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: "center" }}>
          
          <View className="mb-8 items-center">
            <View className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
              <Ionicons name={isNew ? "lock-open" : "lock-closed"} size={32} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center">
              {isNew ? "Thiết lập mật khẩu" : "Chào mừng trở lại!"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center text-base">
              {identifier}
            </Text>
          </View>

          <View className="gap-6">
            <View>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Mật khẩu
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <View>
                    <View className={cn(
                      "flex-row items-center h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4",
                      error && "border-red-500 bg-red-50 dark:bg-red-900/10"
                    )}>
                      <Ionicons name="key-outline" size={20} color={error ? "#EF4444" : "#64748B"} />
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={isNew ? "Nhập mật khẩu mới" : "Nhập mật khẩu của bạn"}
                        secureTextEntry={!showPassword}
                        className="flex-1 h-full ml-3 text-base text-slate-900 dark:text-white border-0 bg-transparent"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                    {error && (
                      <Text className="text-red-500 text-sm mt-1.5 ml-1">{error.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {!isNew && (
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} className="items-end">
                <Text className="text-primary font-semibold text-sm">Quên mật khẩu?</Text>
              </TouchableOpacity>
            )}

            <View className="gap-3 mt-4">
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-primary shadow-lg shadow-blue-500/30"
              >
                <Text className="text-white text-lg font-bold">
                  {isSubmitting ? "Đang xử lý..." : (isNew ? "Tạo tài khoản" : "Đăng nhập")}
                </Text>
              </Button>

              <Button
                onPress={() => router.back()}
                variant="ghost"
                className="h-14 rounded-xl"
              >
                <Text className="text-slate-500 dark:text-slate-400 font-semibold text-base">Quay lại</Text>
              </Button>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
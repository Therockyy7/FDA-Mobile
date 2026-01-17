import React, { useState } from "react";
import { View, TextInput, Image, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  const handlePickImage = async () => {
    // TODO: dùng expo-image-picker
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUri) return;
    // TODO: insert vào Supabase
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-4 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-semibold text-base">
            Tạo bài đăng
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            className={`px-3 py-1.5 rounded-full ${
              content.trim() || imageUri
                ? "bg-sky-600"
                : "bg-slate-300"
            }`}
            disabled={!content.trim() && !imageUri}
          >
            <Text className="text-xs font-semibold text-white">
              Đăng
            </Text>
          </TouchableOpacity>
        </View>

        {/* User row */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" />
          <View>
            <Text className="text-slate-900 dark:text-white text-sm font-semibold">
              Tên người dùng
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500">
              Công khai · Vị trí gần bạn
            </Text>
          </View>
        </View>

        {/* Content input */}
        <TextInput
          placeholder="Chia sẻ tình hình mưa lũ, mức nước, giao thông..."
          placeholderTextColor="#94A3B8"
          multiline
          value={content}
          onChangeText={setContent}
          className="min-h-[120px] text-sm text-slate-900 dark:text-slate-100"
        />

        {/* Image preview */}
        {imageUri && (
          <View className="mt-3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-64"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Tools */}
        <View className="mt-5 rounded-2xl bg-white dark:bg-slate-800 px-4 py-3">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Thêm vào bài đăng của bạn
          </Text>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={handlePickImage}
            >
              <Ionicons
                name="image-outline"
                size={20}
                color="#22C55E"
              />
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Ảnh / Video
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2">
              <Ionicons
                name="location-outline"
                size={20}
                color="#0EA5E9"
              />
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Vị trí
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2">
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#F97316"
              />
              <Text className="text-xs text-slate-700 dark:text-slate-200">
                Mức nước
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
